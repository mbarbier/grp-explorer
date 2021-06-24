


export abstract class Component<T extends HTMLElement> {

    private _element: T;

    protected abstract build(): T;

    render() {
        let e = this.build();
        if (this._element != null) {
            this._element.parentNode.replaceChild(e, this._element);
        }
        this._element = e;
    }

    protected replaceElement(newElement: T) {
        this._element.parentNode.replaceChild(newElement, this._element);
        this._element = newElement;
    }

    get element() {
        if (this._element == null) this.render();

        return this._element;
    }
}