customElements.define('foliate-symbolic', class extends HTMLElement {
    static observedAttributes = ['src']
    #root = this.attachShadow({ mode: 'closed' })
    #sheet = new CSSStyleSheet()
    #img = document.createElement('img')
    constructor() {
        super()
        this.attachInternals().ariaHidden = 'true'
        this.#root.adoptedStyleSheets = [this.#sheet]
        this.#root.append(this.#img)
        this.#img.style.visibility = 'hidden'
    }
    attributeChangedCallback(_, __, val) {
        this.#img.src = val
        this.#sheet.replaceSync(`:host {
            display: inline-flex;
            background: currentColor;
            width: min-content;
            height: min-content;
            mask: url("${encodeURI(decodeURI(val))}");
        }`)
    }
})

customElements.define('foliate-scrolled', class extends HTMLElement {
    #root = this.attachShadow({ mode: 'closed' })
    constructor() {
        super()
        const sheet = new CSSStyleSheet()
        sheet.replaceSync(':host { overflow: auto }')
        this.#root.adoptedStyleSheets = [sheet]
        this.#root.append(document.createElement('slot'))
        const top = document.createElement('div')
        this.#root.prepend(top)
        const bottom = document.createElement('div')
        this.#root.append(bottom)
        const observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (entry.target === top) {
                    if (entry.isIntersecting) this.dataset.scrolledToTop = ''
                    else delete this.dataset.scrolledToTop
                }
                else {
                    if (entry.isIntersecting) this.dataset.scrolledToBottom = ''
                    else delete this.dataset.scrolledToBottom
                }
            }
            this.dispatchEvent(new Event('change'))
        }, { root: this })
        observer.observe(top)
        observer.observe(bottom)
    }
})

customElements.define('foliate-center', class extends HTMLElement {
    #root = this.attachShadow({ mode: 'closed' })
    constructor() {
        super()
        const sheet = new CSSStyleSheet()
        this.#root.adoptedStyleSheets = [sheet]
        sheet.replaceSync(`
        :host {
            --max-width: 450px;
            text-align: center;
            display: flex;
            width: 100%;
            min-height: 100%;
        }
        :host > div {
            margin: auto;
            width: min(100%, var(--max-width));
        }`)
        const div = document.createElement('div')
        div.append(document.createElement('slot'))
        this.#root.append(div)
    }
})

customElements.define('foliate-stack', class extends HTMLElement {
    #root = this.attachShadow({ mode: 'closed' })
    constructor() {
        super()
        const sheet = new CSSStyleSheet()
        this.#root.adoptedStyleSheets = [sheet]
        sheet.replaceSync(`
        ::slotted([hidden]) {
            display: none;
            visibility: hidden !important;
        }`)
        const slot = document.createElement('slot')
        slot.addEventListener('slotchange', () => this.showChild(
            this.querySelector(':scope > :not([hidden])') ?? this.children[0]))
        this.#root.append(slot)
    }
    showChild(child) {
        for (const el of this.children) el.hidden = el !== child
    }
})

customElements.define('foliate-menu', class extends HTMLElement {
    #root = this.attachShadow({ mode: 'closed' })
    #internals = this.attachInternals()
    #items = []
    constructor() {
        super()
        this.#internals.role = 'menu'
        const slot = document.createElement('slot')
        this.#root.append(slot)
        slot.addEventListener('slotchange', e => {
            const els = e.target.assignedElements()
            this.#items = els.filter(el => el.matches('[role^="menuitem"]'))
        })
        this.addEventListener('keydown', e => this.#onKeyDown(e))
    }
    setFocusPrev(el) {
        this.setFocusNext(el, this.#items.slice(0).reverse())
    }
    setFocusNext(el, items = this.#items) {
        let justFound, found
        for (const item of items) {
            if (justFound) {
                item.tabIndex = 0
                item.focus()
                found = true
                justFound = false
            }
            else {
                item.tabIndex = -1
                if (item === el) justFound = true
            }
        }
        if (!found) {
            items[0].tabIndex = 0
            items[0].focus()
        }
    }
    #onKeyDown(e) {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault()
                e.stopPropagation()
                this.setFocusPrev(e.target)
                break
            case 'ArrowDown':
                e.preventDefault()
                e.stopPropagation()
                this.setFocusNext(e.target)
                break
        }
    }
})

customElements.define('foliate-menubutton', class extends HTMLElement {
    #root = this.attachShadow({ mode: 'open' })
    #button
    #menu
    #ariaExpandedObserver = new MutationObserver(list => {
        for (const { target } of list)
            target.dispatchEvent(new Event('aria-expanded'))
    })
    #onBlur = () => this.#button ? this.#button.ariaExpanded = 'false' : null
    #onClick = e => {
        if (!this.#button) return
        const target = e.composedPath()[0]
        if (!this.contains(target) && !this.#button.contains(target) && !this.#menu.contains(target)) {
            this.#button.setAttribute('aria-expanded', 'false')
        }
    }
    constructor() {
        super()
        const sheet = new CSSStyleSheet()
        sheet.replaceSync(':host { position: relative }')
        this.#root.adoptedStyleSheets = [sheet]

        const slot = document.createElement('slot')
        this.#root.append(slot)
        slot.addEventListener('slotchange', e => {
            this.#button = e.target.assignedElements()[0]
            if (!this.#button) return
            this.#button.ariaExpanded = 'false'
            this.#button.ariaHasPopup = 'menu'

            this.#ariaExpandedObserver.observe(this.#button,
                { attributes: true, attributeFilter: ['aria-expanded'] })
            this.#button.addEventListener('click', () => {
                this.#button.ariaExpanded =
                    this.#button.ariaExpanded === 'true' ? 'false' : 'true'
            })
            this.#button.addEventListener('aria-expanded', () => {
                if (!this.#menu) return
                if (this.#button.ariaExpanded === 'true') {
                    this.#menu.hidden = false
                    this.#menu.focus()
                } else this.#menu.hidden = true
            })
        })

        const menuSlot = document.createElement('slot')
        menuSlot.name = 'menu'
        this.#root.append(menuSlot)
        menuSlot.addEventListener('slotchange', e => {
            this.#menu = e.target.assignedElements()[0]
            this.#menu.tabIndex = 0
            this.#menu.hidden = true
        })
        menuSlot.addEventListener('keydown', e => e.key === 'Escape'
            ? this.#button.ariaExpanded = 'false' : null)
    }
    connectedCallback() {
        addEventListener('blur', this.#onBlur)
        addEventListener('click', this.#onClick)
    }
    disconnectedCallback() {
        removeEventListener('blur', this.#onBlur)
        removeEventListener('click', this.#onClick)
    }
})
