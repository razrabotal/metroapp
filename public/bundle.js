
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
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function xlink_attr(node, attribute, value) {
        node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
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

    /* src/Symbols.svelte generated by Svelte v3.12.1 */

    const file = "src/Symbols.svelte";

    function create_fragment(ctx) {
    	var defs, symbol0, path0, path1, path1_fill_value, symbol1, path2, path3, path3_fill_value, symbol2, path4, path5, path5_fill_value;

    	const block = {
    		c: function create() {
    			defs = svg_element("defs");
    			symbol0 = svg_element("symbol");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			symbol1 = svg_element("symbol");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			symbol2 = svg_element("symbol");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			attr_dev(path0, "fill", "#fff");
    			attr_dev(path0, "d", "M6.6 11.5a4.9 4.9 0 110-9.8A4.8 4.8 0 019.7 3a9.7 9.7 0 004.5 2v3.5a9.7 9.7 0 00-3.9 1.6l-.9.6a4.8 4.8 0 01-2.8 1z");
    			add_location(path0, file, 10, 4, 118);
    			attr_dev(path1, "fill", path1_fill_value = ctx.colors.red);
    			attr_dev(path1, "d", "M6.7 3.5a3 3 0 012 .7 11.5 11.5 0 003.7 2V7a11.4 11.4 0 00-3.1 1.6l-.9.6a3 3 0 01-1.8.6 3.1 3.1 0 110-6.3m0-3.5A6.6 6.6 0 000 6.6a6.6 6.6 0 006.6 6.7 6.5 6.5 0 003.8-1.3l.9-.6a8 8 0 014.6-1.4V3.3a8 8 0 01-5-1.8A6.5 6.5 0 006.6 0z");
    			add_location(path1, file, 11, 4, 261);
    			attr_dev(symbol0, "id", "a");
    			attr_dev(symbol0, "viewBox", "0 0 15.9 13.3");
    			add_location(symbol0, file, 9, 2, 74);
    			attr_dev(path2, "fill", "#fff");
    			attr_dev(path2, "d", "M9.3 11.5a4.8 4.8 0 01-2.8-.9l-.9-.6a9.7 9.7 0 00-3.8-1.6V4.9a9.7 9.7 0 004.4-2 4.8 4.8 0 013-1.1 4.9 4.9 0 110 9.7z");
    			add_location(path2, file, 14, 4, 579);
    			attr_dev(path3, "fill", path3_fill_value = ctx.colors.blue);
    			attr_dev(path3, "d", "M9.2 3.5a3.1 3.1 0 013.2 3.1 3.1 3.1 0 01-3.2 3.2 3 3 0 01-1.7-.6l-.9-.6A11.4 11.4 0 003.5 7v-.7a11.5 11.5 0 003.8-2 3 3 0 012-.8m0-3.5A6.5 6.5 0 005 1.5a8 8 0 01-5 1.8V10a8 8 0 014.6 1.5l.9.6a6.5 6.5 0 003.8 1.2A6.6 6.6 0 109.3 0z");
    			add_location(path3, file, 15, 4, 724);
    			attr_dev(symbol1, "id", "b");
    			attr_dev(symbol1, "viewBox", "0 0 15.9 13.3");
    			add_location(symbol1, file, 13, 2, 535);
    			attr_dev(path4, "fill", "#fff");
    			attr_dev(path4, "d", "M6.6 11.5a4.9 4.9 0 110-9.8 4.8 4.8 0 013 1.1 9.7 9.7 0 004.5 2v3.6a9.7 9.7 0 00-3.8 1.6l-.9.6a4.8 4.8 0 01-2.8 1z");
    			add_location(path4, file, 18, 4, 1045);
    			attr_dev(path5, "fill", path5_fill_value = ctx.colors.green);
    			attr_dev(path5, "d", "M6.7 3.5a3 3 0 012 .7 11.5 11.5 0 003.7 2V7a11.4 11.4 0 00-3.1 1.6l-.9.6a3 3 0 01-1.8.6 3.1 3.1 0 110-6.3m0-3.5A6.6 6.6 0 000 6.6a6.6 6.6 0 006.6 6.7 6.5 6.5 0 003.8-1.3l.9-.6a8 8 0 014.6-1.4V3.3a8 8 0 01-5-1.8A6.5 6.5 0 006.6 0z");
    			add_location(path5, file, 19, 4, 1188);
    			attr_dev(symbol2, "id", "c");
    			attr_dev(symbol2, "viewBox", "0 0 15.9 13.3");
    			add_location(symbol2, file, 17, 2, 1001);
    			add_location(defs, file, 8, 0, 65);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, defs, anchor);
    			append_dev(defs, symbol0);
    			append_dev(symbol0, path0);
    			append_dev(symbol0, path1);
    			append_dev(defs, symbol1);
    			append_dev(symbol1, path2);
    			append_dev(symbol1, path3);
    			append_dev(defs, symbol2);
    			append_dev(symbol2, path4);
    			append_dev(symbol2, path5);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.colors) && path1_fill_value !== (path1_fill_value = ctx.colors.red)) {
    				attr_dev(path1, "fill", path1_fill_value);
    			}

    			if ((changed.colors) && path3_fill_value !== (path3_fill_value = ctx.colors.blue)) {
    				attr_dev(path3, "fill", path3_fill_value);
    			}

    			if ((changed.colors) && path5_fill_value !== (path5_fill_value = ctx.colors.green)) {
    				attr_dev(path5, "fill", path5_fill_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(defs);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { colors } = $$props;

    	const writable_props = ['colors'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Symbols> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('colors' in $$props) $$invalidate('colors', colors = $$props.colors);
    	};

    	$$self.$capture_state = () => {
    		return { colors };
    	};

    	$$self.$inject_state = $$props => {
    		if ('colors' in $$props) $$invalidate('colors', colors = $$props.colors);
    	};

    	return { colors };
    }

    class Symbols extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["colors"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Symbols", options, id: create_fragment.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.colors === undefined && !('colors' in props)) {
    			console.warn("<Symbols> was created without expected prop 'colors'");
    		}
    	}

    	get colors() {
    		throw new Error("<Symbols>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors(value) {
    		throw new Error("<Symbols>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    const file$1 = "src/App.svelte";

    function create_fragment$1(ctx) {
    	var div, svg, g0, path0, path1, path2, path3, path4, path5, path6, path7, path8, path9, path10, path11, path12, g1, path13, path14, path15, path16, path17, path18, path19, path20, g2, path21, path22, path23, path24, path25, path26, path27, g3, path28, path29, path30, path31, path32, path33, path34, path35, g4, path36, path37, path38, path39, path40, path41, path42, g5, path43, path44, path45, path46, path47, path48, path49, path50, path51, path52, path53, path54, path55, use0, use1, use2, use3, use4, use5, g6, text0, t0, text1, t1, text2, t2, g7, text3, t3, tspan0, t4, text4, t5, tspan1, t6, text5, t7, text6, t8, text7, t9, tspan2, t10, text8, t11, tspan3, t12, text9, t13, tspan4, t14, text10, t15, text11, t16, text12, t17, text13, t18, text14, t19, tspan5, t20, text15, t21, tspan6, t22, text16, t23, text17, t24, text18, t25, text19, t26, tspan7, t27, text20, t28, text21, t29, text22, t30, text23, t31, text24, t32, text25, t33, text26, t34, text27, t35, tspan8, t36, text28, t37, tspan9, t38, text29, t39, text30, t40, text31, t41, tspan10, t42, text32, t43, text33, t44, tspan11, t45, g8, text34, t46, text35, t47, current;

    	var symbols = new Symbols({
    		props: { colors: ctx.colors },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			symbols.$$.fragment.c();
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			path10 = svg_element("path");
    			path11 = svg_element("path");
    			path12 = svg_element("path");
    			g1 = svg_element("g");
    			path13 = svg_element("path");
    			path14 = svg_element("path");
    			path15 = svg_element("path");
    			path16 = svg_element("path");
    			path17 = svg_element("path");
    			path18 = svg_element("path");
    			path19 = svg_element("path");
    			path20 = svg_element("path");
    			g2 = svg_element("g");
    			path21 = svg_element("path");
    			path22 = svg_element("path");
    			path23 = svg_element("path");
    			path24 = svg_element("path");
    			path25 = svg_element("path");
    			path26 = svg_element("path");
    			path27 = svg_element("path");
    			g3 = svg_element("g");
    			path28 = svg_element("path");
    			path29 = svg_element("path");
    			path30 = svg_element("path");
    			path31 = svg_element("path");
    			path32 = svg_element("path");
    			path33 = svg_element("path");
    			path34 = svg_element("path");
    			path35 = svg_element("path");
    			g4 = svg_element("g");
    			path36 = svg_element("path");
    			path37 = svg_element("path");
    			path38 = svg_element("path");
    			path39 = svg_element("path");
    			path40 = svg_element("path");
    			path41 = svg_element("path");
    			path42 = svg_element("path");
    			g5 = svg_element("g");
    			path43 = svg_element("path");
    			path44 = svg_element("path");
    			path45 = svg_element("path");
    			path46 = svg_element("path");
    			path47 = svg_element("path");
    			path48 = svg_element("path");
    			path49 = svg_element("path");
    			path50 = svg_element("path");
    			path51 = svg_element("path");
    			path52 = svg_element("path");
    			path53 = svg_element("path");
    			path54 = svg_element("path");
    			path55 = svg_element("path");
    			use0 = svg_element("use");
    			use1 = svg_element("use");
    			use2 = svg_element("use");
    			use3 = svg_element("use");
    			use4 = svg_element("use");
    			use5 = svg_element("use");
    			g6 = svg_element("g");
    			text0 = svg_element("text");
    			t0 = text("Холодногірсько-заводська лінія\n    ");
    			text1 = svg_element("text");
    			t1 = text("Салтівська лінія\n    ");
    			text2 = svg_element("text");
    			t2 = text("Олексіївська лінія\n    ");
    			g7 = svg_element("g");
    			text3 = svg_element("text");
    			t3 = text("Пiвденний ");
    			tspan0 = svg_element("tspan");
    			t4 = text("вокзал");
    			text4 = svg_element("text");
    			t5 = text("Центральний ");
    			tspan1 = svg_element("tspan");
    			t6 = text("ринок");
    			text5 = svg_element("text");
    			t7 = text("Унiверситет\n    ");
    			text6 = svg_element("text");
    			t8 = text("Держпром\n    ");
    			text7 = svg_element("text");
    			t9 = text("Iсторичний");
    			tspan2 = svg_element("tspan");
    			t10 = text("музей");
    			text8 = svg_element("text");
    			t11 = text("Захисникiв ");
    			tspan3 = svg_element("tspan");
    			t12 = text("України");
    			text9 = svg_element("text");
    			t13 = text("Захисникiв ");
    			tspan4 = svg_element("tspan");
    			t14 = text("України");
    			text10 = svg_element("text");
    			t15 = text("Завод iм. Малишева\n    ");
    			text11 = svg_element("text");
    			t16 = text("Турбоатом\n    ");
    			text12 = svg_element("text");
    			t17 = text("Палац спорту\n    ");
    			text13 = svg_element("text");
    			t18 = text("Армiйська\n    ");
    			text14 = svg_element("text");
    			t19 = text("Iменi ");
    			tspan5 = svg_element("tspan");
    			t20 = text("Масельського");
    			text15 = svg_element("text");
    			t21 = text("Тракторний");
    			tspan6 = svg_element("tspan");
    			t22 = text("завод");
    			text16 = svg_element("text");
    			t23 = text("Iндустрiальна\n    ");
    			text17 = svg_element("text");
    			t24 = text("Метробудiвникiв\n    ");
    			text18 = svg_element("text");
    			t25 = text("Спортивна\n    ");
    			text19 = svg_element("text");
    			t26 = text("Архiтектора ");
    			tspan7 = svg_element("tspan");
    			t27 = text("Бекетова");
    			text20 = svg_element("text");
    			t28 = text("Пушкiнська\n    ");
    			text21 = svg_element("text");
    			t29 = text("Наукова\n    ");
    			text22 = svg_element("text");
    			t30 = text("Ботанiчний сад\n    ");
    			text23 = svg_element("text");
    			t31 = text("23 Серпня\n    ");
    			text24 = svg_element("text");
    			t32 = text("Олексiївська\n    ");
    			text25 = svg_element("text");
    			t33 = text("Перемога\n    ");
    			text26 = svg_element("text");
    			t34 = text("Київська\n    ");
    			text27 = svg_element("text");
    			t35 = text("Академiка");
    			tspan8 = svg_element("tspan");
    			t36 = text("Барабашова");
    			text28 = svg_element("text");
    			t37 = text("Академiка");
    			tspan9 = svg_element("tspan");
    			t38 = text("Павлова");
    			text29 = svg_element("text");
    			t39 = text("Студентська\n    ");
    			text30 = svg_element("text");
    			t40 = text("Героїв праці\n    ");
    			text31 = svg_element("text");
    			t41 = text("Майдан");
    			tspan10 = svg_element("tspan");
    			t42 = text("Конституції");
    			text32 = svg_element("text");
    			t43 = text("Проспект Гагарiна\n    ");
    			text33 = svg_element("text");
    			t44 = text("Холодна");
    			tspan11 = svg_element("tspan");
    			t45 = text("гора");
    			g8 = svg_element("g");
    			text34 = svg_element("text");
    			t46 = text("Державiнська\n    ");
    			text35 = svg_element("text");
    			t47 = text("Одеська");
    			attr_dev(path0, "d", "M1100.8 1630.1v-20.6h-42.1v20.6h42.1z");
    			add_location(path0, file$1, 67, 4, 3260);
    			attr_dev(path1, "d", "M1100.8 1728.9v-20.6h-42.1v20.6h42.1z");
    			add_location(path1, file$1, 68, 4, 3314);
    			attr_dev(path2, "d", "M1100.8 1848.7v-20.6h-42.1v20.6h42.1z");
    			add_location(path2, file$1, 69, 4, 3368);
    			attr_dev(path3, "d", "M1100.8 1972v-20.6h-42.1v20.6h42.1z");
    			add_location(path3, file$1, 70, 4, 3422);
    			attr_dev(path4, "d", "M1100.8 2109.3v-20.6h-42.1v20.6h42.1z");
    			add_location(path4, file$1, 71, 4, 3474);
    			attr_dev(path5, "d", "M1044.5 2109.3v-20.6h42.1v20.6h-42.1z");
    			add_location(path5, file$1, 72, 4, 3528);
    			attr_dev(path6, "d", "M1052.3 1506.2l-14.5-14.6-29.8 29.7 7.3 7.3 7.3 7.3 29.7-29.7z");
    			add_location(path6, file$1, 73, 4, 3582);
    			attr_dev(path7, "d", "M953.4 1407.2l-14.6-14.5-29.8 29.7 7.3 7.3 7.3 7.3 29.8-29.8z");
    			add_location(path7, file$1, 74, 4, 3661);
    			attr_dev(path8, "d", "M654 1187.3l14.5 14.6 29.8-29.8-7.3-7.3-7.3-7.3-29.7 29.8z");
    			add_location(path8, file$1, 75, 4, 3739);
    			attr_dev(path9, "d", "M441 974.4l14.6 14.5 29.8-29.7-7.3-7.3-7.3-7.3-29.8 29.8z");
    			add_location(path9, file$1, 76, 4, 3814);
    			attr_dev(path10, "d", "M323.5 856.8l14.5 14.6 29.8-29.8-7.3-7.3-7.3-7.3-29.7 29.8z");
    			add_location(path10, file$1, 77, 4, 3888);
    			attr_dev(path11, "d", "M260.8 682.9v20.6h42.1v-20.6h-42.1z");
    			add_location(path11, file$1, 78, 4, 3964);
    			attr_dev(path12, "d", "M317 682.9v20.6h-42.1v-20.6H317z");
    			add_location(path12, file$1, 79, 4, 4016);
    			attr_dev(g0, "fill", ctx.colors.red);
    			add_location(g0, file$1, 66, 2, 3234);
    			attr_dev(path13, "d", "M962.7 1116l14.5-14.5-29.7-29.8-7.3 7.3-7.3 7.3 29.8 29.7z");
    			add_location(path13, file$1, 82, 4, 4098);
    			attr_dev(path14, "d", "M977.2 935.7l-14.5-14.6-29.8 29.8 7.3 7.2 7.3 7.3 29.7-29.7z");
    			add_location(path14, file$1, 83, 4, 4173);
    			attr_dev(path15, "d", "M621.3 579.5l-14.6-14.6-29.7 29.8 7.2 7.3 7.3 7.2 29.8-29.7z");
    			add_location(path15, file$1, 84, 4, 4250);
    			attr_dev(path16, "d", "M500.8 194.9v-20.6h-42.1v20.6h42.1z");
    			add_location(path16, file$1, 85, 4, 4327);
    			attr_dev(path17, "d", "M500.8 79.9V59.3h-42.1v20.6h42.1z");
    			add_location(path17, file$1, 86, 4, 4379);
    			attr_dev(path18, "d", "M444.6 79.9V59.3h42.1v20.6h-42.1z");
    			add_location(path18, file$1, 87, 4, 4429);
    			attr_dev(path19, "d", "M500.8 424.9v-20.6h-42.1v20.6h42.1z");
    			add_location(path19, file$1, 88, 4, 4479);
    			attr_dev(path20, "d", "M500.8 309.9v-20.6h-42.1v20.6h42.1z");
    			add_location(path20, file$1, 89, 4, 4531);
    			attr_dev(g1, "fill", ctx.colors.green);
    			add_location(g1, file$1, 81, 2, 4070);
    			attr_dev(path21, "d", "M935.1 648.1l14.6-14.5-29.7-29.8-7.3 7.3-7.3 7.3 29.7 29.7z");
    			add_location(path21, file$1, 92, 4, 4615);
    			attr_dev(path22, "d", "M1024.1 559.1l14.6-14.5-29.7-29.8-7.3 7.3-7.3 7.3 29.7 29.7z");
    			add_location(path22, file$1, 93, 4, 4691);
    			attr_dev(path23, "d", "M1100.8 185.1v-20.6h-42.1v20.6h42.1z");
    			add_location(path23, file$1, 94, 4, 4768);
    			attr_dev(path24, "d", "M1100.8 309.9v-20.6h-42.1v20.6h42.1z");
    			add_location(path24, file$1, 95, 4, 4821);
    			attr_dev(path25, "d", "M1100.8 435.4v-20.6h-42.1v20.6h42.1z");
    			add_location(path25, file$1, 96, 4, 4874);
    			attr_dev(path26, "d", "M1100.8 79.8V59.3h-42.1v20.5h42.1z");
    			add_location(path26, file$1, 97, 4, 4927);
    			attr_dev(path27, "d", "M1044.6 79.8V59.3h42.1v20.5h-42.1z");
    			add_location(path27, file$1, 98, 4, 4978);
    			attr_dev(g2, "fill", ctx.colors.blue);
    			add_location(g2, file$1, 91, 2, 4588);
    			attr_dev(path28, "d", "M950.3 1088.7l-219.6 219.5");
    			add_location(path28, file$1, 101, 4, 5117);
    			attr_dev(path29, "d", "M950.3 948.4l27.7 27.7c30.9 31 30 55 0 84.9l-27.7 27.7");
    			add_location(path29, file$1, 102, 4, 5160);
    			attr_dev(path30, "d", "M731.7 729.9l218.6 218.5");
    			add_location(path30, file$1, 103, 4, 5231);
    			attr_dev(path31, "d", "M593.9 592.1l137.8 137.8");
    			add_location(path31, file$1, 104, 4, 5272);
    			attr_dev(path32, "d", "M472.7 414.2V446a60 60 0 0017.6 42.4l103.6 103.7");
    			add_location(path32, file$1, 105, 4, 5313);
    			attr_dev(path33, "d", "M472.7 299.7v114.5");
    			add_location(path33, file$1, 106, 4, 5378);
    			attr_dev(path34, "d", "M472.7 184.4v115.3");
    			add_location(path34, file$1, 107, 4, 5413);
    			attr_dev(path35, "d", "M472.7 68.3v116.1");
    			add_location(path35, file$1, 108, 4, 5448);
    			attr_dev(g3, "fill", "none");
    			attr_dev(g3, "stroke", ctx.colors.green);
    			attr_dev(g3, "stroke-miterlimit", "10");
    			attr_dev(g3, "stroke-width", "28");
    			add_location(g3, file$1, 100, 2, 5034);
    			attr_dev(path36, "d", "M1072.7 173.7V68.3");
    			add_location(path36, file$1, 111, 4, 5569);
    			attr_dev(path37, "d", "M1072.7 299.3V173.7");
    			add_location(path37, file$1, 112, 4, 5604);
    			attr_dev(path38, "d", "M1072.7 424.9V299.3");
    			add_location(path38, file$1, 113, 4, 5640);
    			attr_dev(path39, "d", "M1009.8 533.8l45.3-45.4a60 60 0 0017.6-42.4v-21.1");
    			add_location(path39, file$1, 114, 4, 5676);
    			attr_dev(path40, "d", "M923.4 620.2l86.4-86.4");
    			add_location(path40, file$1, 115, 4, 5742);
    			attr_dev(path41, "d", "M811.1 732.5l112.3-112.3");
    			add_location(path41, file$1, 116, 4, 5781);
    			attr_dev(path42, "d", "M561 982.6l250.1-250.1");
    			add_location(path42, file$1, 117, 4, 5822);
    			attr_dev(g4, "fill", "none");
    			attr_dev(g4, "stroke", ctx.colors.blue);
    			attr_dev(g4, "stroke-miterlimit", "10");
    			attr_dev(g4, "stroke-width", "28");
    			add_location(g4, file$1, 110, 2, 5487);
    			attr_dev(path43, "d", "M348.6 842.2l-42.1-42.1a60 60 0 01-17.6-42.4v-63.1");
    			add_location(path43, file$1, 120, 4, 5947);
    			attr_dev(path44, "d", "M467.2 960.8L352.7 846.3");
    			add_location(path44, file$1, 121, 4, 6014);
    			attr_dev(path45, "d", "M563.5 1057l-96.3-96.2");
    			add_location(path45, file$1, 122, 4, 6055);
    			attr_dev(path46, "d", "M679.8 1173.4L563.5 1057");
    			add_location(path46, file$1, 123, 4, 6094);
    			attr_dev(path47, "d", "M811 1304.6l-131.2-131.2");
    			add_location(path47, file$1, 124, 4, 6135);
    			attr_dev(path48, "d", "M925.8 1419.4L811 1304.6");
    			add_location(path48, file$1, 125, 4, 6176);
    			attr_dev(path49, "d", "M1025.7 1519.3l-99.9-99.9");
    			add_location(path49, file$1, 126, 4, 6217);
    			attr_dev(path50, "d", "M1072.7 1619.4V1591a60 60 0 00-17.6-42.4l-29.4-29.4");
    			add_location(path50, file$1, 127, 4, 6259);
    			attr_dev(path51, "d", "M1072.7 1718.4v-99");
    			add_location(path51, file$1, 128, 4, 6327);
    			attr_dev(path52, "d", "M1072.7 1838.5v-120.1");
    			add_location(path52, file$1, 129, 4, 6362);
    			attr_dev(path53, "d", "M1072.7 1961.8v-123.3");
    			add_location(path53, file$1, 130, 4, 6400);
    			attr_dev(path54, "d", "M1072.7 2097v-135.2");
    			add_location(path54, file$1, 131, 4, 6438);
    			attr_dev(g5, "fill", "none");
    			attr_dev(g5, "stroke", ctx.colors.red);
    			attr_dev(g5, "stroke-miterlimit", "10");
    			attr_dev(g5, "stroke-width", "28");
    			add_location(g5, file$1, 119, 2, 5866);
    			attr_dev(path55, "fill", "none");
    			attr_dev(path55, "stroke", ctx.colors.green);
    			attr_dev(path55, "stroke-width", "3");
    			attr_dev(path55, "d", "M746.6 1310l-17.7-17.6-240.5 240.4a72 72 0 00-21.2 51.3v85h-15.6v20.6h56.2V1669h-15.6v-84.9a47.2 47.2 0 0114-33.6l46-46 12.2 12.1 14.5-14.6-12.2-12.2z");
    			add_location(path55, file$1, 133, 2, 6479);
    			attr_dev(use0, "width", "15.9");
    			attr_dev(use0, "height", "13.3");
    			attr_dev(use0, "transform", "rotate(180 421.7 665.3) scale(4.45)");
    			xlink_attr(use0, "xlink:href", "#a");
    			add_location(use0, file$1, 135, 2, 6697);
    			attr_dev(use1, "width", "15.9");
    			attr_dev(use1, "height", "13.3");
    			attr_dev(use1, "transform", "rotate(-90 813.4 275.5) scale(4.45)");
    			xlink_attr(use1, "xlink:href", "#a");
    			add_location(use1, file$1, 136, 2, 6797);
    			attr_dev(use2, "width", "15.9");
    			attr_dev(use2, "height", "13.3");
    			attr_dev(use2, "transform", "matrix(4.45 0 0 4.45 772.7 706.8)");
    			xlink_attr(use2, "xlink:href", "#b");
    			add_location(use2, file$1, 137, 2, 6897);
    			attr_dev(use3, "width", "15.9");
    			attr_dev(use3, "height", "13.3");
    			attr_dev(use3, "transform", "rotate(-90 778 240.2) scale(4.45)");
    			xlink_attr(use3, "xlink:href", "#b");
    			add_location(use3, file$1, 138, 2, 6995);
    			attr_dev(use4, "width", "15.9");
    			attr_dev(use4, "height", "13.3");
    			attr_dev(use4, "transform", "matrix(4.45 0 0 4.45 702 706.8)");
    			xlink_attr(use4, "xlink:href", "#c");
    			add_location(use4, file$1, 139, 2, 7093);
    			attr_dev(use5, "width", "15.9");
    			attr_dev(use5, "height", "13.3");
    			attr_dev(use5, "transform", "matrix(4.45 0 0 -4.45 702 1330.5)");
    			xlink_attr(use5, "xlink:href", "#c");
    			add_location(use5, file$1, 140, 2, 7189);
    			attr_dev(text0, "fill", ctx.colors.red);
    			attr_dev(text0, "transform", "rotate(-90 1562.5 515.7)");
    			add_location(text0, file$1, 143, 4, 7312);
    			attr_dev(text1, "fill", ctx.colors.blue);
    			attr_dev(text1, "font-size", "36");
    			attr_dev(text1, "transform", "rotate(-90 700.6 -347.6)");
    			add_location(text1, file$1, 146, 4, 7427);
    			attr_dev(text2, "fill", ctx.colors.green);
    			attr_dev(text2, "font-size", "36");
    			attr_dev(text2, "transform", "rotate(-90 415.7 -32.8)");
    			add_location(text2, file$1, 149, 4, 7544);
    			attr_dev(g6, "font-size", "34");
    			add_location(g6, file$1, 142, 2, 7289);
    			attr_dev(tspan0, "x", "88.1");
    			attr_dev(tspan0, "y", "49");
    			add_location(tspan0, file$1, 155, 16, 7767);
    			attr_dev(text3, "transform", "translate(62.7 881.9)");
    			add_location(text3, file$1, 154, 4, 7710);
    			attr_dev(tspan1, "x", "177.2");
    			attr_dev(tspan1, "y", "49");
    			add_location(tspan1, file$1, 158, 18, 7882);
    			attr_dev(text4, "transform", "translate(115.6 1021.8)");
    			add_location(text4, file$1, 157, 4, 7821);
    			attr_dev(text5, "transform", "translate(855.6 778.8)");
    			add_location(text5, file$1, 160, 4, 7936);
    			attr_dev(text6, "transform", "translate(437.7 777.4)");
    			add_location(text6, file$1, 163, 4, 8012);
    			attr_dev(tspan2, "x", "0");
    			attr_dev(tspan2, "y", "49");
    			add_location(tspan2, file$1, 167, 16, 8220);
    			attr_dev(text7, "stroke", "#fff");
    			attr_dev(text7, "stroke-linejoin", "round");
    			attr_dev(text7, "stroke-width", "10");
    			attr_dev(text7, "paint-order", "stroke");
    			attr_dev(text7, "transform", "translate(608.6 954.3)");
    			add_location(text7, file$1, 166, 4, 8085);
    			attr_dev(tspan3, "x", "0");
    			attr_dev(tspan3, "y", "49");
    			add_location(tspan3, file$1, 170, 17, 8328);
    			attr_dev(text8, "transform", "translate(981 1152.4)");
    			add_location(text8, file$1, 169, 4, 8270);
    			attr_dev(tspan4, "x", "0");
    			attr_dev(tspan4, "y", "49");
    			add_location(tspan4, file$1, 173, 17, 8438);
    			attr_dev(text9, "transform", "translate(981 1152.4)");
    			add_location(text9, file$1, 172, 4, 8380);
    			attr_dev(text10, "transform", "translate(953.7 1390.4)");
    			add_location(text10, file$1, 175, 4, 8490);
    			attr_dev(text11, "transform", "translate(1051.5 1498.2)");
    			add_location(text11, file$1, 178, 4, 8574);
    			attr_dev(text12, "transform", "translate(1110.5 1629.2)");
    			add_location(text12, file$1, 181, 4, 8650);
    			attr_dev(text13, "transform", "translate(1111 1728.2)");
    			add_location(text13, file$1, 184, 4, 8729);
    			attr_dev(tspan5, "x", "0");
    			attr_dev(tspan5, "y", "49");
    			add_location(tspan5, file$1, 188, 12, 8859);
    			attr_dev(text14, "transform", "translate(1110.7 1831.2)");
    			add_location(text14, file$1, 187, 4, 8803);
    			attr_dev(tspan6, "x", "0");
    			attr_dev(tspan6, "y", "49");
    			add_location(tspan6, file$1, 191, 16, 8974);
    			attr_dev(text15, "transform", "translate(1111.3 1971)");
    			add_location(text15, file$1, 190, 4, 8916);
    			attr_dev(text16, "transform", "translate(1111.7 2108.2)");
    			add_location(text16, file$1, 193, 4, 9024);
    			attr_dev(text17, "transform", "translate(290.7 1297.5)");
    			add_location(text17, file$1, 196, 4, 9104);
    			attr_dev(text18, "transform", "translate(850.3 1298)");
    			add_location(text18, file$1, 200, 4, 9190);
    			attr_dev(tspan7, "x", "0");
    			attr_dev(tspan7, "y", "49");
    			add_location(tspan7, file$1, 204, 18, 9321);
    			attr_dev(text19, "transform", "translate(977.6 869)");
    			add_location(text19, file$1, 203, 4, 9263);
    			attr_dev(text20, "transform", "translate(943.7 685.5)");
    			add_location(text20, file$1, 206, 4, 9374);
    			attr_dev(text21, "transform", "translate(622.7 562.9)");
    			add_location(text21, file$1, 209, 4, 9449);
    			attr_dev(text22, "transform", "translate(510.7 423.3)");
    			add_location(text22, file$1, 212, 4, 9521);
    			attr_dev(text23, "transform", "translate(511.8 308.5)");
    			add_location(text23, file$1, 215, 4, 9600);
    			attr_dev(text24, "transform", "translate(510 193.2)");
    			add_location(text24, file$1, 218, 4, 9674);
    			attr_dev(text25, "transform", "translate(510.5 79)");
    			add_location(text25, file$1, 221, 4, 9749);
    			attr_dev(text26, "transform", "translate(1033 595.6)");
    			add_location(text26, file$1, 224, 4, 9819);
    			attr_dev(tspan8, "x", "0");
    			attr_dev(tspan8, "y", "49");
    			add_location(tspan8, file$1, 228, 15, 9949);
    			attr_dev(text27, "transform", "translate(1110.2 433.8)");
    			add_location(text27, file$1, 227, 4, 9891);
    			attr_dev(tspan9, "x", "0");
    			attr_dev(tspan9, "y", "49");
    			add_location(tspan9, file$1, 231, 15, 10060);
    			attr_dev(text28, "transform", "translate(1111.3 284)");
    			add_location(text28, file$1, 230, 4, 10004);
    			attr_dev(text29, "transform", "translate(1109.5 183.8)");
    			add_location(text29, file$1, 233, 4, 10112);
    			attr_dev(text30, "transform", "translate(1110.9 78.4)");
    			add_location(text30, file$1, 236, 4, 10189);
    			attr_dev(tspan10, "x", "0");
    			attr_dev(tspan10, "y", "49");
    			add_location(tspan10, file$1, 240, 12, 10398);
    			attr_dev(text31, "stroke", "#fff");
    			attr_dev(text31, "stroke-linejoin", "round");
    			attr_dev(text31, "stroke-width", "10");
    			attr_dev(text31, "paint-order", "stroke");
    			attr_dev(text31, "transform", "translate(604.7 1071.4)");
    			add_location(text31, file$1, 239, 4, 10266);
    			attr_dev(text32, "transform", "translate(197.5 1209.6)");
    			add_location(text32, file$1, 242, 4, 10454);
    			attr_dev(tspan11, "x", "97.1");
    			attr_dev(tspan11, "y", "49");
    			add_location(tspan11, file$1, 246, 13, 10589);
    			attr_dev(text33, "transform", "translate(42.8 703)");
    			add_location(text33, file$1, 245, 4, 10537);
    			attr_dev(g7, "fill", ctx.colors.text);
    			attr_dev(g7, "font-size", "53");
    			add_location(g7, file$1, 153, 2, 7668);
    			attr_dev(text34, "transform", "translate(573.1 1555.8)");
    			add_location(text34, file$1, 251, 2, 10693);
    			attr_dev(text35, "transform", "translate(519.1 1689.8)");
    			add_location(text35, file$1, 254, 4, 10771);
    			attr_dev(g8, "fill", ctx.colors.textDisable);
    			attr_dev(g8, "font-size", "53");
    			add_location(g8, file$1, 250, 1, 10646);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "class", "metromap");
    			attr_dev(svg, "font-family", "Tahoma, Tahoma");
    			attr_dev(svg, "viewBox", "0 0 1501.2 2150.6");
    			add_location(svg, file$1, 62, 0, 3049);
    			attr_dev(div, "class", "lol");
    			add_location(div, file$1, 60, 0, 3030);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			mount_component(symbols, svg, null);
    			append_dev(svg, g0);
    			append_dev(g0, path0);
    			append_dev(g0, path1);
    			append_dev(g0, path2);
    			append_dev(g0, path3);
    			append_dev(g0, path4);
    			append_dev(g0, path5);
    			append_dev(g0, path6);
    			append_dev(g0, path7);
    			append_dev(g0, path8);
    			append_dev(g0, path9);
    			append_dev(g0, path10);
    			append_dev(g0, path11);
    			append_dev(g0, path12);
    			append_dev(svg, g1);
    			append_dev(g1, path13);
    			append_dev(g1, path14);
    			append_dev(g1, path15);
    			append_dev(g1, path16);
    			append_dev(g1, path17);
    			append_dev(g1, path18);
    			append_dev(g1, path19);
    			append_dev(g1, path20);
    			append_dev(svg, g2);
    			append_dev(g2, path21);
    			append_dev(g2, path22);
    			append_dev(g2, path23);
    			append_dev(g2, path24);
    			append_dev(g2, path25);
    			append_dev(g2, path26);
    			append_dev(g2, path27);
    			append_dev(svg, g3);
    			append_dev(g3, path28);
    			append_dev(g3, path29);
    			append_dev(g3, path30);
    			append_dev(g3, path31);
    			append_dev(g3, path32);
    			append_dev(g3, path33);
    			append_dev(g3, path34);
    			append_dev(g3, path35);
    			append_dev(svg, g4);
    			append_dev(g4, path36);
    			append_dev(g4, path37);
    			append_dev(g4, path38);
    			append_dev(g4, path39);
    			append_dev(g4, path40);
    			append_dev(g4, path41);
    			append_dev(g4, path42);
    			append_dev(svg, g5);
    			append_dev(g5, path43);
    			append_dev(g5, path44);
    			append_dev(g5, path45);
    			append_dev(g5, path46);
    			append_dev(g5, path47);
    			append_dev(g5, path48);
    			append_dev(g5, path49);
    			append_dev(g5, path50);
    			append_dev(g5, path51);
    			append_dev(g5, path52);
    			append_dev(g5, path53);
    			append_dev(g5, path54);
    			append_dev(svg, path55);
    			append_dev(svg, use0);
    			append_dev(svg, use1);
    			append_dev(svg, use2);
    			append_dev(svg, use3);
    			append_dev(svg, use4);
    			append_dev(svg, use5);
    			append_dev(svg, g6);
    			append_dev(g6, text0);
    			append_dev(text0, t0);
    			append_dev(g6, text1);
    			append_dev(text1, t1);
    			append_dev(g6, text2);
    			append_dev(text2, t2);
    			append_dev(svg, g7);
    			append_dev(g7, text3);
    			append_dev(text3, t3);
    			append_dev(text3, tspan0);
    			append_dev(tspan0, t4);
    			append_dev(g7, text4);
    			append_dev(text4, t5);
    			append_dev(text4, tspan1);
    			append_dev(tspan1, t6);
    			append_dev(g7, text5);
    			append_dev(text5, t7);
    			append_dev(g7, text6);
    			append_dev(text6, t8);
    			append_dev(g7, text7);
    			append_dev(text7, t9);
    			append_dev(text7, tspan2);
    			append_dev(tspan2, t10);
    			append_dev(g7, text8);
    			append_dev(text8, t11);
    			append_dev(text8, tspan3);
    			append_dev(tspan3, t12);
    			append_dev(g7, text9);
    			append_dev(text9, t13);
    			append_dev(text9, tspan4);
    			append_dev(tspan4, t14);
    			append_dev(g7, text10);
    			append_dev(text10, t15);
    			append_dev(g7, text11);
    			append_dev(text11, t16);
    			append_dev(g7, text12);
    			append_dev(text12, t17);
    			append_dev(g7, text13);
    			append_dev(text13, t18);
    			append_dev(g7, text14);
    			append_dev(text14, t19);
    			append_dev(text14, tspan5);
    			append_dev(tspan5, t20);
    			append_dev(g7, text15);
    			append_dev(text15, t21);
    			append_dev(text15, tspan6);
    			append_dev(tspan6, t22);
    			append_dev(g7, text16);
    			append_dev(text16, t23);
    			append_dev(g7, text17);
    			append_dev(text17, t24);
    			append_dev(g7, text18);
    			append_dev(text18, t25);
    			append_dev(g7, text19);
    			append_dev(text19, t26);
    			append_dev(text19, tspan7);
    			append_dev(tspan7, t27);
    			append_dev(g7, text20);
    			append_dev(text20, t28);
    			append_dev(g7, text21);
    			append_dev(text21, t29);
    			append_dev(g7, text22);
    			append_dev(text22, t30);
    			append_dev(g7, text23);
    			append_dev(text23, t31);
    			append_dev(g7, text24);
    			append_dev(text24, t32);
    			append_dev(g7, text25);
    			append_dev(text25, t33);
    			append_dev(g7, text26);
    			append_dev(text26, t34);
    			append_dev(g7, text27);
    			append_dev(text27, t35);
    			append_dev(text27, tspan8);
    			append_dev(tspan8, t36);
    			append_dev(g7, text28);
    			append_dev(text28, t37);
    			append_dev(text28, tspan9);
    			append_dev(tspan9, t38);
    			append_dev(g7, text29);
    			append_dev(text29, t39);
    			append_dev(g7, text30);
    			append_dev(text30, t40);
    			append_dev(g7, text31);
    			append_dev(text31, t41);
    			append_dev(text31, tspan10);
    			append_dev(tspan10, t42);
    			append_dev(g7, text32);
    			append_dev(text32, t43);
    			append_dev(g7, text33);
    			append_dev(text33, t44);
    			append_dev(text33, tspan11);
    			append_dev(tspan11, t45);
    			append_dev(svg, g8);
    			append_dev(g8, text34);
    			append_dev(text34, t46);
    			append_dev(g8, text35);
    			append_dev(text35, t47);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(symbols.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(symbols.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			destroy_component(symbols);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$1($$self) {
    	const colors = {
    		red: "#d22531",
    		blue: "#2060ba",
    		green: "#41a747",
    		text: "#09303b",
    		textDisable: "#9c98a6"
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {};

    	return { colors };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$1.name });
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
