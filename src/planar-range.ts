import PointerTracker from 'pointer-tracker';

export interface PlanarRangeThumbValue {
  name?: string;
  x: number;
  y: number;
}

function fire(element: HTMLElement, name: string, detail?: any) {
  element.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail }));
}

export class PlanarRangeThumb extends HTMLElement {
  private _x = 1;
  private _y = 1;

  static get observedAttributes() { return ['x', 'y']; }

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
    <style>
      :host {
        display: block;
        width: 10px;
        height: 10px;
        box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
        border-radius: 50%;
        background: white;
        border: 1px solid #e5e5e5;
        transform: translate3d(-50%, -50%, 0);
        cursor: pointer;
        position: absolute;
      }
    </style>
    `;
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name === 'x') {
      this.x = +newValue;
    } else if (name === 'y') {
      this.y = +newValue;
    }
  }

  connectedCallback() {
    this.updatePosition();
  }

  private updatePosition() {
    (new Promise(() => {
      this.style.left = `${this._x * 100}%`;
      this.style.top = `${this._y * 100}%`;
    }));
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  set x(value: number) {
    value = Math.max(0, Math.min(1, value || 0));
    if (value !== this._x) {
      this._x = value;
      this.updatePosition();
    }
  }

  set y(value: number) {
    value = Math.max(0, Math.min(1, value || 0));
    if (value !== this._y) {
      this._y = value;
      this.updatePosition();
    }
  }

  get value(): [number, number] {
    return [this._x, this._y];
  }

  set value(c: [number, number]) {
    this.x = c[0];
    this.y = c[1];
  }

  setValue(v: [number, number], fireEvent: boolean) {
    const [oldx, oldy] = [this._x, this._y];
    this.value = v;
    if (fireEvent && (oldx !== this._x || oldy !== this._y)) {
      fire(this, 'change', {
        name: this.getAttribute('name') || undefined,
        x: this._x,
        y: this._y
      });
    }
  }
}

export class PlanarRange extends HTMLElement {
  private root: ShadowRoot;
  private _slot?: HTMLSlotElement;
  private _container?: HTMLDivElement;
  private thumbs: PlanarRangeThumb[] = [];
  private pointerMap = new Map<PlanarRangeThumb, PointerTracker>();

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
    this.root.innerHTML = `
    <style>
      :host {
        display: inline-block;
        width: 200px;
        height: 200px;
        border: 1px solid rgba(0,0,0,0.2);
      }
      #container {
        position: relative;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
      }

      #container planar-range-thumb,
      ::slotted(planar-range-thumb) {
        position: absolute;
      }
    </style>
    <div id="container"><slot></slot></div>
    `
  }

  private get slotElement(): HTMLSlotElement {
    if (!this._slot) {
      this._slot = this.root.querySelector('slot')!;
    }
    return this._slot;
  }

  private get container(): HTMLDivElement {
    if (!this._container) {
      this._container = this.root.querySelector('#container') as HTMLDivElement;
    }
    return this._container;
  }

  private updateThumbs() {
    const nodes = this.slotElement.assignedNodes().filter((n) => {
      return (n.nodeType === Node.ELEMENT_NODE) && ((n as HTMLElement).tagName.toLowerCase() === 'planar-range-thumb');
    });
    const thumbs: PlanarRangeThumb[] = [];
    nodes.forEach((n) => {
      const t = n as PlanarRangeThumb;
      if (this.thumbs.indexOf(t) < 0) {
        let viewAnchor = [0, 0, 0, 0];
        const tracker = new PointerTracker(t, {
          start: (_, event) => {
            event.preventDefault();
            const rect = this.container.getBoundingClientRect();
            viewAnchor = [rect.left || rect.x, rect.top || rect.y, rect.width, rect.height];
            return true;
          },
          move: (_, changedPointers) => {
            const pointer = changedPointers[0];
            if (pointer) {
              const w = viewAnchor[2];
              const h = viewAnchor[3];
              t.setValue([
                w ? ((pointer.pageX - viewAnchor[0]) / w) : 0,
                h ? ((pointer.pageY - viewAnchor[1]) / h) : 0
              ], true);
            }
          }
        });
        this.pointerMap.set(t, tracker);
      }
      thumbs.push(t);
    });
    this.thumbs = thumbs;
  }

  connectedCallback() {
    this.slotElement.addEventListener('slotchange', () => this.updateThumbs());
    this.updateThumbs();
  }

  disconnectedCallback() {
    for (const tracker of this.pointerMap.values()) {
      tracker.stop();
    }
    this.pointerMap.clear();
  }

  get values(): PlanarRangeThumbValue[] {
    return this.thumbs.map<PlanarRangeThumbValue>((thumb) => {
      return {
        x: thumb.x,
        y: thumb.y,
        name: thumb.getAttribute('name') || undefined
      };
    });
  }
}

customElements.define('planar-range-thumb', PlanarRangeThumb);
customElements.define('planar-range', PlanarRange);