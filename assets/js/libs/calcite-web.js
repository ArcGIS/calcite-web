/* calcite-web - v0.10.5 - 2015-07-24
*  https://github.com/esri/calcite-web
*  Copyright (c) 2015 Environmental Systems Research Institute, Inc.
*  Apache 2.0 License */
(function Calcite () {

  // ┌────────────┐
  // │ Public API │
  // └────────────┘
  // define all public api methods (excluding patterns)
  var calcite = {
    version: 'v0.10.5',
    click: click,
    addEvent: addEvent,
    removeEvent: removeEvent,
    eventTarget: eventTarget,
    preventDefault: preventDefault,
    stopPropagation: stopPropagation,
    hasClass: hasClass,
    addClass: addClass,
    removeClass: removeClass,
    toggleClass: toggleClass,
    closest: closest,
    nodeListToArray: nodeListToArray,
    init: init
  };

  // ┌──────────────────────┐
  // │ DOM Event Management │
  // └──────────────────────┘

  // returns standard interaction event, later will add touch support
  function click () {
    return 'click';
  }

  // add a callback function to an event on a DOM node
  function addEvent (domNode, e, fn) {
    if (domNode.addEventListener) {
      return domNode.addEventListener(e, fn, false);
    } else if (domNode.attachEvent) {
      return domNode.attachEvent('on' + e, fn);
    }
  }

  // remove a specific function binding from a DOM node event
  function removeEvent (domNode, e, fn) {
    if (domNode.removeEventListener) {
      return domNode.removeEventListener(e, fn, false);
    } else if (domNode.detachEvent) {
      return domNode.detachEvent('on' + e,  fn);
    }
  }

  // get the target element of an event
  function eventTarget (e) {
    return e.target || e.srcElement;
  }

  // prevent default behavior of an event
  function preventDefault (e) {
    if (e.preventDefault) {
      return e.preventDefault();
    } else if (e.returnValue) {
      e.returnValue = false;
    }
  }

  // stop and event from bubbling up the DOM tree
  function stopPropagation (e) {
    e = e || window.event;
    if (e.stopPropagation) {
      return e.stopPropagation();
    }
    if (e.cancelBubble) {
      e.cancelBubble = true;
    }
  }

  // ┌────────────────────┐
  // │ Class Manipulation │
  // └────────────────────┘

  // check if an element has a specific class
  function hasClass (domNode, className) {
    var elementClass = ' ' + domNode.className + ' ';
    return elementClass.indexOf(' ' + className + ' ') !== -1;
  }

  // add one or more classes to an element
  function addClass (domNode, classes) {
    classes.split(' ').forEach(function (c) {
      if (!hasClass(domNode, c)) {
        domNode.className += ' ' + c;
      }
    });
  }

  // remove one or more classes from an element
  function removeClass (domNode, classes) {
    var elementClass = ' ' + domNode.className + ' ';
    classes.split(' ').forEach(function (c) {
      elementClass = elementClass.replace(' ' + c + ' ', ' ');
    });
    domNode.className = elementClass.trim();
  }

  // if domNode has the class, remove it, else add it
  function toggleClass (domNode, className) {
    if (hasClass(domNode, className)) {
      removeClass(domNode, className);
    } else {
      addClass(domNode, className);
    }
  }

  // ┌─────┐
  // │ DOM │
  // └─────┘

  // returns closest element up the DOM tree matching a given class
  function closest (className, context) {
    var result, current;
    for (current = context; current; current = current.parentNode) {
      if (current.nodeType === 1 && hasClass(current, className)) {
        result = current;
        break;
      }
    }
    return current;
  }

  // turn a domNodeList into an array
  function nodeListToArray (domNodeList) {
    return Array.prototype.slice.call(domNodeList);
  }

  // ┌─────────────┐
  // │ JS Patterns │
  // └─────────────┘
  // helper functions for ui patterns

  // return an array of elements matching a query
  function findElements (query, domNode) {
    var context = domNode || document;
    var elements = context.querySelectorAll(query);
    return nodeListToArray(elements);
  }

  // remove 'is-active' class from every element in an array
  function removeActive (array) {
    if (typeof array == 'object') {
      array = nodeListToArray(array);
    }
    array.forEach(function (item) {
      removeClass(item, 'is-active');
    });
  }

  // remove 'is-active' from array, add to element
  function toggleActive (array, el) {
    var isActive = hasClass(el, 'is-active');
    if (isActive) {
      removeClass(el, 'is-active');
    } else {
      removeActive(array);
      addClass(el, 'is-active');
    }
  }

  // toggles `aria-hidde="true"` on a domNode
  function toggleAriaHidden (array) {
    array.forEach(function (node) {
      var hidden = node.getAttribute('aria-hidden');
      if (hidden !== 'true') {
        node.setAttribute('aria-hidden', true);
      } else {
        node.removeAttribute('aria-hidden');
      }
    });
  }

  // ┌───────────┐
  // │ Accordion │
  // └───────────┘
  // collapsible accordion list
  calcite.accordion = function (domNode) {

    function toggleAriaExpanded(domNode) {
      var isExpanded = domNode.getAttribute('aria-expanded');
      if (domNode.getAttribute('aria-expanded')) {
        domNode.setAttribute('aria-expanded', 'false');
      } else {
        domNode.setAttribute('aria-expanded', 'true');
      }
    }

    findElements('.js-accordion', domNode).forEach(function (accordion) {
      accordion.setAttribute('aria-live', 'polite');
      accordion.setAttribute('role', 'tablist');
      nodeListToArray(accordion.children).forEach(function (child) {
        var firstChild = child.children[0];
        firstChild.setAttribute('role', 'tab');
        firstChild.setAttribute('tabindex', '0');
        if (hasClass(child, 'is-active')) {
          child.setAttribute('aria-expanded', 'true');
        } else {
          child.setAttribute('aria-expanded', 'false');
        }
        addEvent(child, click(), toggleAccordion);
        addEvent(child, 'keyup', function(e) {
          if (e.keyCode === 13) {
            toggleAccordion(e);
          }
        });
      });
    });

    function toggleAccordion (e) {
      var parent = closest('accordion-section', eventTarget(e));
      toggleClass(parent, 'is-active');
      toggleAriaExpanded(parent);
    }
  };

  // ┌──────────┐
  // │ Dropdown │
  // └──────────┘
  // show and hide dropdown menus
  calcite.dropdown = function (domNode) {
    var toggles = findElements('.js-dropdown-toggle', domNode);
    var dropdowns = findElements('.js-dropdown', domNode);

    function closeAllDropdowns () {
      removeEvent(document.body, click(), closeAllDropdowns);
      dropdowns.forEach(function (dropdown) {
        removeClass(dropdown, 'is-active');
      });
    }

    function bindToggle (toggle) {
      addEvent(toggle, click(), function (e) {
        preventDefault(e);
        stopPropagation(e);
        var dropdown = closest('js-dropdown', toggle);
        var isOpen = hasClass(dropdown, 'is-active');
        closeAllDropdowns();
        if (!isOpen) {
          addClass(dropdown, 'is-active');
        }
        addEvent(document.body, click(), closeAllDropdowns);
      });
    }

    toggles.forEach(bindToggle);
  };

  // ┌────────┐
  // │ Drawer │
  // └────────┘
  // show and hide drawers
  calcite.drawer = function (domNode) {
    var wrapper = document.querySelector('.wrapper');
    var footer = document.querySelector('.footer');
    var toggles = findElements('.js-drawer-toggle', domNode);
    var drawers = findElements('.js-drawer', domNode);
    var lastOn;

    function fenceDrawer (e) {
      if ( !closest('js-drawer', e.target)) {
        drawers.forEach(function (drawer) {
          if (hasClass(drawer, 'is-active')) {
            drawer.focus();
          }
        });
      }
    }

    function escapeCloseDrawer (e) {
      if (e.keyCode === 27) {
        drawers.forEach(function (drawer) {
          removeClass(drawer, 'is-active');
          drawer.removeAttribute('tabindex');
        });
        toggleAriaHidden([wrapper, footer]);
        removeEvent(document, 'keyup', escapeCloseDrawer);
        removeEvent(document, 'focusin', fenceDrawer);
        lastOn.focus();
      }
    }

    function bindDrawerToggle (e) {
      preventDefault(e);
      var toggle = e.target;
      var drawerId = toggle.getAttribute('data-drawer');
      var drawer = document.querySelector('.js-drawer[data-drawer="' + drawerId + '"]');
      var isOpen = hasClass(drawer, 'is-active');

      toggleActive(drawers, drawer);
      toggleAriaHidden([wrapper, footer]);

      if (isOpen) {
        removeEvent(document, 'keyup', escapeCloseDrawer);
        removeEvent(document, 'focusin', fenceDrawer);
        lastOn.focus();
        drawer.removeAttribute('tabindex');
      } else {
        addEvent(document, 'keyup', escapeCloseDrawer);
        addEvent(document, 'focusin', fenceDrawer);

        lastOn = toggle;
        drawer.setAttribute('tabindex', 0);
        drawer.focus();
      }
    }

    toggles.forEach(function (toggle) {
      addEvent(toggle, click(), bindDrawerToggle);
    });

    drawers.forEach(function (drawer) {
      addEvent(drawer, click(), function (e) {
        if (hasClass(eventTarget(e), 'drawer')) {
          toggleActive(drawers, drawer);
          toggleAriaHidden([wrapper, footer]);
          removeEvent(document, 'keyup', escapeCloseDrawer);
        }
      });
    });
  };

  // ┌───────────────┐
  // │ Expanding Nav │
  // └───────────────┘
  // show and hide exanding nav located under topnav
  calcite.expandingNav = function (domNode) {
    var toggles = findElements('.js-expanding-toggle', domNode);
    var expanders = findElements('.js-expanding', domNode);
    var sections = document.querySelectorAll('.js-expanding-nav');

    toggles.forEach(function (toggle) {
      addEvent(toggle, click(), function (e) {
        preventDefault(e);

        var sectionId = toggle.getAttribute('data-expanding-nav');
        var section = document.querySelector('.js-expanding-nav[data-expanding-nav="' + sectionId + '"]');
        var expander = closest('js-expanding', section);
        var isOpen = hasClass(expander, 'is-active');
        var shouldClose = hasClass(section, 'is-active');

        toggleActive(sections, section);

        if (isOpen && shouldClose) {
          removeClass(expander, 'is-active');
        } else {
          addClass(expander, 'is-active');
        }
      });
    });
  };

  // ┌───────┐
  // │ Modal │
  // └───────┘
  // show and hide modal dialogues
  calcite.modal = function (domNode) {
    var wrapper = document.querySelector('.wrapper');
    var footer = document.querySelector('.footer');
    var toggles = findElements('.js-modal-toggle', domNode);
    var modals = findElements('.js-modal', domNode);
    var lastOn;

    function fenceModal (e) {
      if ( !closest('js-modal', e.target)) {
        modals.forEach(function (modal) {
          if (hasClass(modal, 'is-active')) {
            modal.focus();
          }
        });
      }
    }

    function escapeCloseModal (e) {
      if (e.keyCode === 27) {
        modals.forEach(function (modal) {
          removeClass(modal, 'is-active');
          modal.removeAttribute('tabindex');
        });
        lastOn.focus();
        toggleAriaHidden([wrapper, footer]);
        removeEvent(document, 'keyup', escapeCloseModal);
        removeEvent(document, 'focusin', fenceModal);
      }
    }

    function bindModalToggle (e) {
      preventDefault(e);
      var toggle = e.target;
      var modal;
      var modalId = toggle.getAttribute('data-modal');
      if (modalId) {
        modal = document.querySelector('.js-modal[data-modal="' + modalId + '"]');
      } else {
        modal = closest('js-modal', toggle);
      }

      var isOpen = hasClass(modal, 'is-active');
      toggleActive(modals, modal);
      toggleAriaHidden([wrapper, footer]);

      if (isOpen) {
        removeEvent(document, 'keyup', escapeCloseModal);
        removeEvent(document, 'focusin', fenceModal);
        lastOn.focus();
        modal.removeAttribute('tabindex');
      } else {
        addEvent(document, 'keyup', escapeCloseModal);
        addEvent(document, 'focusin', fenceModal);
        lastOn = toggle;
        modal.setAttribute('tabindex', 0);
        modal.focus();
      }
    }

    toggles.forEach(function (toggle) {
      addEvent(toggle, click(), bindModalToggle);
    });

    modals.forEach(function (modal) {
      addEvent(modal, click(), function (e) {
        stopPropagation(e);
        if (eventTarget(e) === modal) {
          toggleActive(modals, modal);
          toggleAriaHidden([wrapper, footer]);
          removeEvent(document, 'keyup', escapeCloseModal);
        }
      });
    });
  };

  // ┌──────┐
  // │ Tabs │
  // └──────┘
  // tabbed content pane
  calcite.tabs = function (domNode) {
    var tabs = findElements('.js-tab', domNode);
    var tabGroups = findElements('.js-tab-group', domNode);
    var tabSections = findElements('.js-tab-section', domNode);

    // set max width for each tab
    tabGroups.forEach(function (tab) {
      tab.setAttribute('aria-live', 'polite');
      tab.children[0].setAttribute('role', 'tablist');
      var tabsInGroup = tab.querySelectorAll('.js-tab');
      var percent = 100 / tabsInGroup.length;
      for (var i = 0; i < tabsInGroup.length; i++) {
        tabsInGroup[i].style.maxWidth = percent + '%';
      }
    });

    function switchTab (e) {
      preventDefault(e);

      var tab = closest('js-tab', eventTarget(e));
      var tabGroup = closest('js-tab-group', tab);
      var tabs = tabGroup.querySelectorAll('.js-tab');
      var contents = tabGroup.querySelectorAll('.js-tab-section');
      var index = nodeListToArray(tabs).indexOf(tab);

      removeActive(tabs);
      removeActive(contents);

      nodeListToArray(tabs).forEach(function (t){
        t.setAttribute('aria-expanded', false);
      });

      nodeListToArray(contents).forEach(function (c){
        c.setAttribute('aria-expanded', false);
      });

      addClass(tab, 'is-active');
      addClass(contents[index], 'is-active');

      tab.setAttribute('aria-expanded', 'true');
      contents[index].setAttribute('aria-expanded', 'true');
    }

    tabs.forEach(function (tab) {
      tab.setAttribute('aria-expanded', 'false');
      tab.setAttribute('role', 'tab');
      addEvent(tab, click(), switchTab);
      addEvent(tab, 'keyup', function(e) {
        if (e.keyCode === 13) {
          switchTab(e);
        }
      });
      tab.setAttribute('tabindex', '0');
    });

    tabSections.forEach(function (section) {
      section.setAttribute('role', 'tabpanel');
      var isOpen = hasClass(section, 'is-active');
      if (isOpen) {
        section.setAttribute('aria-expanded', 'true');
      } else {
        section.setAttribute('aria-expanded', 'false');
      }
    });
  };


  // ┌─────────────┐
  // │ Site Search │
  // └─────────────┘
  // Expanding search bar that lives in the top nav.
  calcite.siteSearch = function (domNode) {
    var searchForms = findElements('.js-site-search', domNode);

    function toggleForm (e) {
      var searchContainer = closest('js-site-search', e.target);
      var isOpen = hasClass(searchContainer, 'is-active');

      if (isOpen) {
        removeClass(searchContainer, 'is-active');
        e.target.value = '';
      } else {
        addClass(searchContainer, 'is-active');
      }
    }

    searchForms.forEach(function (search) {
      addEvent(search, 'focusin', toggleForm);
      addEvent(search, 'focusout', toggleForm);
    });
  };


  // ┌────────┐
  // │ Sticky │
  // └────────┘
  // sticks things to the window
  calcite.sticky = function () {
    var elements = findElements('.js-sticky');

    var stickies = elements.map(function (el) {
      var offset = el.offsetTop;
      var dataTop = el.getAttribute('data-top');
      return {
        active: false,
        top: offset - parseInt(dataTop, 0),
        shim: el.cloneNode('deep'),
        element: el
      };
    });

    stickies.forEach(function (item) {
      var el = item.element;
      var parent = el.parentNode;
      parent.insertBefore(item.shim, el);
      var dataTop = el.getAttribute('data-top');
      item.shim.style.top = dataTop + 'px';
      addClass(item.shim, 'is-sticky');
      item.shim.style.display = 'none';
    });

    var scrollHandler = function () {
      stickies.forEach( function (item) {
        var el = item.element;
        var offset = el.offsetTop;
        var dataTop = el.getAttribute('data-top');
        item.top = el.offsetTop - parseInt(dataTop, 0);

        if (item.top < window.pageYOffset) {
          item.shim.style.display = '';
        } else {
          item.shim.style.display = 'none';
        }
      });
    };

    scrollIntervalID = setInterval(scrollHandler, 10);
  };

  // ┌────────────────────┐
  // │ Initialize Calcite │
  // └────────────────────┘
  // start up Calcite and attach all the patterns
  // optionally pass an array of patterns you'd like to watch
  function init (patterns) {
    patterns = patterns || ['accordion', 'dropdown', 'drawer', 'expandingNav', 'modal', 'tabs', 'siteSearch', 'sticky'];
    patterns.forEach(function (pattern) {
      calcite[pattern]();
    });
  }

  // ┌────────────────┐
  // │ Expose Calcite │
  // └────────────────┘
  // make calcite available to amd, common-js, or globally
  if (typeof define === 'function' && define.amd) {
    define(function () { return calcite; });
  } else if (typeof exports === 'object') {
    module.exports = calcite;
  } else {
    // if something called calcite already exists,
    // save it for recovery via calcite.noConflict()
    var oldCalcite = window.calcite;
    calcite.noConflict = function () {
      window.calcite = oldCalcite;
      return this;
    };
    window.calcite = calcite;
  }

})();
