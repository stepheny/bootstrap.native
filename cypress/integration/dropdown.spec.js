/// <reference types="cypress" />
import Dropdown from '../../src/components/dropdown-native';

import changeDirection from '../fixtures/changeDirection';

const bodyPads = {
  top: {paddingTop: '35vh', paddingBottom: '70vh'},
  bottom: {paddingTop: '70vh', paddingBottom: '35vh'},
  left: {paddingLeft: '22vw', paddingRight: '90vw'},
  right: {paddingLeft: '90vw', paddingRight: '22vw'},
}
const toolbarPositions = {
  start: 'btn-toolbar',
  middle: 'btn-toolbar justify-content-center',
  end: 'btn-toolbar justify-content-end',
}

describe('Dropdown Class Tests', () => {

  beforeEach(() => {
    cy.intercept('GET', 'cypress/dropdown.html').as('dropdown-page')
      .visit('cypress/dropdown.html')
  });

  it('Init without any parameters - throws error', () => {
    const args = [];
    try {
      new Dropdown(...args);
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      expect(error).to.have.property('message', `Dropdown Error: "${args[0]}" is not a valid selector.`);
    }
  });

  it('Can do toggle()', () => {
    cy.wait('@dropdown-page')
      cy.get('[data-bs-toggle="dropdown"]').each(($element, i) => {
        const element = $element[0];
        const instance = Dropdown.init(element);
        expect(instance.element, 'element').to.equal(element);
        expect(instance.menu, 'menu').to.exist;
        expect(instance.parentElement, 'parentElement').to.exist;

        expect(instance.name, 'name').to.eq('Dropdown');
        expect(instance.options, 'options').to.deep.equal({ display: 'dynamic', offset: 5 })
        expect(instance.defaults, 'defaults').to.deep.equal({ display: 'dynamic', offset: 5 });
        expect(instance.version, 'version').to.be.string;
        cy.wrap(instance).as('instance' + i);
      })
      .get('@instance0').invoke('toggle')
      .get('@instance0').its('menu').should('have.class', 'show')
      .get('@instance1').invoke('toggle')
      .get('@instance1').its('menu').should('have.class', 'show')
      .get('@instance0').its('menu').should('not.have.class', 'show')
  });

  it('Can handle keyboard navigation', () => {
    cy.wait('@dropdown-page')
      .log('can work with a **simple** markup')
      .get('[data-bs-toggle="dropdown"]').eq(1).then(($element) => {
        cy.wrap(new Dropdown($element[0])).as('instance1');
      })
      .get('@instance1').its('element').click()
      .document().trigger('keydown', { code: 'ArrowUp' }) // additional code covered
      .document().trigger('keyup', { code: 'ArrowUp' }) // additional code covered
      .get('@instance1').its('menu').should('have.class', 'show')
      .wait(17) // wait for the dropdown to show
      .get('@instance1').its('menu').find('.dropdown-item').eq(0).focus()
      .document().trigger('keydown', { code: 'ArrowUp' })
      .document().trigger('keyup', { code: 'ArrowUp' })
      .get('@instance1').its('menu').find('.dropdown-item').eq(0).should('be.focused')
      .document().trigger('keydown', { code: 'ArrowDown' })
      .document().trigger('keyup', { code: 'ArrowDown' })
      .get('@instance1').its('menu').find('.dropdown-item').eq(1).should('be.focused')
      .document().trigger('keydown', { code: 'ArrowDown' })
      .document().trigger('keyup', { code: 'ArrowDown' })
      .get('@instance1').its('menu').find('.dropdown-item').eq(2).should('be.focused')
      .document().trigger('keydown', { code: 'ArrowDown' })
      .document().trigger('keyup', { code: 'ArrowDown' })
      .get('@instance1').its('menu').find('.dropdown-item').eq(3).should('be.focused')
      .document().trigger('keydown', { code: 'ArrowDown' })
      .document().trigger('keyup', { code: 'ArrowDown' })
      .get('@instance1').its('menu').find('.dropdown-item').eq(4).should('be.focused')
      .document().trigger('keydown', { code: 'ArrowDown' })
      .document().trigger('keyup', { code: 'ArrowDown' })
      .get('@instance1').its('menu').find('.dropdown-item').eq(4).should('be.focused')
      .log('can work with a **list** markup')
      .get('[data-bs-toggle="dropdown"]').eq(3).then(($element) => {
        cy.wrap(new Dropdown($element[0])).as('instance3');
      })
      .get('@instance3').its('element').click()
      .get('@instance3').its('menu').should('have.class', 'show')
      .wait(17) // wait for the dropdown to show
      .get('@instance3').its('menu').find('.dropdown-item').eq(0).focus()
      .document().trigger('keydown', { code: 'ArrowUp' })
      .document().trigger('keyup', { code: 'ArrowUp' })
      .get('@instance3').its('menu').find('.dropdown-item').eq(0).should('be.focused')
      .document().trigger('keydown', { code: 'ArrowDown' })
      .document().trigger('keyup', { code: 'ArrowDown' })
      .get('@instance3').its('menu').find('.dropdown-item').eq(1).should('be.focused')
      .document().trigger('keydown', { code: 'ArrowDown' })
      .document().trigger('keyup', { code: 'ArrowDown' })
      .get('@instance3').its('menu').find('.dropdown-item').eq(2).should('be.focused')
      .document().trigger('keydown', { code: 'ArrowDown' })
      .document().trigger('keyup', { code: 'ArrowDown' })
      .get('@instance3').its('menu').find('.dropdown-item').eq(2).should('be.focused')
  });

  it('Can be dismissed by keyboard', () => {
    cy.wait('@dropdown-page')
      .get('[data-bs-toggle="dropdown"]').then(($element) => {
        cy.wrap(new Dropdown($element[0])).as('keyboard');
      })
      .get('@keyboard').its('element').click()
      .get('@keyboard').its('element').trigger('focus') // additional code to be covered
      .get('@keyboard').its('menu').find('.dropdown-item,input').eq(0).trigger('focus') // additional code to be covered
      .get('@keyboard').its('menu').should('have.class', 'show')
      .document().trigger('keyup', { code: 'Escape' })
      .wait(100)
      .get('@keyboard').its('menu').should('not.have.class', 'show').and('be.hidden')
      .wait(300)
  });

  it('Can do automatic position on resize', () => {
    cy.wait('@dropdown-page')
      .get('[data-bs-toggle="dropdown"]').eq(1).then(($element) => {
        const element = $element[0];
        const body = element.ownerDocument.body;
        const h3 = body.querySelector('h3');
        const toolbar = body.querySelector('.btn-toolbar');
        h3.classList.add('d-none');
        toolbar.className = toolbarPositions.middle;
        body.classList.remove('p-5');
        Object.assign(body.style, bodyPads.top);

        [...body.querySelectorAll('[data-bs-toggle="dropdown"]')].forEach((d, i) => {
          if (i !== 1) d.parentElement.classList.add('d-none');
        });

        cy.log('test **dropstart** in **middle** position').then(() => {
          element.parentElement.classList.remove('dropup');
          element.parentElement.classList.add('dropstart');
          element.innerText = 'Dropstart';

          cy.wrap(new Dropdown(element)).as('dropstart_resize')
            .get('@dropstart_resize').invoke('show')
            .get('@dropstart_resize').its('menu').should('have.class', 'show')
            .get('@dropstart_resize').its('menu.style.cssText').should('contain', 'left: auto')
          cy.viewport(200, 660);
          cy.wait(17);
          cy.window().trigger('resize');
          cy.wait(50);
          cy.get('@dropstart_resize').its('menu.style.cssText').should('contain', 'top: 100%')
          cy.wait(200);
          cy.viewport(1000, 660);
          cy.window().trigger('resize');
          cy.get('@dropstart_resize').invoke('dispose')
            .wait(100)
        })

        cy.log('test **dropend** in **middle** position').then(() => {
          element.parentElement.classList.remove('dropstart');
          element.parentElement.classList.add('dropend');
          element.innerText = 'Dropend';

          cy.wrap(new Dropdown(element)).as('dropend_resize')
            .get('@dropend_resize').invoke('show')
            .get('@dropend_resize').its('menu').should('have.class', 'show').and('be.visible')
            .get('@dropend_resize').its('menu.style.cssText').should('contain', 'left: 100%')
              // .and('contain', 'right: auto')
          cy.wait(100);
          cy.viewport(200, 660);
          cy.wait(17);
          cy.window().trigger('resize');
          cy.get('@dropend_resize').its('menu.style.cssText').should('contain', 'top: 100%')
          cy.viewport(1000, 660);
          cy.window().trigger('resize');
          cy.get('@dropend_resize').invoke('dispose')
            .wait(200)
        })
      });
  });

  it('Can do automatic position on scroll', function() {
    cy.wait('@dropdown-page')
      .get('[data-bs-toggle="dropdown"]').eq(1).then(($element) => {
        const element = $element[0];
        const body = element.ownerDocument.body;
        const h3 = body.querySelector('h3');
        const toolbar = body.querySelector('.btn-toolbar');
        h3.classList.add('d-none');
        body.classList.remove('p-5');

        [...body.querySelectorAll('[data-bs-toggle="dropdown"]')].forEach((d, i) => {
          if (i !== 1) d.parentElement.classList.add('d-none');
        });

      cy.log('test **dropup** in **topLeft** position').then(() => {
        Object.assign(body.style, bodyPads.top);

        cy.wrap(new Dropdown(element)).as('dropup_topLeft');
        cy.get('@dropup_topLeft').invoke('show')
        cy.get('@dropup_topLeft').its('menu').should('have.class', 'show').and('be.visible')
        cy.get('@dropup_topLeft').its('menu.style.cssText').should('contain', 'top: auto')
        cy.wait(200)
        cy.scrollTo('bottomLeft', {duration: 0})
        cy.wait(200)
        cy.get('@dropup_topLeft').its('menu.style.cssText').should('contain', 'top: 100%')
        cy.scrollTo('topLeft', {duration: 0})
        cy.get('@dropup_topLeft').invoke('dispose')
        cy.wait(200)
      });

      cy.log('test **dropdown** in **bottomLeft** position').then(() => {
        Object.assign(body.style, bodyPads.bottom);
        element.parentElement.classList.remove('dropup');
        element.parentElement.classList.add('dropdown');
        element.innerText = 'Dropdown';

        cy.wrap(new Dropdown(element)).as('dropdown_bottomLeft');
        cy.get('@dropdown_bottomLeft').invoke('show')
        cy.get('@dropdown_bottomLeft').its('menu').should('have.class', 'show').and('be.visible')
        cy.get('@dropdown_bottomLeft').its('menu.style.cssText').should('contain', 'top: auto')
        cy.wait(200)
        cy.scrollTo('bottomLeft', {duration: 0})
        cy.wait(200)
        cy.get('@dropdown_bottomLeft').its('menu.style.cssText').should('contain', 'top: 100%')
        cy.scrollTo('topLeft', {duration: 0})
        cy.get('@dropdown_bottomLeft').invoke('dispose')
        cy.wait(200)
      });

      cy.log('test **dropdown** in **topRight** position').then(() => {
        Object.assign(body.style, {paddingTop: '3rem', paddingBottom: '', paddingLeft: '95%', paddingRight: '10%'});
        toolbar.className = toolbarPositions.end;

        cy.wrap(new Dropdown(element)).as('dropdown_topRight');
        cy.scrollTo('topRight', {duration: 0})
        cy.wait(200)
        cy.get('@dropdown_topRight').invoke('show')
        cy.get('@dropdown_topRight').its('menu').should('have.class', 'show').and('be.visible')
        cy.get('@dropdown_topRight').its('menu.style.cssText').should('contain', 'top: 100%')
        cy.wait(200)
        cy.scrollTo('topLeft', {duration: 0})
        cy.wait(200)
        cy.get('@dropdown_topRight').its('menu.style.cssText').should('contain', 'right: 0px')
        cy.wait(200)
        cy.get('@dropdown_topRight').invoke('dispose')
        cy.wait(200)
      });

      cy.log('test **dropstart** in **topLeft** position').then(() => {
        Object.assign(body.style, {...bodyPads.left, paddingTop: '3rem', paddingBottom: ''});
        element.parentElement.classList.remove('dropdown');
        element.parentElement.classList.add('dropstart');
        element.innerText = 'Dropstart';
        toolbar.className = toolbarPositions.start;

        cy.wrap(new Dropdown(element)).as('dropstart_topLeft');
        cy.get('@dropstart_topLeft').invoke('show')
        cy.get('@dropstart_topLeft').its('menu').should('have.class', 'show').and('be.visible')
        cy.get('@dropstart_topLeft').its('menu.style.cssText').should('contain', 'left: auto')
        cy.wait(200)
        cy.scrollTo('topRight', {duration: 0})
        cy.wait(200)
        cy.get('@dropstart_topLeft').its('menu.style.cssText').should('contain', 'left: 100%')
        cy.wait(200)
        cy.scrollTo('topLeft', {duration: 0})
        cy.get('@dropstart_topLeft').invoke('dispose')
        cy.wait(200)
      });

      cy.log('test **dropend** in **topRight** position').then(() => {
        Object.assign(body.style, {...bodyPads.right, paddingTop: '3rem', paddingBottom: ''});
        element.parentElement.classList.remove('dropstart');
        element.parentElement.classList.add('dropend');
        element.innerText = 'Dropend';
        toolbar.className = toolbarPositions.end;

        cy.wrap(new Dropdown(element)).as('dropend_topRight');
        cy.get('@dropend_topRight').invoke('show')
        cy.get('@dropend_topRight').its('menu').should('have.class', 'show').and('be.visible')
        cy.get('@dropend_topRight').its('menu.style.cssText').should('contain', 'left: auto')
        cy.wait(200)
        cy.scrollTo('topRight', {duration: 0})
        cy.wait(200)
        cy.get('@dropend_topRight').its('menu.style.cssText').should('contain', 'left: 100%')
        cy.wait(200)
        cy.scrollTo('topLeft', {duration: 0})
        cy.get('@dropend_topRight').invoke('dispose')
        cy.wait(200)
      });

      cy.log('test **dropend** in **bottomLeft** position').then(() => {
        Object.assign(body.style, {paddingLeft: '5rem', paddingRight: '', paddingTop: '85vh', paddingBottom: '25vh'});
        toolbar.className = toolbarPositions.start;

        cy.wrap(new Dropdown(element)).as('dropend_bottomLeft');
        cy.scrollTo('bottomLeft', {duration: 0})
        cy.wait(200)
        cy.get('@dropend_bottomLeft').invoke('show')
        cy.get('@dropend_bottomLeft').its('menu').should('have.class', 'show').and('be.visible')
        cy.get('@dropend_bottomLeft').its('menu.style.cssText').should('not.contain', 'bottom: 0px')
        cy.wait(200)
        cy.scrollTo('topLeft', {duration: 0})
        cy.wait(200)
        cy.get('@dropend_bottomLeft').its('menu.style.cssText').should('contain', 'inset: auto auto 0px 100%')
          // .should('contain', 'bottom: 0px')
        cy.wait(200)
        cy.get('@dropend_bottomLeft').invoke('dispose')
        cy.wait(200)
      });
    })
  });

  it('Can do automatic position on scroll RTL', function() {
    cy.wait('@dropdown-page')
      .get('[data-bs-toggle="dropdown"]').eq(1).then(($element) => {
        const element = $element[0];
        changeDirection(element, 'rtl');
        const body = element.ownerDocument.body;
        const h3 = body.querySelector('h3');
        const toolbar = body.querySelector('.btn-toolbar');
        h3.classList.add('d-none');
        body.classList.remove('p-5');

        [...body.querySelectorAll('[data-bs-toggle="dropdown"]')].forEach((d, i) => {
          if (i !== 1) d.parentElement.classList.add('d-none');
        });

      cy.log('test **dropup** in **topLeft** position').then(() => {
        Object.assign(body.style, bodyPads.top);

        cy.wrap(new Dropdown(element)).as('dropup_topLeft_rtl');
        cy.get('@dropup_topLeft_rtl').invoke('show')
        cy.get('@dropup_topLeft_rtl').its('menu').should('have.class', 'show').and('be.visible')
        cy.get('@dropup_topLeft_rtl').its('menu.style.cssText').should('contain', 'top: auto')
        cy.wait(200)
        cy.scrollTo('bottomLeft', {duration: 0})
        cy.wait(200)
        cy.get('@dropup_topLeft_rtl').its('menu.style.cssText').should('contain', 'top: 100%')
        cy.scrollTo('topLeft', {duration: 0})
        cy.wait(200)
        cy.get('@dropup_topLeft_rtl').invoke('dispose')
        cy.wait(200)
      });

      cy.log('test **dropdown** in **bottomLeft** position').then(() => {
        Object.assign(body.style, bodyPads.bottom);
        element.parentElement.classList.remove('dropup');
        element.parentElement.classList.add('dropdown');
        element.innerText = 'Dropdown';

        cy.wrap(new Dropdown(element)).as('dropdown_bottomLeft_rtl');
        cy.get('@dropdown_bottomLeft_rtl').invoke('show')
        cy.get('@dropdown_bottomLeft_rtl').its('menu').should('have.class', 'show').and('be.visible')
        cy.get('@dropdown_bottomLeft_rtl').its('menu.style.cssText').should('contain', 'top: auto')
        cy.wait(200)
        cy.scrollTo('bottomLeft', {duration: 0})
        cy.wait(200)
        cy.get('@dropdown_bottomLeft_rtl').its('menu.style.cssText').should('contain', 'top: 100%')
        cy.wait(200)
        cy.scrollTo('topLeft', {duration: 0})
        cy.get('@dropdown_bottomLeft_rtl').invoke('dispose')
        cy.wait(200)
      });

      cy.log('test **dropdown** in **topLeft** position').then(() => {
        Object.assign(body.style, {paddingTop: '3rem', paddingBottom: '', paddingRight: '95%', paddingLeft: '10%'});
        toolbar.className = toolbarPositions.end;

        cy.wrap(new Dropdown(element)).as('dropdown_topLeft_rtl');
        cy.scrollTo('topRight', {duration: 0})
        cy.wait(200)
        cy.get('@dropdown_topLeft_rtl').invoke('show')
        cy.get('@dropdown_topLeft_rtl').its('menu').should('have.class', 'show').and('be.visible')
        cy.wait(200)
        cy.get('@dropdown_topLeft_rtl').its('menu.style.cssText').should('contain', 'top: 100%')
        cy.wait(200)
        cy.scrollTo('topLeft', {duration: 0})
        cy.wait(200)
        cy.get('@dropdown_topLeft_rtl').its('menu.style.cssText').should('contain', 'left: 0px')
        cy.wait(200)
        cy.get('@dropdown_topLeft_rtl').invoke('dispose')
        cy.wait(200)
      });

      cy.log('test **dropstart** in **topLeft** position').then(() => {
        Object.assign(body.style, {...bodyPads.left, paddingTop: '3rem', paddingBottom: ''});
        element.parentElement.classList.remove('dropdown');
        element.parentElement.classList.add('dropstart');
        element.innerText = 'Dropstart';
        toolbar.className = toolbarPositions.start;

        cy.wrap(new Dropdown(element)).as('dropstart_topLeft_rtl');
        cy.get('@dropstart_topLeft_rtl').invoke('show')
        cy.get('@dropstart_topLeft_rtl').its('menu').should('have.class', 'show').and('be.visible')
        cy.get('@dropstart_topLeft_rtl').its('menu.style.cssText').should('contain', 'left: 100%')
        cy.wait(200)
      });

      cy.log('test **dropend** in **topLeft** position').then(() => {
        Object.assign(body.style, {...bodyPads.left, paddingTop: '3rem', paddingBottom: ''});
        element.parentElement.classList.remove('dropstart');
        element.parentElement.classList.add('dropend');
        element.innerText = 'Dropend';
        toolbar.className = toolbarPositions.end;

        cy.wrap(new Dropdown(element)).as('dropend_topLeft_rtl');
        cy.get('@dropend_topLeft_rtl').invoke('show')
        cy.get('@dropend_topLeft_rtl').its('menu').should('have.class', 'show').and('be.visible')
        cy.get('@dropend_topLeft_rtl').its('menu.style.cssText').should('contain', 'left: 100%')
        cy.wait(200)
      });

      cy.log('test **dropend** in **bottomRight** position').then(() => {
        Object.assign(body.style, {paddingLeft: '5rem', paddingRight: '', paddingTop: '85vh', paddingBottom: '25vh'});
        toolbar.className = toolbarPositions.start;

        cy.wrap(new Dropdown(element)).as('dropend_bottomRight_rtl');
        cy.window().scrollTo('bottomLeft', {duration: 0})
        cy.wait(200)
        cy.get('@dropend_bottomRight_rtl').invoke('show')
        cy.get('@dropend_bottomRight_rtl').its('menu').should('have.class', 'show').and('be.visible')
        cy.get('@dropend_bottomRight_rtl').its('menu.style.cssText').should('not.contain', 'bottom: 0px')
        cy.wait(200)
        cy.scrollTo('topLeft', {duration: 0})
        cy.wait(200)
        cy.get('@dropend_bottomRight_rtl').its('menu.style.cssText').should('contain', 'inset: auto 100% 0px auto')
        cy.get('@dropend_bottomRight_rtl').invoke('dispose')
        cy.wait(200)
      });
    })
  });

  it('Can handle click()', () => {
    cy.wait('@dropdown-page')
      .get('[data-bs-toggle="dropdown"]').eq(1).then(($element) => {
        cy.wrap(new Dropdown($element[0])).as('click_instance');
      })
      .get('@click_instance').its('element').click()
      .get('@click_instance').its('menu').should('have.class', 'show')
      .get('@click_instance').its('element').click()
      .get('@click_instance').its('menu').should('not.have.class', 'show')
      .get('@click_instance').its('element').click()
      .get('@click_instance').its('menu').should('have.class', 'show')
      .get('@click_instance').its('menu').find('.dropdown-item').eq(0).click()
      .get('@click_instance').its('menu').should('not.have.class', 'show')
      .get('@click_instance').its('element').click()
      .get('@click_instance').its('menu').should('have.class', 'show')
      .document().its('body').click('topRight')
      .get('@click_instance').its('menu').should('not.have.class', 'show')
  });

  it('Can handle dropdown-menu-end', () => {
    cy.wait('@dropdown-page')
      .get('[data-bs-toggle="dropdown"]').eq(0).then(($element) => {
        const element = $element[0];
        const menu = element.parentElement.querySelector('.dropdown-menu');
        menu.classList.add('dropdown-menu-end');

        cy.wrap(new Dropdown(element)).as('dropdown')
          .get('@dropdown').invoke('show')
          .get('@dropdown').its('menu').should('have.class', 'show')
          .get('@dropdown').its('menu.style.cssText').should('contain', 'left: 0px');
      });
  });

  it('Can handle dropdown-menu-end RTL', () => {
    cy.wait('@dropdown-page')
      .get('[data-bs-toggle="dropdown"]').eq(0).then(($element) => {
        const element = $element[0];
        changeDirection(element, 'rtl');
        const menu = element.parentElement.querySelector('.dropdown-menu');
        menu.classList.add('dropdown-menu-end');

        cy.wrap(new Dropdown(element)).as('dropdown')
          .get('@dropdown').invoke('show')
          .get('@dropdown').its('menu').should('have.class', 'show')
          .get('@dropdown').its('menu.style.cssText').should('contain', 'right: 0px')
      });
  });

  it('Can dispose()', () => {
    cy.wait('@dropdown-page')
      .log('should work with **closed** menu').then(() => {
        cy.get('[data-bs-toggle="dropdown"]').eq(0).then(($element) => {
            const element = $element[0];
            const instance = new Dropdown(element);
            cy.wrap(instance).as('instance1');
          })
          .get('@instance1').invoke('dispose')
          .get('@instance1').its('element').should('be.null')
      })
      .log('should work with **open** menu').then(() => {
        cy.get('[data-bs-toggle="dropdown"]').eq(0).then(($element) => {
            const element = $element[0];
            const instance = new Dropdown(element);
            cy.wrap(instance).as('instance2');
          })
          .get('@instance2').invoke('show')
          .get('@instance2').its('menu').should('have.class', 'show')
          .get('@instance2').invoke('dispose')
          .get('@instance2').its('element').should('be.null')
      })
  });

  it('Can do original events - hide/hidden', function() {
    cy.wait('@dropdown-page')
      .get('[data-bs-toggle="dropdown"]').eq(1).then(($element) => {
        const element = $element[0];
        const { parentElement } = element;
        const instance = new Dropdown(element);

        parentElement.addEventListener('hide.bs.dropdown', function handleHide(e) {
          if (!element.innerText.includes('wombat')) {
            console.log(e.type + ' was prevented');
            e.preventDefault();
          } else {
            console.log(e.type + ' was fired')
          }
        })

        cy.wrap(instance).as('hide_event');
      })
      .get('@hide_event').invoke('show')
      .get('@hide_event').its('menu').should('have.class', 'show').and('be.visible')
      .get('@hide_event').invoke('hide')
      .get('@hide_event').its('menu').should('have.class', 'show').and('be.visible')
  });

  it('Can do original events - show/shown', function() {
    cy.wait('@dropdown-page')
      .get('[data-bs-toggle="dropdown"]').eq(0).then(function($element) {
        const element = $element[0];
        const { parentElement } = element;
        const instance = new Dropdown(element);

        parentElement.addEventListener('show.bs.dropdown', function handleShow(e) {
          if (!element.innerText.includes('wombat')) {
            console.log(e.type + ' was prevented');
            e.preventDefault();
          } else {
            console.log(e.type + ' was fired')
          }
        });

        cy.wrap(instance).as('show_event');
      })
      .get('@show_event').invoke('show')
      .get('@show_event').its('menu').should('not.have.class', 'show')
  });
});