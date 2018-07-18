var FxFullWidth = new function () {
    this.support = {animations: Modernizr.cssanimations};
    this.animEndEventNames = {
        'WebkitAnimation': 'webkitAnimationEnd',
        'OAnimation': 'oAnimationEnd',
        'msAnimation': 'MSAnimationEnd',
        'animation': 'animationend'
    };
    // animation end event name
    this.animEndEventName = this.animEndEventNames[ Modernizr.prefixed('animation') ];
    this.effectSel = document.getElementById('fxselect');
    this.component = document.getElementById('component');
    this.items = this.component.querySelector('ul.itemwrap').children;
    this.current = 0;
    this.itemsCount = this.items.length;
    this.nav = this.component.querySelector('nav');
    this.navNext = this.nav.querySelector('.next');
    this.navPrev = this.nav.querySelector('.prev');
    this.isAnimating = false;
    this.init = function() {
        this.hideNav();
        this.changeEffect();
        if (this.navNext.addEventListener) {
            this.navNext.addEventListener('click', function (ev) {
                ev.preventDefault();
                this.navigate('next');
            });
            this.navPrev.addEventListener('click', function (ev) {
                ev.preventDefault();
                this.navigate('prev');
            });
            this.effectSel.addEventListener('change', this.changeEffect);
        }
    };
    this.hideNav = function() {
        this.nav.style.display = 'none';
    };
    this.showNav = function() {
        this.nav.style.display = 'block';
    };
    this.changeEffect = function() {
        this.component.className = this.component.className.replace(/\bfx.*?\b/g, '');
        if (this.effectSel.selectedIndex) {
            classie.addClass(component, this.effectSel.options[ this.effectSel.selectedIndex ].value);
            this.showNav();
        }
        else {
            this.hideNav();
        }
    }
    this.navigate = function(dir) {
        if (this.isAnimating || !this.effectSel.selectedIndex)
            return false;
        this.isAnimating = true;
        var cntAnims = 0;


        var currentItem = this.items[ this.current ];

        if (dir === 'next') {
            this.current = this.current < this.itemsCount - 1 ? this.current + 1 : 0;
        }
        else if (dir === 'prev') {
            this.current = this.current > 0 ? this.current - 1 : this.itemsCount - 1;
        }

        var nextItem = this.items[ this.current ];

        var onEndAnimationCurrentItem = function () {
            if (this.removeEventListener)
            this.removeEventListener(this.animEndEventName, onEndAnimationCurrentItem);
            classie.removeClass(this, 'current');
            classie.removeClass(this, dir === 'next' ? 'navOutNext' : 'navOutPrev');
            ++cntAnims;
            if (cntAnims === 2) {
                FxFullWidth.isAnimating = false;
            }
        }

        var onEndAnimationNextItem = function () {
            if (this.removeEventListener)
            this.removeEventListener(this.animEndEventName, onEndAnimationNextItem);
            classie.addClass(this, 'current');
            classie.removeClass(this, dir === 'next' ? 'navInNext' : 'navInPrev');
            ++cntAnims;
            if (cntAnims === 2) {
                FxFullWidth.isAnimating = false;
            }
        }

        if (this.support.animations && currentItem.addEventListener) {
            currentItem.addEventListener(this.animEndEventName, onEndAnimationCurrentItem);
            nextItem.addEventListener(this.animEndEventName, onEndAnimationNextItem);
        }
        else {
            onEndAnimationCurrentItem();
            onEndAnimationNextItem();
        }

        classie.addClass(currentItem, dir === 'next' ? 'navOutNext' : 'navOutPrev');
        classie.addClass(nextItem, dir === 'next' ? 'navInNext' : 'navInPrev');
    }
};

FxFullWidth.init();