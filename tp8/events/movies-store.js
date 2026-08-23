export class MoviesUpdateEvent extends Event {
  static NAME = "movies:update";

  constructor(movies) {
    super(MoviesUpdateEvent.NAME, { bubbles: false });
    this.detail = { movies };
  }
}

class MoviesStore extends EventTarget {
  #last = null;

  set(movies) {
    this.#last = movies;
    this.dispatchEvent(new MoviesUpdateEvent(movies));
  }

  get() {
    return this.#last;
  }
}

export const moviesStore = new MoviesStore();
