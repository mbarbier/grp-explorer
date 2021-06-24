
export class RefObject<T>{
    private ref: T;

    public static new<T>() {
        return new RefObject<T>();
    }

    public setRef(ref: T) {
        this.ref = ref;
    }

    get(): T {
        return this.ref;
    }
}


export class TrueJsx {


    createElement(tag: string | any, props: any, ...children: any) {

        if (typeof (tag) == "function") {
            return new tag(props)
        }

        if (typeof (tag) != "string") {
            throw new Error("Unssuported type: " + typeof (tag));
        }

        const element = document.createElement(tag);
        if (props) {
            for (const key of Object.keys(props)) {
                const value = props[key];
                if (key === "className") {
                    // JSX does not allow class as a valid name
                    element.setAttribute("class", value);
                } else if (key === "ref") {
                    value.setRef(element);
                } else if (key.startsWith("on") && typeof props[key] === "function") {
                    element.addEventListener(key.substring(2), value);
                } else {
                    // <input disable />      { disable: true }
                    // <input type="text" />  { type: "text"}
                    if (typeof value == "boolean" && value) {
                        element.setAttribute(key, "");
                    } else {
                        element.setAttribute(key, value);
                    }
                }
            }
        }

        for (const child of children) {
            this.appendChild(element, child);
        }

        return element;
    }

    appendChild(parent: HTMLElement, child: any) {
        if (child instanceof Node) {
            parent.appendChild(child);
        } else if (typeof (child) == "string") {
            let node = document.createTextNode(child);
            parent.appendChild(node);
        } else if (typeof (child) == "number") {
            let node = document.createTextNode("" + child);
            parent.appendChild(node);
        } else if (Array.isArray(child)) {
            for (const value of child) {
                this.appendChild(parent, value);
            }
        }
        else {
            console.log("TODO support adding child of type " + typeof (child));
        }
    }

    init() {
        console.debug("tjsx ready");
    }

}

export const tjsx = new TrueJsx();
(globalThis as any).tjsx = tjsx;


declare global {

    const tjsx: TrueJsx;

    namespace JSX {

        interface IntrinsicElements {
            [key: string]: any
        }

    }

}