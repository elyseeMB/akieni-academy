# ONG-GROUP-6-PROJET-1

Ce projet a été créé à des fins éducatives dans le cadre d'un projet d'équipe.

## Pre-requis:

### Etape 1 : installation de make

```bash
winget install ezwinports.make
```

### Etape 2 : installation de biome

```bash
make install
```

### Etape 3 : Extension VS Code (Recommandé)

Acceptez l'installation de l'extension Biome qui vous sera proposée.

> **Astuce :** Faites `Ctrl + Shift + P` et cherchez : **Biome: Restart LSP Server**.

### Etape 4 : check le formatage

```bash
make check
```

### Etape 5 : formater correctement

```bash
make format
```

## Workflow

### 1. Au début

Récupérer le code propre et formater l'espace de travail

```bash
make sync
```

### 2. Avant de Push (Vérifier)

Valider pour éviter les conflits d'indentation

```bash
make check
make format
```

## Structure & rôle des fichiers (explication concise)

- **Racine**: point d'entrée du site statique et outils de développement.
- **README.md**: documentation du projet (objectif, installation, workflow).
- **biome.json**: configuration de Biome (formatage / LSP).
- **Makefile**: commandes `make` pour installer, formater et vérifier (`make install`, `make format`, `make check`).
- **index.html**: page d'accueil principale.
- **components.html**: sandbox/galerie des composants réutilisables.
- **css/**: styles (point d'entrée `index.css`; `tools/` utilitaires; `components/` styles réutilisables; `sections/` styles par section).
- **ressources/img/**: images et icônes utilisées sur le site.

## Licence

Le projet est distribué sous la licence MIT. Voir le fichier `LICENSE` à la racine pour le texte complet.

## Conflicts rencontrés

Ces conflits sont apparus parce que chaque membre de l'équipe utilisait un formatage de code différent. La résolution proposée est de standardiser un format de code pour toute l'équipe et d'imposer un workflow commun (vérification/formatage avant push) pour éviter que le problème ne se reproduise.

### Conflicts 1

```html
<<<<<<< feat/section-nos-projets
        <!-- Commencer sur la version mobile (mobile-first) pour le responsive -->
        <!-- layout-base pour l'espace [padding] par default -->
<section class="layout-base">
    <div class="flex column flex-start">
        <h2>Nos Projets</h2>
        <p class="card-description">Découvrez nos quatre piliers d'intervention directe.</p>
    </div>
        <br />
    <div class="projects-grid">
        <div class="card">
            <div class="card-top">
                <div class="flex column">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="card-icon">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a44 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 01 0 7.75"/>
                    </svg>
                    <h3 class="card-title">Médiation culturelle</h3>
                    <p class="card-description">Des ateliers artistiques hebdomadaires au cœur
                    desquartiers pour favoriser l'expression citoyenne.</p>
                </div>
            </div>
            <div class="card-bottom">
                <span class="card-label">Actions de proximité</span>
            </div>
        </div>
        <div class="card">
            <div class="card-top">
                <div class="flex column">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="card-icon">
                    <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75
                    1.75 0 00-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/>
                    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
                    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
                    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
                    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
                    </svg>
                    <h3 class="card-title">Soutien à la création</h3>
                    <p class="card-description">Bourses de recherche et mise à disposition
                    d'ateliers pour les artistes émergents et confirmés.</p>
                </div>
            </div>
            <div class="card-bottom">
              <spanclass="card-label">Résidences d'artistes</span>
            </div>
        </div>
        <div class="card">
            <div class="card-top">
                <div class="flex column">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="card-icon">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>
                    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
                    </svg>
                    <h3 class="card-title">Diffusion grand public</h3>
                    <pclass="card-description">Organisation de festivals, projections en plein air et
                    concerts gratuits pour animer l'espace public.</p>
                </div>
            </div>
            <div class="card-bottom">
                <spanclass="card-label">Événementiel</span>
            </div>
        </div>
        <div class="card">
            <div class="card-top">
                <div class="flex column">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="card-icon">
                    <line x1="3" x2="21" y1="22" y2="22"/>
                    <line x1="6" x2="6" y1="18" y2="11"/>
                    <line x1="10" x2="10" y1="18" y2="11"/>
                    <line x1="14" x2="14" y1="18" y2="11"/>
                    <line x1="18" x2="18" y1="18" y2="11"/>
                    <polygon points="12 2 20 7 4 7"/>
                    </svg>
                    <h3 class="card-title">Valorisation du patrimoine</h3>
                    <p class="card-description">Visites guidées thématiques et numérisation des
                    archives locales pour préservernotre mémoire collective.</p>
                </div>
            </div>
            <div class="card-bottom">
             <spanclass="card-label">Conservation</span>
            </div>
        </div>
    </div>
</section>
<!-- Agenda -->
=======



        <section class="chiffre_section" id="actions">
              <h2>NOS ACTIONS </h2>
            <div class="base_width_small chiffre_content">
                <article>
                    <p class="small_title"> longévité</p>
                    <p class="big_title_chiffre">10 ans d'impact culturel. </p>
                </article>

                <article>
                    <p class="small_title"> Activité</p>
                    <p class="big_title_chiffre">150+ projets réalisés. </p>
                </article>

                <article>
                    <p class="small_title"> communauté</p>
                    <p class="big_title_chiffre">5 000+ bénéficiaires par ans. </p>
                </article>
            </div>

        </section>






        <!-- section des chiffres  -->





>>>>>>> main
```

### Conflits 2

```html
<<<<<<< feat/newletter
        </div>
    </div>
</section>

<!-- Agenda -->


<!-- Section newsletter -->
 <section class="layout-base newsletter-section" id="newsletter">
    <div class="base_width newsletter-content">
        <img src="ressources/img/img.png" alt="Carnet" class="newsletter-icon">

        <h2>Rejoignez le mouvement</h2>
        <p class="card-description">
            Abonnez-vous pour recevoir les invitations à nos prochains
            vernissages et événements exclusifs.
        </p>

        <form class="form__newsletter">
            <fieldset>
                <legend>Newsletter</legend>
                <div class="input-group__newsletter">
                    <input
                        class="input__newsletter"
                        id="newsletter-email"
                        name="email"
                        type="email"
                        placeholder="votre@email.com"
                        autocomplete="email"
                        required
                    >
                </div>
            </fieldset>
            <button class="button button-primary" type="submit">
                S'inscrire
            </button>
        </form>
    </div>
</section>
=======
        </section>
>>>>>>> main
    </main>
```

### Conflict 3

```html
<<<<<<< feat/form
    <link rel="stylesheet" href="css/tools/layout.css">
    <link rel="stylesheet" href="css/sections/form.css">
=======
    <link rel="stylesheet" href="css/sections/newsletter.css">
>>>>>>> main
</head>

<<<<<<< feat/form
        </div>
    </div>
</section>
<!-- Agenda -->
 <!-- Début section NOUS CONTACTER : Grâsty Ghyvet SAMBA DINAULT -->
  <section class="layout-base section form-section">
    <div class="form-grid">
    <div class="flex column">
        <form method="post" class="form">
            <h2 class="sustain-title">NOUS CONTACTER</h2>
            <div class="input-group">
                <label for="fullname" class="input-label">NOM COMPLET</label>
                <input class="input" type="text" name="fullname" id="fullname" placeholder="Votre nom ici" required minlength="2">
            </div>
            <div class="input-group">
                <label for="professional-mail" class="input-label" >E-MAIL PROFESSIONNEL</label>
                <input class="input" type="email" name="professional-mail" id="professional-mail" placeholder="contact@domaine.com" required>
            </div>
            <div class="input-group">
                <label for="message" class="input-label">MESSAGE</label>
                <textarea class="textarea" name="message" id="message" required minlength="5" placeholder="Comment pouvons-nous collaborer ?"></textarea>
            </div>
            <div>
                <button class="button button-primary">ENVOYER LA DEMANDE</button>
            </div>
        </form>
    </div>
    <div class="flex column sustain">
        <div class="flex sustain-item">
            <h2 class="sustain-title">Soutenir Akieni Academy</h2>
            <p>Votre soutien finance nos ateliers gratuits et permet l'accès à la culture pour les publics les plus fragiles.</p>
        </div>
        <div class="flex sustain-group-btn">
            <button class="button button-secondary">15€</button>
            <button class="button button-secondary">30€</button>
            <button class="button button-secondary">Montant libre</button>
        </div>
        <div class="flex">
            <button class="button button-secondary sustain-submit-btn">SOUTENIR LE PROJET</button>
        </div>
        <div class="sustain-badge">
            <span></span>
            <p>Paiement 100% sécurisé</p>
        </div>
    </div>
    </div>
  </section>
 <!-- Fin Section NOUS CONTACTER -->
=======
        </section>

>>>>>>> main
```

```

```
