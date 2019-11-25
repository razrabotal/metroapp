
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(html, anchor = null) {
            this.e = element('div');
            this.a = anchor;
            this.u(html);
        }
        m(target, anchor = null) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(target, this.n[i], anchor);
            }
            this.t = target;
        }
        u(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        p(html) {
            this.d();
            this.u(html);
            this.m(this.t, this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const colors = {
        red: "#d22531",
        blue: "#2060ba",
        green: "#41a747",
        text: "#09303b",
        textDisable: "#9c98a6"
    };

    const stations = [
        {
          id: "0",
          style: 'transform: translate(511px, 79px)',
          text: `Перемога`,
          stop: '<path d="M501 80V59h-42v21h42z" /><path d="M445 80V59h42v21h-42z" />',
          path: '<path d="M473 68v116" />',
          color: colors.green
        },
        {
          id: "1",
          style: 'transform: translate(510px, 193px)',
          text: `Олексiївська`,
          stop: '<path d="M501 195v-21h-42v21h42z" />',
          path: '<path d="M473 184v116" />',
          color: colors.green
        },
        {
          id: "2",
          style: 'transform: translate(512px, 309px)',
          text: `23 Серпня`,
          stop: '<path d="M501 310v-21h-42v21h42z" />',
          path: '<path d="M473 300v114" />',
          color: colors.green
        },
        {
          id: "3",
          style: 'transform: translate(511px, 423px)',
          text: `Ботанiчний сад`,
          stop: '<path d="M501 425v-21h-42v21h42z" />',
          path: '<path d="M473 414v32a60 60 0 0017 42l104 104" />',
          color: colors.green
        },
        {
          id: "4",
          style: 'transform: translate(623px, 563px)',
          text: `Наукова`,
          stop: '<path d="M621 580l-14-15-30 30 7 7 7 7 30-30z" />',
          path: '<path d="M594 592l138 138" />',
          color: colors.green
        },
        {
          id: "5",
          style: 'transform: translate(438px, 777px)',
          text: `Держпром`,
          stop: '<use width="15.9" height="13.3" transform="matrix(4.45 0 0 4.45 702 706.8)" xlink:href="#w" />',
          path: '<path d="M732 730l218 218" />',
          color: colors.green
        },
        {
          id: "6",
          style: 'transform: translate(978px, 869px)',
          text: `Архiтектора <tspan x="0" y="49">Бекетова</tspan>`,
          stop: '<path d="M977 936l-14-15-30 30 7 7 8 7 29-29z" />',
          path: '<path d="M950 948l28 28c31 31 30 55 0 85l-28 28" />',
          color: colors.green
        },
        {
          id: "7",
          style: 'transform: translate(981px, 1152px)',
          text: `Захисникiв <tspan x="0" y="49">України</tspan>`,
          stop: '<path d="M963 1116l14-14-29-30-8 7-7 7 30 30z" />',
          path: '<path d="M950 1089l-219 219" />',
          color: colors.green
        }, 
        {
          id: "8",
          style: 'transform: translate(291px, 1298px)',
          text: `Метробудiвникiв`,
          stop: '<use width="15.9" height="13.3" transform="matrix(4.45 0 0 -4.45 702 1330.5)" xlink:href="#w" />',
          path: '',
          color: colors.green
        },
        {
          id: "9",
          style: 'transform: translate(1111px, 78px)',
          text: `Героїв праці`,
          stop: '<path d="M1101 80V59h-42v21h42z" /><path d="M1045 80V59h42v21h-42z" />',
          path: '<path d="M1073 174V68" />',
          color: colors.blue
        },
        {
          id: "10",
          style: 'transform: translate(1110px, 184px)',
          text: `Студентська`,
          stop: '<path d="M1101 185v-21h-42v21h42z" />',
          path: '<path d="M1073 299V174" />',
          color: colors.blue
        },
        {
          id: "11",
          style: 'transform: translate(1111px, 284px)',
          text: `Академiка <tspan x="0" y="49">Павлова</tspan>`,
          stop: '<path d="M1101 310v-21h-42v21h42z" />',
          path: '<path d="M1073 425V299" />',
          color: colors.blue
        }, 
        {
          id: "12",
          style: 'transform: translate(1110px, 434px)',
          text: `Академiка <tspan x="0" y="49">Барабашова</tspan>`,
          stop: '<path d="M1101 435v-20h-42v20h42z" />',
          path: '<path d="M1010 534l45-46a60 60 0 0018-42v-21" />',
          color: colors.blue
        },
        {
          id: "13",
          style: 'transform: translate(1033px, 596px)',
          text: `Київська`,
          stop: '<path d="M1024 559l15-14-30-30-7 7-8 7 30 30z" />',
          path: '<path d="M923 620l87-86" />',
          color: colors.blue
        },
        {
          id: "14",
          style: 'transform: translate(944px, 686px)',
          text: `Пушкiнська`,
          stop: '<path d="M935 648l15-14-30-30-7 7-8 7 30 30z" />',
          path: '<path d="M811 733l112-113" />',
          color: colors.blue
        },

        {
          id: "15",
          style: "transform: translate(856px, 779px);",
          text: 'Унiверситет',
          stop: '<use width="15.9" height="13.3" transform="rotate(180 421.7 383) scale(4.45)" xlink:href="#w" />',
          path: '<path d="M561 983l250-250" />',
          color: colors.blue
        },
        {
          id: "16",
          style: "stroke: #fff; stroke-linejoin: round; stroke-width: 10px; paint-order: stroke; transform: translate(609px, 954px);", 
          text: 'Iсторичний <tspan x="0" y="49">музей</tspan>',
          stop: '<use width="15.9" height="13.3" transform="rotate(90 -175.4 772.2) scale(4.45)" xlink:href="#w" />',
          path: '',
          color: colors.blue
        },
        
        {
          id: "17",
          style: 'transform: translate(43px, 703px)',
          text: `Холодна <tspan x="97" y="49">гора</tspan>`,
          stop: '<path d="M261 683v20h42v-20h-42z" /><path d="M317 683v20h-42v-20h42z" />',
          path: '<path d="M349 842l-42-42a60 60 0 01-18-42v-63" />',
          color: colors.red
        },
        {
          id: "18",
          style: 'transform: translate(63px, 882px)',
          text: `Пiвденний <tspan x="88" y="49">вокзал</tspan>`,
          stop: '<path d="M324 857l14 14 30-29-7-8-8-7-30 30z" />',
          path: '<path d="M467 961L353 846" />',
          color: colors.red
        },
        {
          id: "19",
          style: 'transform: translate(116px, 1022px)',
          text: `Центральний <tspan x="177" y="49">ринок</tspan>`,
          stop: '<path d="M441 974l15 15 29-30-7-7-7-7-30 29z" />',
          path: '<path d="M564 1057l-97-96" />',
          color: colors.red
        },
        {
          id: "20",
          style: "stroke: #fff; stroke-linejoin: round; stroke-width: 10px; paint-order: stroke; transform: translate(605px, 1071px);", 
          text: `Майдан <tspan x="0" y="49">Конституції</tspan>`,
          stop: '<use width="15.9" height="13.3" transform="rotate(-90 813.4 275.5) scale(4.45)" xlink:href="#w" />',
          path: '',
          color: colors.red
        },

        {
          id: "21",
          style: 'transform: translate(198px, 1210px)',
          text: `Проспект Гагарiна`,
          stop: '<path d="M654 1187l15 15 29-30-7-7-7-8-30 30z" />',
          path: '<path d="M680 1173l-116-116" /> <path d="M811 1305l-131-132" />',
          color: colors.red
        },
        {
          id: "22",
          style: 'transform: translate(850px, 1298px)',
          text: `Спортивна`,
          stop: '<use width="15.9" height="13.3" transform="rotate(180 421.7 665.3) scale(4.45)" xlink:href="#w" />',
          path: '',
          color: colors.red
        },
        {
          id: "23",
          style: 'transform: translate(954px, 1390px)',
          text: `Завод iм. Малишева`,
          stop: '<path d="M953 1407l-14-14-30 29 7 8 8 7 29-30z" />',
          path: '<path d="M926 1419l-115-114" />',
          color: colors.red
        }, 
        {
          id: "24",
          style: 'transform: translate(1052px, 1498px)',
          text: `Турбоатом`,
          stop: '<path d="M1052 1506l-14-14-30 29 7 8 8 7 29-30z"></path>',
          path: '<path d="M1026 1519l-100-100" />',
          color: colors.red
        },
        {
          id: "25",
          style: 'transform: translate(1111px, 1629px)',
          text: 'Палац спорту',
          stop: '<path d="M1101 1630v-21h-42v21h42z"/>',
          path: '<path d="M1073 1619v-28a60 60 0 00-18-42l-29-30" />',
          color: colors.red
        },
        {
          id: "26",
          style: 'transform: translate(1111px, 1728px)',
          text: `Армiйська`,
          stop: '<path d="M1101 1729v-21h-42v21h42z" />',
          path: '<path d="M1073 1718v-99" />',
          color: colors.red
        },
        {
          id: "27",
          style: 'transform: translate(1111px, 1831px)',
          text: `Iменi <tspan x="0" y="49">Масельського</tspan>`,
          stop: '<path d="M1101 1849v-21h-42v21h42z" />',
          path: '<path d="M1073 1839v-121" />',
          color: colors.red
        },
        {
          id: "28",
          style: 'transform: translate(1111px, 1971px)',
          text: `Тракторний <tspan x="0" y="49">завод</tspan>`,
          stop: '<path d="M1101 1972v-21h-42v21h42z" />',
          path: '<path d="M1073 1962v-124" />',
          color: colors.red
        },
        {
          id: "29",
          style: 'transform: translate(1112px, 2108px)',
          text: `Iндустрiальна`,
          stop: '<path d="M1101 2109v-20h-42v20h42z" /><path d="M1045 2109v-20h42v20h-43z" />',
          path: '<path d="M1073 2097v-135" />',
          color: colors.red
        }
      ];

    /* src\SchemeRender.svelte generated by Svelte v3.12.1 */

    const file = "src\\SchemeRender.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.station = list[i];
    	child_ctx.index = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.station = list[i];
    	child_ctx.index = i;
    	return child_ctx;
    }

    // (99:0) {#if resultPath}
    function create_if_block(ctx) {
    	var div, aside, t;

    	let each_value_1 = ctx.stationsPath;

    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	var if_block = (ctx.showScheme) && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			aside = element("aside");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(aside, "class", "svelte-zinluk");
    			add_location(aside, file, 102, 0, 1954);
    			attr_dev(div, "class", "container svelte-zinluk");
    			add_location(div, file, 100, 0, 1927);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, aside);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(aside, null);
    			}

    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    		},

    		p: function update(changed, ctx) {
    			if (changed.stationsPath) {
    				each_value_1 = ctx.stationsPath;

    				let i;
    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(aside, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_1.length;
    			}

    			if (ctx.showScheme) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			destroy_each(each_blocks, detaching);

    			if (if_block) if_block.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(99:0) {#if resultPath}", ctx });
    	return block;
    }

    // (105:4) {#if station}
    function create_if_block_4(ctx) {
    	var div, html_tag, raw_value = ctx.station.text + "", t, dispose;

    	function mouseover_handler() {
    		return ctx.mouseover_handler(ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			html_tag = new HtmlTag(raw_value, t);
    			add_location(div, file, 105, 6, 2030);
    			dispose = listen_dev(div, "mouseover", mouseover_handler);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			html_tag.m(div);
    			append_dev(div, t);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.stationsPath) && raw_value !== (raw_value = ctx.station.text + "")) {
    				html_tag.p(raw_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_4.name, type: "if", source: "(105:4) {#if station}", ctx });
    	return block;
    }

    // (104:2) {#each stationsPath as station, index}
    function create_each_block_1(ctx) {
    	var if_block_anchor;

    	var if_block = (ctx.station) && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.station) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1.name, type: "each", source: "(104:2) {#each stationsPath as station, index}", ctx });
    	return block;
    }

    // (113:0) {#if showScheme}
    function create_if_block_1(ctx) {
    	var svg, defs, symbol, path0, path1, path2, g0, text0, t0, text1, t1, text2, t2, g1, g2, text3, t3, text4, t4;

    	var if_block = (ctx.resultPath.length) && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			symbol = svg_element("symbol");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			g0 = svg_element("g");
    			text0 = svg_element("text");
    			t0 = text("Холодногірсько-заводська лінія\r\n      ");
    			text1 = svg_element("text");
    			t1 = text("Салтівська лінія\r\n      ");
    			text2 = svg_element("text");
    			t2 = text("Олексіївська лінія\r\n      ");
    			g1 = svg_element("g");
    			if (if_block) if_block.c();
    			g2 = svg_element("g");
    			text3 = svg_element("text");
    			t3 = text("Державiнська");
    			text4 = svg_element("text");
    			t4 = text("Одеська");
    			attr_dev(path0, "fill", "#fff");
    			attr_dev(path0, "d", "M6.6 11.5a4.9 4.9 0 110-9.8A4.8 4.8 0 019.7 3a9.7 9.7 0 004.5\r\n          2v3.5a9.7 9.7 0 00-3.9 1.6l-.9.6a4.8 4.8 0 01-2.8 1z");
    			add_location(path0, file, 122, 8, 2389);
    			attr_dev(path1, "d", "M6.7 3.5a3 3 0 012 .7 11.5 11.5 0 003.7 2V7a11.4 11.4 0 00-3.1\r\n          1.6l-.9.6a3 3 0 01-1.8.6 3.1 3.1 0 110-6.3m0-3.5A6.6 6.6 0 000 6.6a6.6\r\n          6.6 0 006.6 6.7 6.5 6.5 0 003.8-1.3l.9-.6a8 8 0 014.6-1.4V3.3a8 8 0\r\n          01-5-1.8A6.5 6.5 0 006.6 0z");
    			add_location(path1, file, 126, 8, 2571);
    			attr_dev(symbol, "id", "w");
    			add_location(symbol, file, 121, 6, 2364);
    			add_location(defs, file, 120, 4, 2350);
    			attr_dev(path2, "fill", "none");
    			attr_dev(path2, "stroke", ctx.colors.green);
    			attr_dev(path2, "stroke-width", "3");
    			attr_dev(path2, "d", "M747 1310l-18-18-241 241a72 72 0 00-21 51v85h-15v21h56v-21h-16v-85a47\r\n      47 0 0114-34l46-45 12 12 15-15-12-12z");
    			add_location(path2, file, 134, 4, 2895);
    			attr_dev(text0, "fill", ctx.colors.red);
    			attr_dev(text0, "transform", "rotate(-90 1562.5 515.7)");
    			add_location(text0, file, 142, 6, 3135);
    			attr_dev(text1, "fill", ctx.colors.blue);
    			attr_dev(text1, "transform", "rotate(-90 700.6 -347.6)");
    			add_location(text1, file, 145, 6, 3259);
    			attr_dev(text2, "fill", ctx.colors.green);
    			attr_dev(text2, "transform", "rotate(-90 415.7 -32.8)");
    			add_location(text2, file, 148, 6, 3370);
    			attr_dev(g0, "font-size", "34");
    			add_location(g0, file, 141, 4, 3109);
    			attr_dev(g1, "fill", ctx.colors.text);
    			attr_dev(g1, "font-size", "53");
    			add_location(g1, file, 152, 4, 3491);
    			attr_dev(text3, "transform", "translate(573 1556)");
    			add_location(text3, file, 180, 6, 4294);
    			attr_dev(text4, "transform", "translate(519 1690)");
    			add_location(text4, file, 181, 6, 4359);
    			attr_dev(g2, "fill", ctx.colors.textDisable);
    			attr_dev(g2, "font-size", "53");
    			add_location(g2, file, 179, 4, 4242);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "class", "map svelte-zinluk");
    			attr_dev(svg, "font-family", "Tahoma");
    			attr_dev(svg, "viewBox", "0 0 1501 2151");
    			add_location(svg, file, 113, 2, 2177);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, defs);
    			append_dev(defs, symbol);
    			append_dev(symbol, path0);
    			append_dev(symbol, path1);
    			append_dev(svg, path2);
    			append_dev(svg, g0);
    			append_dev(g0, text0);
    			append_dev(text0, t0);
    			append_dev(g0, text1);
    			append_dev(text1, t1);
    			append_dev(g0, text2);
    			append_dev(text2, t2);
    			append_dev(svg, g1);
    			if (if_block) if_block.m(g1, null);
    			append_dev(svg, g2);
    			append_dev(g2, text3);
    			append_dev(text3, t3);
    			append_dev(g2, text4);
    			append_dev(text4, t4);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.resultPath.length) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(g1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(svg);
    			}

    			if (if_block) if_block.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(113:0) {#if showScheme}", ctx });
    	return block;
    }

    // (155:6) {#if resultPath.length}
    function create_if_block_2(ctx) {
    	var each_1_anchor;

    	let each_value = ctx.stationsPath;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.stationsPath || changed.showingStation) {
    				each_value = ctx.stationsPath;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach_dev(each_1_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(155:6) {#if resultPath.length}", ctx });
    	return block;
    }

    // (158:10) {#if station}
    function create_if_block_3(ctx) {
    	var g3, g1, g0, raw0_value = ctx.station.path + "", g0_stroke_value, g2, raw1_value = ctx.station.stop + "", g2_fill_value, text_1, raw2_value = ctx.station.text + "", text_1_style_value, g3_class_value;

    	const block = {
    		c: function create() {
    			g3 = svg_element("g");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			g2 = svg_element("g");
    			text_1 = svg_element("text");
    			attr_dev(g0, "stroke", g0_stroke_value = ctx.station.color);
    			add_location(g0, file, 160, 16, 3842);
    			attr_dev(g1, "fill", "none");
    			attr_dev(g1, "stroke-miterlimit", "10");
    			attr_dev(g1, "stroke-width", "28");
    			add_location(g1, file, 159, 14, 3768);
    			attr_dev(g2, "fill", g2_fill_value = ctx.station.color);
    			add_location(g2, file, 165, 14, 3968);
    			attr_dev(text_1, "style", text_1_style_value = ctx.station.style);
    			add_location(text_1, file, 169, 14, 4068);
    			attr_dev(g3, "class", g3_class_value = "fadein " + (ctx.showingStation === ctx.index ? 'lel' : '') + " svelte-zinluk");
    			set_style(g3, "animation-delay", "" + ctx.index / 30 * 10 + "s");
    			add_location(g3, file, 158, 12, 3650);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, g3, anchor);
    			append_dev(g3, g1);
    			append_dev(g1, g0);
    			g0.innerHTML = raw0_value;
    			append_dev(g3, g2);
    			g2.innerHTML = raw1_value;
    			append_dev(g3, text_1);
    			text_1.innerHTML = raw2_value;
    		},

    		p: function update(changed, ctx) {
    			if ((changed.stationsPath) && raw0_value !== (raw0_value = ctx.station.path + "")) {
    				g0.innerHTML = raw0_value;
    			}

    			if ((changed.stationsPath) && g0_stroke_value !== (g0_stroke_value = ctx.station.color)) {
    				attr_dev(g0, "stroke", g0_stroke_value);
    			}

    			if ((changed.stationsPath) && raw1_value !== (raw1_value = ctx.station.stop + "")) {
    				g2.innerHTML = raw1_value;
    			}

    			if ((changed.stationsPath) && g2_fill_value !== (g2_fill_value = ctx.station.color)) {
    				attr_dev(g2, "fill", g2_fill_value);
    			}

    			if ((changed.stationsPath) && raw2_value !== (raw2_value = ctx.station.text + "")) {
    				text_1.innerHTML = raw2_value;
    			}

    			if ((changed.stationsPath) && text_1_style_value !== (text_1_style_value = ctx.station.style)) {
    				attr_dev(text_1, "style", text_1_style_value);
    			}

    			if ((changed.showingStation) && g3_class_value !== (g3_class_value = "fadein " + (ctx.showingStation === ctx.index ? 'lel' : '') + " svelte-zinluk")) {
    				attr_dev(g3, "class", g3_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(g3);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3.name, type: "if", source: "(158:10) {#if station}", ctx });
    	return block;
    }

    // (157:8) {#each stationsPath as station, index}
    function create_each_block(ctx) {
    	var if_block_anchor;

    	var if_block = (ctx.station) && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.station) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(157:8) {#each stationsPath as station, index}", ctx });
    	return block;
    }

    function create_fragment(ctx) {
    	var div, t0, t1, button, t3, if_block_anchor, dispose;

    	var if_block = (ctx.resultPath) && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(ctx.resultPath);
    			t1 = space();
    			button = element("button");
    			button.textContent = "Show";
    			t3 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			add_location(div, file, 93, 0, 1832);
    			add_location(button, file, 95, 0, 1859);
    			dispose = listen_dev(button, "click", ctx.onShow);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.resultPath) {
    				set_data_dev(t0, ctx.resultPath);
    			}

    			if (ctx.resultPath) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    				detach_dev(t1);
    				detach_dev(button);
    				detach_dev(t3);
    			}

    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function getResultPath({ path = [], stationsBetween }) {
      let resultPath = [];

      for (let i = 1; i < path.length; i++) {
        const firstIndex = path[i - 1];
        const secondIndex = path[i];
        let stations = stationsBetween[firstIndex][secondIndex].slice(1);
        resultPath = resultPath.concat(stations);
      }
      resultPath.unshift(path[0]);

      return resultPath;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { stationsBetween, path } = $$props;

      let showScheme = false;
      let resultPath = [];
      let stationsPath = [];

      function showStation(index) {
        $$invalidate('showingStation', showingStation = index);
      }

      function onShow(){
        $$invalidate('showScheme', showScheme = true);
      }

      function calculatePath({ path = [], stationsBetween }) {
        $$invalidate('stationsPath', stationsPath = []);

        if(path && path.length) {
          $$invalidate('resultPath', resultPath = getResultPath({ path, stationsBetween }));

          resultPath.map(item => {
            stationsPath.push(stations.find(station => station.id == item));
          });
        }
      }

      const colors = {
        red: "#d22531",
        blue: "#2060ba",
        green: "#41a747",
        text: "#09303b",
        textDisable: "#9c98a6"
      };

    	const writable_props = ['stationsBetween', 'path'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SchemeRender> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = ({ index }) => showStation(index);

    	$$self.$set = $$props => {
    		if ('stationsBetween' in $$props) $$invalidate('stationsBetween', stationsBetween = $$props.stationsBetween);
    		if ('path' in $$props) $$invalidate('path', path = $$props.path);
    	};

    	$$self.$capture_state = () => {
    		return { stationsBetween, path, showScheme, resultPath, stationsPath, showingStation };
    	};

    	$$self.$inject_state = $$props => {
    		if ('stationsBetween' in $$props) $$invalidate('stationsBetween', stationsBetween = $$props.stationsBetween);
    		if ('path' in $$props) $$invalidate('path', path = $$props.path);
    		if ('showScheme' in $$props) $$invalidate('showScheme', showScheme = $$props.showScheme);
    		if ('resultPath' in $$props) $$invalidate('resultPath', resultPath = $$props.resultPath);
    		if ('stationsPath' in $$props) $$invalidate('stationsPath', stationsPath = $$props.stationsPath);
    		if ('showingStation' in $$props) $$invalidate('showingStation', showingStation = $$props.showingStation);
    	};

    	let showingStation;

    	$$self.$$.update = ($$dirty = { path: 1, stationsBetween: 1 }) => {
    		if ($$dirty.path || $$dirty.stationsBetween) { calculatePath({ path, stationsBetween }); }
    	};

    	$$invalidate('showingStation', showingStation = null);

    	return {
    		stationsBetween,
    		path,
    		showScheme,
    		resultPath,
    		stationsPath,
    		showStation,
    		onShow,
    		colors,
    		showingStation,
    		mouseover_handler
    	};
    }

    class SchemeRender extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["stationsBetween", "path"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "SchemeRender", options, id: create_fragment.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.stationsBetween === undefined && !('stationsBetween' in props)) {
    			console.warn("<SchemeRender> was created without expected prop 'stationsBetween'");
    		}
    		if (ctx.path === undefined && !('path' in props)) {
    			console.warn("<SchemeRender> was created without expected prop 'path'");
    		}
    	}

    	get stationsBetween() {
    		throw new Error("<SchemeRender>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stationsBetween(value) {
    		throw new Error("<SchemeRender>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<SchemeRender>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<SchemeRender>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function initArrayPrototypes() {
      Array.prototype.clone = function() {
        return this.slice(0);
      };
      Array.prototype.max = function() {
        return Math.max.apply(null, this);
      };
      Array.prototype.min = function() {
        return Math.min.apply(null, this);
      };
      Array.prototype.shuffle = function() {
        for (
          var j, x, i = this.length - 1;
          i;
          j = randomNumber(i), x = this[--i], this[i] = this[j], this[j] = x
        );
        return this;
      };
      Array.prototype.indexOf = function(value) {
        for (var i = 0; i < this.length; i++) {
          if (this[i] === value) {
            return i;
          }
        }
      };
      Array.prototype.deleteByValue = function(value) {
        var pos = this.indexOf(value);
        this.splice(pos, 1);
      };
      Array.prototype.next = function(index) {
        if (index === this.length - 1) {
          return this[0];
        } else {
          return this[index + 1];
        }
      };
      Array.prototype.previous = function(index) {
        if (index === 0) {
          return this[this.length - 1];
        } else {
          return this[index - 1];
        }
      };
      Array.prototype.swap = function(x, y) {
        if (x > this.length || y > this.length || x === y) {
          return;
        }
        var tem = this[x];
        this[x] = this[y];
        this[y] = tem;
      };
      Array.prototype.roll = function() {
        var rand = randomNumber(this.length);
        var tem = [];
        for (var i = rand; i < this.length; i++) {
          tem.push(this[i]);
        }
        for (var i = 0; i < rand; i++) {
          tem.push(this[i]);
        }
        return tem;
      };
    }

    function randomNumber(boundary) {
      return parseInt(Math.random() * boundary);
    }

    // export function resetIterators(obj) {
    //   return Object.keys(obj).map(function(key, index) {
    //     obj[key] = 0;
    //   });
    // }

    function countDistances(graph) {
      const points = graph.nodes();
      const length = points.length;

      return Array.apply(null, Array(length)).map((item, index) =>
        Array.apply(null, Array(length)).map(
          (item, insideIndex) =>
            ~~graph.getEdgeWeight(points[index], points[insideIndex])
        )
      );
    }

    function evaluate(indivial, dis) {
      return indivial.reduce(
        (sum, element, index, array) => (sum += dis[element][array[index - 1]])
      );
    }

    function randomIndivial(length) {
      return Array.from(Array(length).keys()).shuffle();
    }

    function wheelOut(roulette = []) {
      const rand = Math.random();
      roulette.forEach((item, i) => {
        if (rand <= item) {
          return i;
        }
      });
      return 0;
    }

    function createRoulette(values = []) {
      const fitnessValues = values.map(item => 1.0 / item);
      const sum = fitnessValues.reduce((tempSum, el) => (tempSum += el));

      let tempSum;
      return fitnessValues
        .map(item => item / sum)
        .map(item => (tempSum = (tempSum || 0) + item));
    }

    function getCurrentBest(values) {
      const min = values.min();

      return {
        bestValue: min,
        bestPosition: values.indexOf(min)
      };
    }

    // const distance = (p1, p2, graph) => graph.getEdgeWeight(p1, p2);

    function pushMutateMath(seq) {
      var m, n;
      do {
        m = randomNumber(seq.length >> 1);
        n = randomNumber(seq.length);
      } while (m >= n);

      var s1 = seq.slice(0, m);
      var s2 = seq.slice(m, n);
      var s3 = seq.slice(n, seq.length);
      return s2
        .concat(s1)
        .concat(s3)
        .clone();
    }

    function doMutateMath(seq) {
      let m, n;
        do {
          m = randomNumber(seq.length - 2);
          n = randomNumber(seq.length);
        } while (m >= n);

        for (var i = 0, j = (n - m + 1) >> 1; i < j; i++) {
          seq.swap(m + i, n - i);
        }
        return seq;
    }

    function reverseMutateMath(seq) {
      const reversed = seq.reverse();

      return reversed;
    }

    // No use
    // export function preciseMutate(orseq, dis) {
    //   var seq = orseq.clone();
    //   if (Math.random() > 0.5) {
    //     seq.reverse();
    //   }
    //   var bestv = evaluate(seq, dis);
    //   for (var i = 0; i < seq.length >> 1; i++) {
    //     for (var j = i + 2; j < seq.length - 1; j++) {
    //       var new_seq = swap_seq(seq, i, i + 1, j, j + 1);
    //       var v = evaluate(new_seq, dis);
    //       if (v < bestv) {
    //         bestv = v;
    //         seq = new_seq;
    //       }
    //     }
    //   }
    //   return seq;
    // }
    // export function preciseMutate1(orseq, dis) {
    //   var seq = orseq.clone();
    //   var bestv = evaluate(seq, dis);

    //   for (var i = 0; i < seq.length - 1; i++) {
    //     var new_seq = seq.clone();
    //     new_seq.swap(i, i + 1);
    //     var v = evaluate(new_seq, dis);
    //     if (v < bestv) {
    //       bestv = v;
    //       seq = new_seq;
    //     }
    //   }
    //   return seq;
    // }
    // function swap_seq(seq, p0, p1, q0, q1) {
    //   var seq1 = seq.slice(0, p0);
    //   var seq2 = seq.slice(p1 + 1, q1);
    //   seq2.push(seq[p0]);
    //   seq2.push(seq[p1]);
    //   var seq3 = seq.slice(q1, seq.length);
    //   return seq1.concat(seq2).concat(seq3);
    // }

    // A graph data structure with depth-first search and topological sort.
    var graphDataStructure = function Graph(serialized){

      // The returned graph instance.
      var graph = {
        addNode: addNode,
        removeNode: removeNode,
        nodes: nodes,
        adjacent: adjacent,
        addEdge: addEdge,
        removeEdge: removeEdge,
        setEdgeWeight: setEdgeWeight,
        getEdgeWeight: getEdgeWeight,
        indegree: indegree,
        outdegree: outdegree,
        depthFirstSearch: depthFirstSearch,
        lowestCommonAncestors: lowestCommonAncestors,
        topologicalSort: topologicalSort,
        shortestPath: shortestPath,
        serialize: serialize,
        deserialize: deserialize
      };

      // The adjacency list of the graph.
      // Keys are node ids.
      // Values are adjacent node id arrays.
      var edges = {};

      // The weights of edges.
      // Keys are string encodings of edges.
      // Values are weights (numbers).
      var edgeWeights = {};

      // If a serialized graph was passed into the constructor, deserialize it.
      if(serialized){
        deserialize(serialized);
      }

      // Adds a node to the graph.
      // If node was already added, this function does nothing.
      // If node was not already added, this function sets up an empty adjacency list.
      function addNode(node){
        edges[node] = adjacent(node);
        return graph;
      }

      // Removes a node from the graph.
      // Also removes incoming and outgoing edges.
      function removeNode(node){

        // Remove incoming edges.
        Object.keys(edges).forEach(function (u){
          edges[u].forEach(function (v){
            if(v === node){
              removeEdge(u, v);
            }
          });
        });

        // Remove outgoing edges (and signal that the node no longer exists).
        delete edges[node];

        return graph;
      }

      // Gets the list of nodes that have been added to the graph.
      function nodes(){
        var nodeSet = {};
        Object.keys(edges).forEach(function (u){
          nodeSet[u] = true;
          edges[u].forEach(function (v){
            nodeSet[v] = true;
          });
        });
        return Object.keys(nodeSet);
      }

      // Gets the adjacent node list for the given node.
      // Returns an empty array for unknown nodes.
      function adjacent(node){
        return edges[node] || [];
      }

      // Computes a string encoding of an edge,
      // for use as a key in an object.
      function encodeEdge(u, v){
        return u + "|" + v;
      }

      // Sets the weight of the given edge.
      function setEdgeWeight(u, v, weight){
        edgeWeights[encodeEdge(u, v)] = weight;
        return graph;
      }

      // Gets the weight of the given edge.
      // Returns 1 if no weight was previously set.
      function getEdgeWeight(u, v){
        var weight = edgeWeights[encodeEdge(u, v)];
        return weight === undefined ? 1 : weight;
      }

      // Adds an edge from node u to node v.
      // Implicitly adds the nodes if they were not already added.
      function addEdge(u, v, weight){
        addNode(u);
        addNode(v);
        adjacent(u).push(v);

        if (weight !== undefined) {
          setEdgeWeight(u, v, weight);
        }

        return graph;
      }

      // Removes the edge from node u to node v.
      // Does not remove the nodes.
      // Does nothing if the edge does not exist.
      function removeEdge(u, v){
        if(edges[u]){
          edges[u] = adjacent(u).filter(function (_v){
            return _v !== v;
          });
        }
        return graph;
      }

      // Computes the indegree for the given node.
      // Not very efficient, costs O(E) where E = number of edges.
      function indegree(node){
        var degree = 0;
        function check(v){
          if(v === node){
            degree++;
          }
        }
        Object.keys(edges).forEach(function (u){
          edges[u].forEach(check);
        });
        return degree;
      }

      // Computes the outdegree for the given node.
      function outdegree(node){
        return node in edges ? edges[node].length : 0;
      }

      // Depth First Search algorithm, inspired by
      // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 604
      // This variant includes an additional option
      // `includeSourceNodes` to specify whether to include or
      // exclude the source nodes from the result (true by default).
      // If `sourceNodes` is not specified, all nodes in the graph
      // are used as source nodes.
      function depthFirstSearch(sourceNodes, includeSourceNodes){

        if(!sourceNodes){
          sourceNodes = nodes();
        }

        if(typeof includeSourceNodes !== "boolean"){
          includeSourceNodes = true;
        }

        var visited = {};
        var nodeList = [];

        function DFSVisit(node){
          if(!visited[node]){
            visited[node] = true;
            adjacent(node).forEach(DFSVisit);
            nodeList.push(node);
          }
        }

        if(includeSourceNodes){
          sourceNodes.forEach(DFSVisit);
        } else {
          sourceNodes.forEach(function (node){
            visited[node] = true;
          });
          sourceNodes.forEach(function (node){
            adjacent(node).forEach(DFSVisit);
          });
        }

        return nodeList;
      }

      // Least Common Ancestors
      // Inspired by https://github.com/relaxedws/lca/blob/master/src/LowestCommonAncestor.php code
      // but uses depth search instead of breadth. Also uses some optimizations
      function lowestCommonAncestors(node1, node2){

        var node1Ancestors = [];
        var lcas = [];

        function CA1Visit(visited, node){
          if(!visited[node]){
            visited[node] = true;
            node1Ancestors.push(node);
            if (node == node2) {
              lcas.push(node);
              return false; // found - shortcut
            }
            return adjacent(node).every(node => {
              return CA1Visit(visited, node);
            });
          } else {
            return true;
          }
        }

        function CA2Visit(visited, node){
          if(!visited[node]){
            visited[node] = true;
            if (node1Ancestors.indexOf(node) >= 0) {
              lcas.push(node);
            } else if (lcas.length == 0) {
              adjacent(node).forEach(node => {
                CA2Visit(visited, node);
              });
            }
          }
        }

        if (CA1Visit({}, node1)) { // No shortcut worked
          CA2Visit({}, node2);
        }

        return lcas;
      }

      // The topological sort algorithm yields a list of visited nodes
      // such that for each visited edge (u, v), u comes before v in the list.
      // Amazingly, this comes from just reversing the result from depth first search.
      // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 613
      function topologicalSort(sourceNodes, includeSourceNodes){
        return depthFirstSearch(sourceNodes, includeSourceNodes).reverse();
      }

      // Dijkstra's Shortest Path Algorithm.
      // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 658
      // Variable and function names correspond to names in the book.
      function shortestPath(source, destination){

        // Upper bounds for shortest path weights from source.
        var d = {};

        // Predecessors.
        var p = {};

        // Poor man's priority queue, keyed on d.
        var q = {};

        function initializeSingleSource(){
          nodes().forEach(function (node){
            d[node] = Infinity;
          });
          if (d[source] !== Infinity) {
            throw new Error("Source node is not in the graph");
          }
          if (d[destination] !== Infinity) {
            throw new Error("Destination node is not in the graph");
          }
          d[source] = 0;
        }

        // Adds entries in q for all nodes.
        function initializePriorityQueue(){
          nodes().forEach(function (node){
            q[node] = true;
          });
        }

        // Returns true if q is empty.
        function priorityQueueEmpty(){
          return Object.keys(q).length === 0;
        }

        // Linear search to extract (find and remove) min from q.
        function extractMin(){
          var min = Infinity;
          var minNode;
          Object.keys(q).forEach(function(node){
            if (d[node] < min) {
              min = d[node];
              minNode = node;
            }
          });
          if (minNode === undefined) {
            // If we reach here, there's a disconnected subgraph, and we're done.
            q = {};
            return null;
          }
          delete q[minNode];
          return minNode;
        }

        function relax(u, v){
          var w = getEdgeWeight(u, v);
          if (d[v] > d[u] + w) {
            d[v] = d[u] + w;
            p[v] = u;
          }
        }

        function dijkstra(){
          initializeSingleSource();
          initializePriorityQueue();
          while(!priorityQueueEmpty()){
            var u = extractMin();
            adjacent(u).forEach(function (v){
              relax(u, v);
            });
          }
        }

        // Assembles the shortest path by traversing the
        // predecessor subgraph from destination to source.
        function path(){
          var nodeList = [];
          var weight = 0;
          var node = destination;
          while(p[node]){
            nodeList.push(node);
            weight += getEdgeWeight(p[node], node);
            node = p[node];
          }
          if (node !== source) {
            throw new Error("No path found");
          }
          nodeList.push(node);
          nodeList.reverse();
          nodeList.weight = weight;
          return nodeList;
        }

        dijkstra();

        return path();
      }

      // Serializes the graph.
      function serialize(){
        var serialized = {
          nodes: nodes().map(function (id){
            return { id: id };
          }),
          links: []
        };

        serialized.nodes.forEach(function (node){
          var source = node.id;
          adjacent(source).forEach(function (target){
            serialized.links.push({
              source: source,
              target: target,
              weight: getEdgeWeight(source, target)
            });
          });
        });

        return serialized;
      }

      // Deserializes the given serialized graph.
      function deserialize(serialized){
        serialized.nodes.forEach(function (node){ addNode(node.id); });
        serialized.links.forEach(function (link){ addEdge(link.source, link.target, link.weight); });
        return graph;
      }

      return graph;
    };

    function createGraph(data) {
      const INTERVAL_TIME = 6;

      

      function getWeight(weight) {
        return weight + INTERVAL_TIME;
      }

      const graph = graphDataStructure();
      
      data
        .map(item => ({
          ...item,
          weight: getWeight(item.weight)
        }))
        .map(item => {
          graph.addEdge(item.from, item.to, item.weight);
          graph.addEdge(item.to, item.from, item.weight);
        });


        // var serialized = graph.serialize();

        // debugger;


      let stationsBetween = [];

      graph.nodes().map((i, index) => {
        stationsBetween.push([]);

        stationsBetween.push([]);
          graph.nodes().map((j, insideIndex) => {
            const path = graph.shortestPath(i, j);
            const cleanPath = path.slice();
            stationsBetween[index].push(cleanPath);
          });
      });

      graph.nodes().map((i, index) => {
        graph.nodes().map((j, insideIndex) => {
          const path = graph.shortestPath(i, j);
          graph.addEdge(i, j, path.weight);
        });
      });


    //   graph.nodes().map((i, index) => {
    //     stationsBetween.push([]);

    //     graph.nodes().map((j, insideIndex) => {
    //       const path = graph.shortestPath(i, j);
    //       const cleanPath = path.slice();

    //       if(i == 26) {
    // debugger;
    //       }

    //       stationsBetween[index].push(cleanPath);

    //       graph.addEdge(i, j, path.weight);
    //     });
    //   });


      return { graph, stationsBetween };
    }

    /* src\Scheme.svelte generated by Svelte v3.12.1 */

    const file$1 = "src\\Scheme.svelte";

    function create_fragment$1(ctx) {
    	var div1, button, t1, div0, t2, current, dispose;

    	var schemerender = new SchemeRender({
    		props: {
    		path: ctx.best,
    		stationsBetween: ctx.stationsBetween
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "Start/Stop";
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			schemerender.$$.fragment.c();
    			add_location(button, file$1, 189, 2, 4940);
    			add_location(div0, file$1, 191, 2, 4996);
    			attr_dev(div1, "class", "lol");
    			add_location(div1, file$1, 188, 0, 4919);
    			dispose = listen_dev(button, "click", ctx.startOrStop);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			div0.innerHTML = ctx.text;
    			append_dev(div1, t2);
    			mount_component(schemerender, div1, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.text) {
    				div0.innerHTML = ctx.text;
    			}

    			var schemerender_changes = {};
    			if (changed.best) schemerender_changes.path = ctx.best;
    			if (changed.stationsBetween) schemerender_changes.stationsBetween = ctx.stationsBetween;
    			schemerender.$set(schemerender_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(schemerender.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(schemerender.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div1);
    			}

    			destroy_component(schemerender);

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    const POPULATION_SIZE = 30;

    const CROSSOVER_PROBABILITY = 0.9;

    const MUTATION_PROBABILITY = 0.01;

    const INTERVAL_DURATION = 40;

    function instance$1($$self, $$props, $$invalidate) {
    	

      let graph;
      let stationsBetween;

      let running = false;
      let mainInterval;

      let iterators;
      let dis;
      let bestValue;
      let best;
      let currentBest;
      let population;
      let values;

      onMount(async () => {
        const res = await fetch(`https://metro.kh.ua/metroapi.php?value=path`);
        const data = await res.json();
        const graphData = createGraph(data);
        graph = graphData.graph;
        $$invalidate('stationsBetween', stationsBetween = graphData.stationsBetween);
        dis = countDistances(graph);
      });

      function startOrStop() {
        if (running) {
          clearInterval(mainInterval);
          return (running = false);
        }
        initData();
        GAInitialize();
        mainInterval = setInterval(draw, INTERVAL_DURATION);
        return (running = true);
      }

      function initData() {
        iterators = {
          mutationTimes: 0,
          currentGeneration: 0
        };
        bestValue = undefined;
        $$invalidate('best', best = []);
        currentBest = 0;
        population = [];
        values = new Array(POPULATION_SIZE);
      }

      function draw() {
        GANextGeneration();

        $$invalidate('text', text = `<p>
      There are ${graph.nodes().length} stations in the map. 
      The ${iterators.currentGeneration}th generation 
      with ${iterators.mutationTimes} times of mutation. 
      Best value: ${~~bestValue} -- ${currentBest.bestValue}. 
      Path: ${best.toString()}</p>`);
      }

      function GAInitialize() {
        const stationsCount = graph.nodes().length;
        population = Array.apply(null, Array(POPULATION_SIZE)).map(item =>
          randomIndivial(stationsCount)
        );
        setBestValue();
      }
      function GANextGeneration() {
        iterators.currentGeneration++;
        selection();
        crossover();
        mutation();
        setBestValue();
      }

      function selection() {
        let parents = new Array();
        let initnum = 5;
        parents.push(population[currentBest.bestPosition]);
        parents.push(doMutate(best.clone()));
        parents.push(pushMutate(best.clone()));
        parents.push(reverseMutate(best.clone()));
        parents.push(best.clone());

        const roulette = createRoulette(values);

        for (let i = initnum; i < POPULATION_SIZE; i++) {
          parents.push(population[wheelOut(roulette)]);
        }
        population = parents;
      }

      function crossover() {
        let queue = new Array();
        for (let i = 0; i < POPULATION_SIZE; i++) {
          if (Math.random() < CROSSOVER_PROBABILITY) {
            queue.push(i);
          }
        }
        queue.shuffle();
        for (let i = 0, j = queue.length - 1; i < j; i += 2) {
          doCrossover(queue[i], queue[i + 1]);
        }
      }

      function doCrossover(x, y) {
        let child1 = getChild("next", x, y);
        let child2 = getChild("previous", x, y);
        population[x] = child1;
        population[y] = child2;
      }

      function getChild(fun, x, y) {
        let solution = new Array();
        let px = population[x].clone();
        let py = population[y].clone();
        let dx, dy;
        let c = px[randomNumber(px.length)];
        solution.push(c);
        while (px.length > 1) {
          dx = px[fun](px.indexOf(c));
          dy = py[fun](py.indexOf(c));
          px.deleteByValue(c);
          py.deleteByValue(c);
          c = dis[c][dx] < dis[c][dy] ? dx : dy;
          solution.push(c);
        }
        return solution;
      }

      function mutation() {
        for (let i = 0; i < POPULATION_SIZE; i++) {
          if (Math.random() < MUTATION_PROBABILITY) {
            if (Math.random() > 0.5) {
              population[i] = doMutateMath(population[i]);
            } else {
              population[i] = pushMutate(population[i]);
            }
            i--;
          }
        }
      }

      function mutationIteration(array) {
        iterators.mutationTimes++;
        return array;
      }
      const reverseMutate = seq => mutationIteration(reverseMutateMath(seq));
      const doMutate = seq => mutationIteration(doMutateMath(seq));
      const pushMutate = seq => mutationIteration(pushMutateMath(seq));

      function setBestValue() {
        values = population.map(item => evaluate(item, dis));
        currentBest = getCurrentBest(values);

        if (bestValue === undefined || bestValue > currentBest.bestValue) {
          reWriteBestValues(population, currentBest);
        }
      }

      function reWriteBestValues(population, currentBest) {
        $$invalidate('best', best = population[currentBest.bestPosition].clone());
        bestValue = currentBest.bestValue;
      }

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('graph' in $$props) graph = $$props.graph;
    		if ('stationsBetween' in $$props) $$invalidate('stationsBetween', stationsBetween = $$props.stationsBetween);
    		if ('running' in $$props) running = $$props.running;
    		if ('mainInterval' in $$props) mainInterval = $$props.mainInterval;
    		if ('iterators' in $$props) iterators = $$props.iterators;
    		if ('dis' in $$props) dis = $$props.dis;
    		if ('bestValue' in $$props) bestValue = $$props.bestValue;
    		if ('best' in $$props) $$invalidate('best', best = $$props.best);
    		if ('currentBest' in $$props) currentBest = $$props.currentBest;
    		if ('population' in $$props) population = $$props.population;
    		if ('values' in $$props) values = $$props.values;
    		if ('text' in $$props) $$invalidate('text', text = $$props.text);
    	};

    	let text;

    	$$invalidate('text', text = "");

    	return { stationsBetween, best, startOrStop, text };
    }

    class Scheme extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Scheme", options, id: create_fragment$1.name });
    	}
    }

    /* src\App.svelte generated by Svelte v3.12.1 */

    function create_fragment$2(ctx) {
    	var current;

    	var scheme = new Scheme({ $$inline: true });

    	const block = {
    		c: function create() {
    			scheme.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(scheme, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(scheme.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(scheme.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(scheme, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self) {
    	
      
      initArrayPrototypes();

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {};

    	return {};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$2.name });
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
