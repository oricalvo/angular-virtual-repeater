import {
    Component, Directive, ElementRef, EmbeddedViewRef, forwardRef, Host, Inject, Input, TemplateRef, ViewChild,
    ViewContainerRef,
    ViewRef
} from "@angular/core";

export class VirtualService {
    private listeners: VirtualListener[] = [];

    init: boolean;
    all: any[];
    items: any[];
    size: number;
    top: number;

    constructor() {
        this.init = false;
        this.top = 0;
        this.all = null;
        this.items = null;
        this.size = 0;
    }

    onScroll($event) {
        const down = $event.wheelDelta >= 0;

        if(down) {
            if(this.top == 0) {
                return;
            }

            this.top--;
        }
        else {
            if(this.top == this.all.length - 1) {
                return;
            }

            this.top++;
        }

        this.calcItems();

        this.emit(l => l.vsOnScroll());
    }

    register(listener: VirtualListener) {
        this.listeners.push(listener);

        if(this.init) {
            listener.vsOnInit();
        }
    }

    unregister(listener: VirtualListener) {
        const index = this.listeners.indexOf(listener);
        if(index != -1) {
            this.listeners.splice(index, 1);
        }
    }

    onAllChanged(all: any[]) {
        this.all = all;

        this.calcItems();

        this.ensureInit();
    }

    private ensureInit() {
        if(this.calcInit()) {
            for(let l of this.listeners) {
                this.emit(l => l.vsOnInit());
            }
        }
    }

    private calcInit() {
        if(this.init) {
            return true;
        }

        return this.init = this.all && this.items && this.size>0;
    }

    onSizeChanged(size: number) {
        this.size = size;

        this.emit(l => l.vsOnSizeChanged());
    }

    private calcItems() {
        this.items = (this.all ? this.all.slice(this.top, this.top + this.size) : []);
    }

    private emit(func: (l:VirtualListener)=>void) {
        for(let l of this.listeners) {
            func(l);
        }
    }
}

@Directive({
    selector: "[virtualFor]",
})
export class VirtualForDirective implements VirtualListener {
    @Input("virtualForOf") items: any[];

    private views: EmbeddedViewRef<any>[];

    constructor(private element: ElementRef,
                private viewContainerRef: ViewContainerRef,
                private templateRef: TemplateRef<any>,
                private service: VirtualService) {
        this.views = [];
    }

    ngOnInit() {
        this.service.register(this);
    }

    ngOnChanges() {
        this.service.onAllChanged(this.items);
    }

    vsOnInit() {
        for(let item of this.service.items) {
            const context = {
                $implicit: item,
            };

            const view = this.viewContainerRef.createEmbeddedView(this.templateRef, context);

            this.views.push(view);
        }
    }

    vsOnAllChanged() {
    }

    vsOnScroll() {
        for(let i=0; i<this.service.items.length; i++) {
            this.views[i].context.$implicit = this.service.items[i];
        }
    }

    vsOnSizeChanged() {
        if(this.service.size == this.views.length) {
            return;
        }

        if(this.service.size < this.views.length) {
            for(let i=this.service.size; i<this.views.length; i++) {
                this.views[i].destroy();
            }

            this.views.splice(this.service.size, this.views.length-this.service.size);
        }
        else {
            for(let i=this.views.length; i<this.service.size; i++) {
                const context = {
                    $implicit: this.service.items[i]
                };

                const view = this.viewContainerRef.createEmbeddedView(this.templateRef, context);

                this.views.push(view);
            }
        }
    }
}

@Directive({
    selector: "[virtualHost]",
    exportAs: "virtualHost",
})
export class VirtualHostDirective {
    @Input("virtualHostSize") public size: number;

    private handler;

    constructor(private element: ElementRef, private service: VirtualService) {
        this.handler = $event => this.onMouseWheel($event);
    }

    ngOnInit() {
        this.element.nativeElement.addEventListener("mousewheel", this.handler);
    }

    ngOnChanges() {
        this.service.onSizeChanged(this.size);
    }

    ngOnDestroy() {
        this.element.nativeElement.removeEventListener("mousewheel", this.handler);
    }

    onMouseWheel($event) {
        this.service.onScroll($event);
    }
}

@Component({
    selector: "virtual-scroll",
    template: `<div #inner class="inner"></div>`,
    styles: [
        `:host {
            display: inline-block;
            overflow-y: scroll;
            height: 20em;
            background-color: blue;
            box-sizing: border-box;
        }
        
        .inner {
            
        }`
    ]
})
export class VirtualScrollComponent implements VirtualListener {
    @ViewChild("inner") inner: any;

    constructor(private element: ElementRef, private service: VirtualService) {
    }

    ngOnInit() {
        this.service.register(this);
    }

    vsOnInit() {
        this.inner.style.height = ((this.element.nativeElement.clientHeight/this.service.size) * this.service.all.length) + "px";
    }

    vsOnScroll() {
    }

    vsOnAllChanged() {
    }

    vsOnSizeChanged() {
    }
}

export interface VirtualListener {
    vsOnInit();
    vsOnScroll();
    vsOnSizeChanged();
    vsOnAllChanged();
}
