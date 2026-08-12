/**
 * Forme finale d'un step résolu, une fois toute la chaîne construite.
 * @template {Record<string, any>} M
 * @template {Extract<keyof M, string>} E
 * @template {M[E] extends Record<string, any> ? Extract<keyof M[E], string> : never} K
 * @typedef {{
 *   importer: () => Promise<M>,
 *   exportName: E,
 *   method: K,
 *   args: M[E][K] extends (...args: infer A) => any ? A : never,
 *   eventName: string
 * }} ResolvedStep
 */

/**
 * Construit l'objet final d'un step et le rattache à un eventName.
 * @param {Object} params
 * @param {() => Promise<any>} params.importer
 * @param {string} params.exportName
 * @param {string} params.method
 * @param {Array<unknown>} params.args
 * @returns {{ on: (eventName: string) => Object }}
 */
function eventListener({ importer, exportName, method, args }) {
  return {
    on(eventName) {
      return { importer, exportName, method, args, eventName };
    },
  };
}

/**
 * Attache les arguments à passer à la méthode, ou permet de les omettre
 * en appelant directement `.on(...)` si la méthode n'en a pas besoin.
 * @param {Object} params
 * @param {() => Promise<any>} params.importer
 * @param {string} params.exportName
 * @param {string} params.method
 * @returns {{
 *   args: (...args: Array<unknown>) => { on: (eventName: string) => Object },
 *   on: (eventName: string) => Object
 * }}
 */
function handler({ importer, exportName, method }) {
  return {
    args(...args) {
      return eventListener({ importer, exportName, method, args });
    },
    on(eventName) {
      return eventListener({ importer, exportName, method, args: [] }).on(
        eventName,
      );
    },
  };
}

/**
 * Définit un step typé pour `loadSteps`, avec autocomplétion en cascade :
 * exportName → method → args (optionnel) → eventName.
 *
 * @template {Record<string, any>} M
 * @template {Extract<keyof M, string>} E
 * @param {() => Promise<M>} importer
 * @param {E} exportName
 * @returns {{
 *   method: <K extends M[E] extends Record<string, any> ? Extract<keyof M[E], string> : never>(
 *     method: K
 *   ) => {
 *     args: (...args: M[E][K] extends (...args: infer A) => any ? A : never) => {
 *       on: (eventName: string) => ResolvedStep<M, E, K>
 *     },
 *     on: (eventName: string) => ResolvedStep<M, E, K>
 *   }
 * }}
 *
 * @example
 * defineStep(() => import("./api/use-products.js"), "useProductsApi")
 *   .method("getByCategories")
 *   .args(CATEGORY_SLUGS)
 *   .on("product:all")
 *
 * @example
 * defineStep(() => import("./api/use-categories.js"), "useCategoriesApi")
 *   .method("getAll")
 *   .on("category:all")
 */
export function defineStep(importer, exportName) {
  return {
    method: (method) => {
      return handler({ importer, exportName, method });
    },
  };
}

/**
 * Exécute une étape unique : lazy-import du module, résolution de
 * l'export/méthode ciblés, appel avec les arguments fournis, puis
 * dispatch d'un CustomEvent avec le résultat.
 *
 * @param {Object} params
 * @param {() => Promise<Record<string, any>>} params.importer
 * @param {string} params.exportName
 * @param {string} params.method
 * @param {Array<unknown>} [params.args]
 * @param {string} params.eventName
 * @returns {Promise<void>}
 */
async function runStep({ importer, exportName, method, args = [], eventName }) {
  const module = await importer();
  const target = module[exportName];

  if (!target || typeof target[method] !== "function") {
    throw new Error(
      `Méthode "${method}" introuvable sur l'export "${exportName}"`,
    );
  }

  const result = await target[method](...args);

  window.dispatchEvent(
    new CustomEvent(eventName, {
      detail: result,
      bubbles: true,
      composed: true,
    }),
  );
}

/**
 * Charge des modules en lazy loading, exécute leur méthode et dispatch
 * un CustomEvent par étape. Peut s'exécuter en séquentiel ou en parallèle.
 *
 * @param {Object} config
 * @param {Array<ResolvedStep<any, any, any>>} config.steps
 * @param {"sequential" | "parallel"} [config.mode]
 * @returns {Promise<void>}
 *
 * @throws {Error} Si une importation, une méthode ou un dispatch échoue
 */
export async function loadSteps({ steps, mode = "sequential" }) {
  try {
    if (mode === "parallel") {
      await Promise.all(steps.map(runStep));
    } else {
      for (const step of steps) {
        await runStep(step);
      }
    }
  } catch (error) {
    console.error("[loadSteps] Error :", error);
    window.dispatchEvent(
      new CustomEvent("data:error", {
        detail: { error: error.message },
        bubbles: true,
        composed: true,
      }),
    );
    throw error;
  }
}

/**
 * @param {Array<Parameters<typeof loadSteps>[0]>} configs
 */
export async function loadStepGroups(configs) {
  for (const config of configs) {
    await loadSteps(config);
  }
}
