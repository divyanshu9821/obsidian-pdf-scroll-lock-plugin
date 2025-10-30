const { Plugin } = require('obsidian')

const lockedIcon = `<svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 16C2 13.1716 2 11.7574 2.87868 10.8787C3.75736 10 5.17157 10 8 10H16C18.8284 10 20.2426 10 21.1213 10.8787C22 11.7574 22 13.1716 22 16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16Z" stroke="#1C274C" stroke-width="3"/><path d="M6 10V8C6 4.68629 8.68629 2 12 2C15.3137 2 18 4.68629 18 8V10" stroke="#1C274C" stroke-width="3" stroke-linecap="round"/></svg>`
const unlockedIcon = `<svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 16C2 13.1716 2 11.7574 2.87868 10.8787C3.75736 10 5.17157 10 8 10H16C18.8284 10 20.2426 10 21.1213 10.8787C22 11.7574 22 13.1716 22 16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16Z" stroke="#1C274C" stroke-width="3"/><path d="M6 10V8C6 4.68629 8.68629 2 12 2" stroke="#1C274C" stroke-width="3" stroke-linecap="round"/></svg>`

function updateTheme() {
    const isDark = document.body.classList.contains('theme-dark');
    const strokeColor = isDark ? '#FFFFFF' : '#1C274C';
    document.querySelectorAll('.scroll-toggle-btn svg path')
        .forEach(p => p.setAttribute('stroke', strokeColor));
}

function setLockingMechanism(element) {
    const container = element.querySelector('.pdf-viewer-container')
    const toolbar = element.querySelector('.pdf-toolbar-left')

    if (!toolbar || !container) return
    if (element.querySelector('.scroll-toggle-btn')) return

    const button = document.createElement("button")
    button.innerHTML = lockedIcon
    // button.innerHTML = "🔒"
    button.style.fontSize = "1rem"
    button.style.padding = "0px"
    button.style.background = "none"
    button.style.opacity = "0.6"
    button.style.boxShadow = "none"
    button.setAttribute('aria-label', "toggle scrolling")

    button.classList.add('scroll-toggle-btn') // helpful in handling duplicacy
    container.classList.add('scroll-toggled-container') // helpful at the time of unloading the plugin

    let locked = false

    function toggle() {
        locked = !locked
        container.style.overflow = locked ? "hidden" : "auto"
        container.style.pointerEvents = locked ? "none" : "auto";
        button.innerHTML = locked ? lockedIcon : unlockedIcon
    }

    toggle()

    button.addEventListener("click", toggle)
    toolbar.prepend(button)

    updateTheme();
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

        this.registerEvent(
            this.app.workspace.on('css-change', () => {
                updateTheme();
            })
        );


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