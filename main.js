const { Plugin } = require('obsidian')

function setLockingMechanism(element) {
    const container = element.querySelector('.pdf-viewer-container')
    const toolbar = element.querySelector('.pdf-toolbar-left')

    if (!toolbar || !container) return
    if (element.querySelector('.scroll-toggle-btn')) return

    const button = document.createElement("button")
    button.textContent = "🔒"
    button.style.fontSize = "1rem"
    button.style.padding = "0px"
    button.style.background = "none"
    button.style.opacity = "0.6"
    button.setAttribute('aria-label', "toggle scrolling")

    button.classList.add('scroll-toggle-btn') // helpful in handling duplicacy
    container.classList.add('scroll-toggled-container') // helpful at the time of unloading the plugin

    let locked = false

    function toggle() {
        locked = !locked
        container.style.overflow = locked ? "hidden" : "auto"
        container.style.pointerEvents = locked ? "none" : "auto";
        button.textContent = locked ? "🔒" : "🔓"
    }

    toggle()

    button.addEventListener("click", toggle)
    toolbar.prepend(button)
}

function removeLockingMechanism() {
    document.querySelectorAll('.scroll-toggle-btn').forEach(element => {
        element.remove()
    });

    document.querySelectorAll('.scroll-toggled-container').forEach(element => {
        element.style.overflow = 'auto'
        element.style.pointerEvents = "auto";
        element.classList.remove('scroll-toggled-container')
    })
}


module.exports = class LockPDF extends Plugin {

    onload() {
        document.querySelectorAll('.pdf-embed').forEach(setLockingMechanism)

        this.observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType == 1 && node.classList.contains('pdf-container')) {
                        setLockingMechanism(node.parentElement)
                    }
                })
            })
        })
        this.observer.observe(document.body, { childList: true, subtree: true })
    }

    onunload() {
        this.observer.disconnect()
        removeLockingMechanism()
    }

}