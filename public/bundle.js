
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
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
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
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(changed, child_ctx);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
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

    // utility functions used in the project
    // prepend a zero to integers smaller than 10 (used for the second and minute values)
    function zeroPadded(number) {
      return number >= 10 ? number.toString() : `0${number}`;
    }
    // consider the last digit of the input number (used for the tenths of seconds)
    function lastDigit(number) {
      return number.toString().slice(-2);
    }

    /* format time in the following format
    mm:ss:t
    zero padded minutes, zero padded seconds, tenths of seconds
    */
    function formatTime(milliseconds) {
      const mm = zeroPadded(Math.floor(milliseconds / 1000 / 60));
      const ss = zeroPadded(Math.floor(milliseconds / 1000) % 60);
      const t = lastDigit(Math.floor(milliseconds / 10));
      return `${mm}:${ss}.${t}`;
    }

    /* src/stopWatch/StopWatchSVG.svelte generated by Svelte v3.12.1 */

    const file = "src/stopWatch/StopWatchSVG.svelte";

    function create_fragment(ctx) {
    	var svg, g4, circle0, use, g1, g0, path0, g1_transform_value, g3, g2, path1, g2_transform_value, circle1, circle2, text_1, t_value = formatTime(ctx.lapse) + "", t;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g4 = svg_element("g");
    			circle0 = svg_element("circle");
    			use = svg_element("use");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			g3 = svg_element("g");
    			g2 = svg_element("g");
    			path1 = svg_element("path");
    			circle1 = svg_element("circle");
    			circle2 = svg_element("circle");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(circle0, "id", "dial");
    			attr_dev(circle0, "cx", "0");
    			attr_dev(circle0, "cy", "0");
    			attr_dev(circle0, "r", "42");
    			attr_dev(circle0, "fill", "none");
    			attr_dev(circle0, "stroke", "currentColor");
    			attr_dev(circle0, "stroke-width", "5");
    			attr_dev(circle0, "stroke-dasharray", "0.3 1.898");
    			add_location(circle0, file, 30, 8, 764);
    			attr_dev(use, "href", "#dial");
    			attr_dev(use, "transform", "scale(-1 1)");
    			add_location(use, file, 31, 8, 901);
    			attr_dev(path0, "d", "M -2.25 0 h 4.5 l -2.25 2.5 l -2.25 -2.5");
    			attr_dev(path0, "fill", "currentColor");
    			attr_dev(path0, "stroke", "currentColor");
    			attr_dev(path0, "stroke-width", "1");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "stroke-linecap", "round");
    			add_location(path0, file, 35, 16, 1077);
    			attr_dev(g0, "transform", "translate(0 -50)");
    			add_location(g0, file, 34, 12, 1028);
    			attr_dev(g1, "transform", g1_transform_value = "rotate(" + ctx.rotation + ")");
    			add_location(g1, file, 33, 8, 959);
    			attr_dev(path1, "d", "M 0 -1 v -7.5");
    			attr_dev(path1, "fill", "none");
    			attr_dev(path1, "stroke", "currentColor");
    			attr_dev(path1, "stroke-width", "0.4");
    			attr_dev(path1, "stroke-linejoin", "round");
    			attr_dev(path1, "stroke-linecap", "round");
    			add_location(path1, file, 41, 16, 1411);
    			attr_dev(g2, "transform", g2_transform_value = "rotate(" + (ctx.rotation * 60) % 360 + ")");
    			add_location(g2, file, 40, 12, 1325);
    			attr_dev(circle1, "r", "9");
    			attr_dev(circle1, "fill", "none");
    			attr_dev(circle1, "stroke", "currentColor");
    			attr_dev(circle1, "stroke-width", "0.4");
    			add_location(circle1, file, 43, 12, 1572);
    			attr_dev(circle2, "r", "1");
    			attr_dev(circle2, "fill", "none");
    			attr_dev(circle2, "stroke", "currentColor");
    			attr_dev(circle2, "stroke-width", "0.4");
    			add_location(circle2, file, 44, 12, 1661);
    			attr_dev(g3, "transform", "translate(0 20)");
    			add_location(g3, file, 39, 8, 1281);
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "fill", "currentColor");
    			attr_dev(text_1, "dominant-baseline", "middle");
    			attr_dev(text_1, "font-size", "14");
    			set_style(text_1, "font-weight", "300");
    			set_style(text_1, "letter-spacing", "1px");
    			add_location(text_1, file, 47, 8, 1760);
    			attr_dev(g4, "transform", "translate(50 50)");
    			add_location(g4, file, 29, 4, 723);
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "width", "200");
    			attr_dev(svg, "height", "200");
    			attr_dev(svg, "class", "svelte-1ff0jg8");
    			add_location(svg, file, 28, 0, 666);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g4);
    			append_dev(g4, circle0);
    			append_dev(g4, use);
    			append_dev(g4, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path0);
    			ctx.g1_binding(g1);
    			append_dev(g4, g3);
    			append_dev(g3, g2);
    			append_dev(g2, path1);
    			ctx.g2_binding(g2);
    			append_dev(g3, circle1);
    			append_dev(g3, circle2);
    			append_dev(g4, text_1);
    			append_dev(text_1, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.rotation) && g1_transform_value !== (g1_transform_value = "rotate(" + ctx.rotation + ")")) {
    				attr_dev(g1, "transform", g1_transform_value);
    			}

    			if ((changed.rotation) && g2_transform_value !== (g2_transform_value = "rotate(" + (ctx.rotation * 60) % 360 + ")")) {
    				attr_dev(g2, "transform", g2_transform_value);
    			}

    			if ((changed.lapse) && t_value !== (t_value = formatTime(ctx.lapse) + "")) {
    				set_data_dev(t, t_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(svg);
    			}

    			ctx.g1_binding(null);
    			ctx.g2_binding(null);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { lapse = 0 } = $$props;
        let seconds;
        let minutes;
        let transitioned;

    	const writable_props = ['lapse'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<StopWatchSVG> was created with unknown prop '${key}'`);
    	});

    	function g1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('minutes', minutes = $$value);
    		});
    	}

    	function g2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('seconds', seconds = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('lapse' in $$props) $$invalidate('lapse', lapse = $$props.lapse);
    	};

    	$$self.$capture_state = () => {
    		return { lapse, seconds, minutes, transitioned, rotation };
    	};

    	$$self.$inject_state = $$props => {
    		if ('lapse' in $$props) $$invalidate('lapse', lapse = $$props.lapse);
    		if ('seconds' in $$props) $$invalidate('seconds', seconds = $$props.seconds);
    		if ('minutes' in $$props) $$invalidate('minutes', minutes = $$props.minutes);
    		if ('transitioned' in $$props) $$invalidate('transitioned', transitioned = $$props.transitioned);
    		if ('rotation' in $$props) $$invalidate('rotation', rotation = $$props.rotation);
    	};

    	let rotation;

    	$$self.$$.update = ($$dirty = { lapse: 1, minutes: 1, seconds: 1, transitioned: 1 }) => {
    		if ($$dirty.lapse) { $$invalidate('rotation', rotation = ((lapse / 1000 / 60) * 360) % 360); }
    		if ($$dirty.lapse || $$dirty.minutes || $$dirty.seconds) { if (!lapse && minutes && seconds) {
                    $$invalidate('minutes', minutes.style.transition = "transform 0.2s ease-in-out", minutes);
                    $$invalidate('seconds', seconds.style.transition = "transform 0.2s ease-in-out", seconds);
                    $$invalidate('transitioned', transitioned = false);
                } }
    		if ($$dirty.lapse || $$dirty.transitioned) { if (lapse && !transitioned) {
                    $$invalidate('minutes', minutes.style.transition = "none", minutes);
                    $$invalidate('seconds', seconds.style.transition = "none", seconds);
                    $$invalidate('transitioned', transitioned = true);
                } }
    	};

    	return {
    		lapse,
    		seconds,
    		minutes,
    		rotation,
    		g1_binding,
    		g2_binding
    	};
    }

    class StopWatchSVG extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["lapse"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "StopWatchSVG", options, id: create_fragment.name });
    	}

    	get lapse() {
    		throw new Error("<StopWatchSVG>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lapse(value) {
    		throw new Error("<StopWatchSVG>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    // set up a readable store which returns the number of milliseconds between the moment the store is subscribed and following an interval
    const time = readable(0, function start(set) {
    	const beginning = new Date();
    	const beginningTime = beginning.getTime();

    	const interval = setInterval(() => {
    		const current = new Date();
    		const currentTime = current.getTime();
    		set(currentTime - beginningTime);
    	}, 10);

    	return function stop() {
    		// ! forcedly set the readable value to 0 before clearing the interval
    		// it seems the store would otherwise retain the last value and the application would stagger from this value straight to 0
    		set(0);
    		clearInterval(interval);
    	};
    });

    /* src/stopWatch/StopWatch.svelte generated by Svelte v3.12.1 */

    const file$1 = "src/stopWatch/StopWatch.svelte";

    function create_fragment$1(ctx) {
    	var div, current;

    	var stopwatchsvg = new StopWatchSVG({
    		props: { lapse: ctx.lapse },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			stopwatchsvg.$$.fragment.c();
    			attr_dev(div, "class", "stopwatch");
    			add_location(div, file$1, 46, 0, 675);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(stopwatchsvg, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var stopwatchsvg_changes = {};
    			if (changed.lapse) stopwatchsvg_changes.lapse = ctx.lapse;
    			stopwatchsvg.$set(stopwatchsvg_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(stopwatchsvg.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(stopwatchsvg.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			destroy_component(stopwatchsvg);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	

      let { running = false } = $$props;

      let lapse = 0;
      let unsubscribe;

      function start() {
        $$invalidate('unsubscribe', unsubscribe = time.subscribe(value => {
          $$invalidate('lapse', lapse = value);
        }));
      }

      function pause() {
        terminate();
      }

      function terminate() {
        if (unsubscribe) {
          unsubscribe();
          $$invalidate('unsubscribe', unsubscribe = null);
        }
      }

      function stop() {
        $$invalidate('lapse', lapse = 0);
        terminate();
      }

      onDestroy(() => {
        terminate();
      });

    	const writable_props = ['running'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<StopWatch> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('running' in $$props) $$invalidate('running', running = $$props.running);
    	};

    	$$self.$capture_state = () => {
    		return { running, lapse, unsubscribe, subscription };
    	};

    	$$self.$inject_state = $$props => {
    		if ('running' in $$props) $$invalidate('running', running = $$props.running);
    		if ('lapse' in $$props) $$invalidate('lapse', lapse = $$props.lapse);
    		if ('unsubscribe' in $$props) $$invalidate('unsubscribe', unsubscribe = $$props.unsubscribe);
    		if ('subscription' in $$props) subscription = $$props.subscription;
    	};

    	let subscription;

    	$$self.$$.update = ($$dirty = { running: 1, unsubscribe: 1 }) => {
    		if ($$dirty.running) { if (running) {
            stop();
            start();
          } else {
            pause();
          } }
    		if ($$dirty.unsubscribe) { subscription = !!unsubscribe; }
    	};

    	return { running, lapse };
    }

    class StopWatch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["running"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "StopWatch", options, id: create_fragment$1.name });
    	}

    	get running() {
    		throw new Error("<StopWatch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set running(value) {
    		throw new Error("<StopWatch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pathCalculate/ResultGrid.svelte generated by Svelte v3.12.1 */

    const file$2 = "src/pathCalculate/ResultGrid.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	return child_ctx;
    }

    // (118:8) {#each population as item}
    function create_each_block(ctx) {
    	var p, t_value = ctx.item.toString() + "", t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-1x3fcmm");
    			add_location(p, file$2, 118, 10, 2669);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.population) && t_value !== (t_value = ctx.item.toString() + "")) {
    				set_data_dev(t, t_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(118:8) {#each population as item}", ctx });
    	return block;
    }

    function create_fragment$2(ctx) {
    	var div30, div13, div0, t0, div3, div1, t2, div2, t3_value = ctx.graph.nodes().length + "", t3, t4, div6, div4, t6, div5, t7, t8, div9, div7, t10, div8, t11, t12, div12, div10, t14, div11, t15, t16, div29, div16, div14, t18, div15, p0, t19, t20, div19, div17, t22, div18, p1, t23_value = ctx.best.toString() + "", t23, t24, div22, div20, t26, div21, p2, t27, t28, div25, div23, t30, div24, p3, t31_value = ctx.currentBest.bestValue + "", t31, t32, div28, div26, t34, div27, current;

    	var stopwatch = new StopWatch({
    		props: { running: ctx.running },
    		$$inline: true
    	});

    	let each_value = ctx.population;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div30 = element("div");
    			div13 = element("div");
    			div0 = element("div");
    			stopwatch.$$.fragment.c();
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			div1.textContent = "Stations:";
    			t2 = space();
    			div2 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div6 = element("div");
    			div4 = element("div");
    			div4.textContent = "Generation:";
    			t6 = space();
    			div5 = element("div");
    			t7 = text(ctx.currentGeneration);
    			t8 = space();
    			div9 = element("div");
    			div7 = element("div");
    			div7.textContent = "Mutations:";
    			t10 = space();
    			div8 = element("div");
    			t11 = text(ctx.mutationsCount);
    			t12 = space();
    			div12 = element("div");
    			div10 = element("div");
    			div10.textContent = "Best value:";
    			t14 = space();
    			div11 = element("div");
    			t15 = text(ctx.bestValue);
    			t16 = space();
    			div29 = element("div");
    			div16 = element("div");
    			div14 = element("div");
    			div14.textContent = "Сhange of the best result";
    			t18 = space();
    			div15 = element("div");
    			p0 = element("p");
    			t19 = text(ctx.bestValuesString);
    			t20 = space();
    			div19 = element("div");
    			div17 = element("div");
    			div17.textContent = "Best path";
    			t22 = space();
    			div18 = element("div");
    			p1 = element("p");
    			t23 = text(t23_value);
    			t24 = space();
    			div22 = element("div");
    			div20 = element("div");
    			div20.textContent = "Best path in current population";
    			t26 = space();
    			div21 = element("div");
    			p2 = element("p");
    			t27 = text(ctx.bestPopulation);
    			t28 = space();
    			div25 = element("div");
    			div23 = element("div");
    			div23.textContent = "Best value in population";
    			t30 = space();
    			div24 = element("div");
    			p3 = element("p");
    			t31 = text(t31_value);
    			t32 = space();
    			div28 = element("div");
    			div26 = element("div");
    			div26.textContent = "Population";
    			t34 = space();
    			div27 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "stop-watch svelte-1x3fcmm");
    			add_location(div0, file$2, 64, 4, 1208);
    			attr_dev(div1, "class", "label");
    			add_location(div1, file$2, 68, 6, 1302);
    			attr_dev(div2, "class", "value svelte-1x3fcmm");
    			add_location(div2, file$2, 69, 6, 1343);
    			attr_dev(div3, "class", "row svelte-1x3fcmm");
    			add_location(div3, file$2, 67, 4, 1278);
    			attr_dev(div4, "class", "label");
    			add_location(div4, file$2, 72, 6, 1430);
    			attr_dev(div5, "class", "value svelte-1x3fcmm");
    			add_location(div5, file$2, 73, 6, 1473);
    			attr_dev(div6, "class", "row svelte-1x3fcmm");
    			add_location(div6, file$2, 71, 4, 1406);
    			attr_dev(div7, "class", "label");
    			add_location(div7, file$2, 76, 6, 1557);
    			attr_dev(div8, "class", "value svelte-1x3fcmm");
    			add_location(div8, file$2, 77, 6, 1599);
    			attr_dev(div9, "class", "row svelte-1x3fcmm");
    			add_location(div9, file$2, 75, 4, 1533);
    			attr_dev(div10, "class", "label svelte-1x3fcmm");
    			add_location(div10, file$2, 80, 6, 1691);
    			attr_dev(div11, "class", "value svelte-1x3fcmm");
    			add_location(div11, file$2, 81, 6, 1734);
    			attr_dev(div12, "class", "row row-result svelte-1x3fcmm");
    			add_location(div12, file$2, 79, 4, 1656);
    			attr_dev(div13, "class", "table svelte-1x3fcmm");
    			add_location(div13, file$2, 63, 2, 1184);
    			attr_dev(div14, "class", "label-row svelte-1x3fcmm");
    			add_location(div14, file$2, 87, 6, 1849);
    			attr_dev(p0, "class", "svelte-1x3fcmm");
    			add_location(p0, file$2, 89, 8, 1942);
    			attr_dev(div15, "class", "value-row svelte-1x3fcmm");
    			add_location(div15, file$2, 88, 6, 1910);
    			attr_dev(div16, "class", "paths-row svelte-1x3fcmm");
    			add_location(div16, file$2, 86, 4, 1819);
    			attr_dev(div17, "class", "label-row svelte-1x3fcmm");
    			add_location(div17, file$2, 94, 6, 2029);
    			attr_dev(p1, "class", "svelte-1x3fcmm");
    			add_location(p1, file$2, 96, 8, 2106);
    			attr_dev(div18, "class", "value-row svelte-1x3fcmm");
    			add_location(div18, file$2, 95, 6, 2074);
    			attr_dev(div19, "class", "paths-row svelte-1x3fcmm");
    			add_location(div19, file$2, 93, 4, 1999);
    			attr_dev(div20, "class", "label-row svelte-1x3fcmm");
    			add_location(div20, file$2, 101, 6, 2190);
    			attr_dev(p2, "class", "svelte-1x3fcmm");
    			add_location(p2, file$2, 103, 8, 2289);
    			attr_dev(div21, "class", "value-row svelte-1x3fcmm");
    			add_location(div21, file$2, 102, 6, 2257);
    			attr_dev(div22, "class", "paths-row svelte-1x3fcmm");
    			add_location(div22, file$2, 100, 4, 2160);
    			attr_dev(div23, "class", "label-row svelte-1x3fcmm");
    			add_location(div23, file$2, 108, 6, 2372);
    			attr_dev(p3, "class", "svelte-1x3fcmm");
    			add_location(p3, file$2, 110, 8, 2464);
    			attr_dev(div24, "class", "value-row svelte-1x3fcmm");
    			add_location(div24, file$2, 109, 6, 2432);
    			attr_dev(div25, "class", "paths-row svelte-1x3fcmm");
    			add_location(div25, file$2, 107, 4, 2342);
    			attr_dev(div26, "class", "label-row svelte-1x3fcmm");
    			add_location(div26, file$2, 115, 6, 2554);
    			attr_dev(div27, "class", "value-row svelte-1x3fcmm");
    			add_location(div27, file$2, 116, 6, 2600);
    			attr_dev(div28, "class", "paths-row svelte-1x3fcmm");
    			add_location(div28, file$2, 114, 4, 2524);
    			attr_dev(div29, "class", "paths svelte-1x3fcmm");
    			add_location(div29, file$2, 85, 2, 1795);
    			attr_dev(div30, "class", "info svelte-1x3fcmm");
    			add_location(div30, file$2, 62, 0, 1163);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div30, anchor);
    			append_dev(div30, div13);
    			append_dev(div13, div0);
    			mount_component(stopwatch, div0, null);
    			append_dev(div13, t0);
    			append_dev(div13, div3);
    			append_dev(div3, div1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, t3);
    			append_dev(div13, t4);
    			append_dev(div13, div6);
    			append_dev(div6, div4);
    			append_dev(div6, t6);
    			append_dev(div6, div5);
    			append_dev(div5, t7);
    			append_dev(div13, t8);
    			append_dev(div13, div9);
    			append_dev(div9, div7);
    			append_dev(div9, t10);
    			append_dev(div9, div8);
    			append_dev(div8, t11);
    			append_dev(div13, t12);
    			append_dev(div13, div12);
    			append_dev(div12, div10);
    			append_dev(div12, t14);
    			append_dev(div12, div11);
    			append_dev(div11, t15);
    			append_dev(div30, t16);
    			append_dev(div30, div29);
    			append_dev(div29, div16);
    			append_dev(div16, div14);
    			append_dev(div16, t18);
    			append_dev(div16, div15);
    			append_dev(div15, p0);
    			append_dev(p0, t19);
    			append_dev(div29, t20);
    			append_dev(div29, div19);
    			append_dev(div19, div17);
    			append_dev(div19, t22);
    			append_dev(div19, div18);
    			append_dev(div18, p1);
    			append_dev(p1, t23);
    			append_dev(div29, t24);
    			append_dev(div29, div22);
    			append_dev(div22, div20);
    			append_dev(div22, t26);
    			append_dev(div22, div21);
    			append_dev(div21, p2);
    			append_dev(p2, t27);
    			append_dev(div29, t28);
    			append_dev(div29, div25);
    			append_dev(div25, div23);
    			append_dev(div25, t30);
    			append_dev(div25, div24);
    			append_dev(div24, p3);
    			append_dev(p3, t31);
    			append_dev(div29, t32);
    			append_dev(div29, div28);
    			append_dev(div28, div26);
    			append_dev(div28, t34);
    			append_dev(div28, div27);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div27, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var stopwatch_changes = {};
    			if (changed.running) stopwatch_changes.running = ctx.running;
    			stopwatch.$set(stopwatch_changes);

    			if ((!current || changed.graph) && t3_value !== (t3_value = ctx.graph.nodes().length + "")) {
    				set_data_dev(t3, t3_value);
    			}

    			if (!current || changed.currentGeneration) {
    				set_data_dev(t7, ctx.currentGeneration);
    			}

    			if (!current || changed.mutationsCount) {
    				set_data_dev(t11, ctx.mutationsCount);
    			}

    			if (!current || changed.bestValue) {
    				set_data_dev(t15, ctx.bestValue);
    			}

    			if (!current || changed.bestValuesString) {
    				set_data_dev(t19, ctx.bestValuesString);
    			}

    			if ((!current || changed.best) && t23_value !== (t23_value = ctx.best.toString() + "")) {
    				set_data_dev(t23, t23_value);
    			}

    			if (!current || changed.bestPopulation) {
    				set_data_dev(t27, ctx.bestPopulation);
    			}

    			if ((!current || changed.currentBest) && t31_value !== (t31_value = ctx.currentBest.bestValue + "")) {
    				set_data_dev(t31, t31_value);
    			}

    			if (changed.population) {
    				each_value = ctx.population;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div27, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(stopwatch.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(stopwatch.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div30);
    			}

    			destroy_component(stopwatch);

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { running, graph, currentGeneration, mutationsCount, bestValue, currentBest, population, best, bestValuesArray } = $$props;

    	const writable_props = ['running', 'graph', 'currentGeneration', 'mutationsCount', 'bestValue', 'currentBest', 'population', 'best', 'bestValuesArray'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<ResultGrid> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('running' in $$props) $$invalidate('running', running = $$props.running);
    		if ('graph' in $$props) $$invalidate('graph', graph = $$props.graph);
    		if ('currentGeneration' in $$props) $$invalidate('currentGeneration', currentGeneration = $$props.currentGeneration);
    		if ('mutationsCount' in $$props) $$invalidate('mutationsCount', mutationsCount = $$props.mutationsCount);
    		if ('bestValue' in $$props) $$invalidate('bestValue', bestValue = $$props.bestValue);
    		if ('currentBest' in $$props) $$invalidate('currentBest', currentBest = $$props.currentBest);
    		if ('population' in $$props) $$invalidate('population', population = $$props.population);
    		if ('best' in $$props) $$invalidate('best', best = $$props.best);
    		if ('bestValuesArray' in $$props) $$invalidate('bestValuesArray', bestValuesArray = $$props.bestValuesArray);
    	};

    	$$self.$capture_state = () => {
    		return { running, graph, currentGeneration, mutationsCount, bestValue, currentBest, population, best, bestValuesArray, bestPopulation, bestValuesString };
    	};

    	$$self.$inject_state = $$props => {
    		if ('running' in $$props) $$invalidate('running', running = $$props.running);
    		if ('graph' in $$props) $$invalidate('graph', graph = $$props.graph);
    		if ('currentGeneration' in $$props) $$invalidate('currentGeneration', currentGeneration = $$props.currentGeneration);
    		if ('mutationsCount' in $$props) $$invalidate('mutationsCount', mutationsCount = $$props.mutationsCount);
    		if ('bestValue' in $$props) $$invalidate('bestValue', bestValue = $$props.bestValue);
    		if ('currentBest' in $$props) $$invalidate('currentBest', currentBest = $$props.currentBest);
    		if ('population' in $$props) $$invalidate('population', population = $$props.population);
    		if ('best' in $$props) $$invalidate('best', best = $$props.best);
    		if ('bestValuesArray' in $$props) $$invalidate('bestValuesArray', bestValuesArray = $$props.bestValuesArray);
    		if ('bestPopulation' in $$props) $$invalidate('bestPopulation', bestPopulation = $$props.bestPopulation);
    		if ('bestValuesString' in $$props) $$invalidate('bestValuesString', bestValuesString = $$props.bestValuesString);
    	};

    	let bestPopulation, bestValuesString;

    	$$self.$$.update = ($$dirty = { population: 1, currentBest: 1, bestValuesArray: 1 }) => {
    		if ($$dirty.population || $$dirty.currentBest) { $$invalidate('bestPopulation', bestPopulation =
            population[currentBest.bestPosition] ?
            population[currentBest.bestPosition].toString() : ''); }
    		if ($$dirty.bestValuesArray) { $$invalidate('bestValuesString', bestValuesString = bestValuesArray.join(" > ").toString()); }
    	};

    	return {
    		running,
    		graph,
    		currentGeneration,
    		mutationsCount,
    		bestValue,
    		currentBest,
    		population,
    		best,
    		bestValuesArray,
    		bestPopulation,
    		bestValuesString
    	};
    }

    class ResultGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["running", "graph", "currentGeneration", "mutationsCount", "bestValue", "currentBest", "population", "best", "bestValuesArray"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "ResultGrid", options, id: create_fragment$2.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.running === undefined && !('running' in props)) {
    			console.warn("<ResultGrid> was created without expected prop 'running'");
    		}
    		if (ctx.graph === undefined && !('graph' in props)) {
    			console.warn("<ResultGrid> was created without expected prop 'graph'");
    		}
    		if (ctx.currentGeneration === undefined && !('currentGeneration' in props)) {
    			console.warn("<ResultGrid> was created without expected prop 'currentGeneration'");
    		}
    		if (ctx.mutationsCount === undefined && !('mutationsCount' in props)) {
    			console.warn("<ResultGrid> was created without expected prop 'mutationsCount'");
    		}
    		if (ctx.bestValue === undefined && !('bestValue' in props)) {
    			console.warn("<ResultGrid> was created without expected prop 'bestValue'");
    		}
    		if (ctx.currentBest === undefined && !('currentBest' in props)) {
    			console.warn("<ResultGrid> was created without expected prop 'currentBest'");
    		}
    		if (ctx.population === undefined && !('population' in props)) {
    			console.warn("<ResultGrid> was created without expected prop 'population'");
    		}
    		if (ctx.best === undefined && !('best' in props)) {
    			console.warn("<ResultGrid> was created without expected prop 'best'");
    		}
    		if (ctx.bestValuesArray === undefined && !('bestValuesArray' in props)) {
    			console.warn("<ResultGrid> was created without expected prop 'bestValuesArray'");
    		}
    	}

    	get running() {
    		throw new Error("<ResultGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set running(value) {
    		throw new Error("<ResultGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get graph() {
    		throw new Error("<ResultGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set graph(value) {
    		throw new Error("<ResultGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentGeneration() {
    		throw new Error("<ResultGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentGeneration(value) {
    		throw new Error("<ResultGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mutationsCount() {
    		throw new Error("<ResultGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mutationsCount(value) {
    		throw new Error("<ResultGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bestValue() {
    		throw new Error("<ResultGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bestValue(value) {
    		throw new Error("<ResultGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentBest() {
    		throw new Error("<ResultGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentBest(value) {
    		throw new Error("<ResultGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get population() {
    		throw new Error("<ResultGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set population(value) {
    		throw new Error("<ResultGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get best() {
    		throw new Error("<ResultGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set best(value) {
    		throw new Error("<ResultGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bestValuesArray() {
    		throw new Error("<ResultGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bestValuesArray(value) {
    		throw new Error("<ResultGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const count = writable(0);

    function randomNumber(boundary) {
      return parseInt(Math.random() * boundary);
    }

    function evaluate(indivial, dis) {
      return indivial.reduce(
        (sum, element, index, array) => (sum += dis[element][array[index - 1]])
      );
    }

    function randomIndivial(length) {
      return Array.from(Array(length).keys()).shuffle();
    }

    function getCurrentBest(values) {
      const min = values.min();

      return {
        bestValue: min,
        bestPosition: values.indexOf(min)
      };
    }

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

    // Functions with side effects
    function mutationIteration(array) {
      count.update(n => n + 1);
      return array;
    }
    const reverseMutate = seq => mutationIteration(reverseMutateMath(seq));
    const doMutate = seq => mutationIteration(doMutateMath(seq));
    const pushMutate = seq => mutationIteration(pushMutateMath(seq));

    // Main components
    function selection(population, currentBest, best, values, populationSize) {
      let newPopulation = population.clone();

      let parents = new Array();
      let initnum = 5;
      parents.push(newPopulation[currentBest.bestPosition]);
      parents.push(doMutate(best.clone()));
      parents.push(pushMutate(best.clone()));
      parents.push(reverseMutate(best.clone()));
      parents.push(best.clone());

      const roulette = createRoulette(values);

      for (let i = initnum; i < populationSize; i++) {
        parents.push(newPopulation[wheelOut(roulette)]);
      }
      newPopulation = parents;

      return newPopulation;
    }

    function mutation(population, populationSize, mutationProbability) {
      let newPopulation = population.clone();
      for (let i = 0; i < populationSize; i++) {
        if (Math.random() < mutationProbability) {
          if (Math.random() > 0.5) {
            newPopulation[i] = doMutate(population[i]);
          } else {
            newPopulation[i] = pushMutate(population[i]);
          }
          i--;
        }
      }
      return newPopulation;
    }

    function crossover(population, dis, populationSize, crossoverProbability) {
      let queue = new Array();
      for (let i = 0; i < populationSize; i++) {
        if (Math.random() < crossoverProbability) {
          queue.push(i);
        }
      }
      queue.shuffle();
      for (let i = 0, j = queue.length - 1; i < j; i += 2) {
        population = doCrossover(queue[i], queue[i + 1], population, dis);
      }

      return population;
    }

    // Helper functions
    function createRoulette(values = []) {
      const fitnessValues = values.map(item => 1.0 / item);
      const sum = fitnessValues.reduce((tempSum, el) => (tempSum += el));

      let tempSum;
      return fitnessValues
        .map(item => item / sum)
        .map(item => (tempSum = (tempSum || 0) + item));
    }

    function doCrossover(x, y, population, dis) {
      let newPopulation = population.clone();

      let child1 = getChild("next", x, y, newPopulation, dis);
      let child2 = getChild("previous", x, y, newPopulation, dis);
      newPopulation[x] = child1;
      newPopulation[y] = child2;

      return newPopulation;
    }

    function getChild(fun, x, y, population, dis) {
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

    function wheelOut(roulette = []) {
      const rand = Math.random();
      roulette.forEach((item, i) => {
        if (rand <= item) {
          return i;
        }
      });
      return 0;
    }

    /* src/pathCalculate/PathCalculate.svelte generated by Svelte v3.12.1 */

    const file$3 = "src/pathCalculate/PathCalculate.svelte";

    function create_fragment$3(ctx) {
    	var div3, div2, div1, label0, span0, t1, input0, input0_updating = false, t2, label1, span1, t4, input1, input1_updating = false, t5, label2, span2, t7, input2, input2_updating = false, t8, label3, span3, t10, input3, input3_updating = false, t11, div0, button0, t13, button1, t15, current, dispose;

    	function input0_input_handler() {
    		input0_updating = true;
    		ctx.input0_input_handler.call(input0);
    	}

    	function input1_input_handler() {
    		input1_updating = true;
    		ctx.input1_input_handler.call(input1);
    	}

    	function input2_input_handler() {
    		input2_updating = true;
    		ctx.input2_input_handler.call(input2);
    	}

    	function input3_input_handler() {
    		input3_updating = true;
    		ctx.input3_input_handler.call(input3);
    	}

    	var resultgrid = new ResultGrid({
    		props: {
    		running: ctx.running,
    		graph: ctx.graph,
    		currentGeneration: ctx.currentGeneration,
    		mutationsCount: ctx.mutationsCount,
    		bestValue: ctx.bestValue,
    		currentBest: ctx.currentBest,
    		population: ctx.population,
    		best: ctx.best,
    		bestValuesArray: ctx.bestValuesArray
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			label0 = element("label");
    			span0 = element("span");
    			span0.textContent = "Population size:";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			label1 = element("label");
    			span1 = element("span");
    			span1.textContent = "Crossover probability:";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			label2 = element("label");
    			span2 = element("span");
    			span2.textContent = "Mutation probability:";
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			label3 = element("label");
    			span3 = element("span");
    			span3.textContent = "Interval duration:";
    			t10 = space();
    			input3 = element("input");
    			t11 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Start";
    			t13 = space();
    			button1 = element("button");
    			button1.textContent = "Stop";
    			t15 = space();
    			resultgrid.$$.fragment.c();
    			attr_dev(span0, "class", "svelte-gdz7qb");
    			add_location(span0, file$3, 180, 8, 4352);
    			attr_dev(input0, "class", "text-input svelte-gdz7qb");
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "step", "1");
    			attr_dev(input0, "min", "1");
    			attr_dev(input0, "max", "50");
    			add_location(input0, file$3, 181, 8, 4390);
    			attr_dev(label0, "class", "svelte-gdz7qb");
    			add_location(label0, file$3, 179, 6, 4336);
    			attr_dev(span1, "class", "svelte-gdz7qb");
    			add_location(span1, file$3, 190, 8, 4584);
    			attr_dev(input1, "class", "text-input svelte-gdz7qb");
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "step", "0.1");
    			attr_dev(input1, "min", "0.01");
    			attr_dev(input1, "max", "1");
    			add_location(input1, file$3, 191, 8, 4628);
    			attr_dev(label1, "class", "svelte-gdz7qb");
    			add_location(label1, file$3, 189, 6, 4568);
    			attr_dev(span2, "class", "svelte-gdz7qb");
    			add_location(span2, file$3, 200, 8, 4832);
    			attr_dev(input2, "class", "text-input svelte-gdz7qb");
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "step", "0.01");
    			attr_dev(input2, "min", "0.01");
    			attr_dev(input2, "max", "1");
    			add_location(input2, file$3, 201, 8, 4875);
    			attr_dev(label2, "class", "svelte-gdz7qb");
    			add_location(label2, file$3, 199, 6, 4816);
    			attr_dev(span3, "class", "svelte-gdz7qb");
    			add_location(span3, file$3, 210, 8, 5079);
    			attr_dev(input3, "class", "text-input svelte-gdz7qb");
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "step", "20");
    			attr_dev(input3, "min", "10");
    			attr_dev(input3, "max", "3000");
    			add_location(input3, file$3, 211, 8, 5119);
    			attr_dev(label3, "class", "svelte-gdz7qb");
    			add_location(label3, file$3, 209, 6, 5063);
    			attr_dev(button0, "class", "startButton protrude svelte-gdz7qb");
    			add_location(button0, file$3, 221, 8, 5334);
    			attr_dev(button1, "class", "startButton protrude svelte-gdz7qb");
    			add_location(button1, file$3, 222, 8, 5413);
    			attr_dev(div0, "class", "buttons svelte-gdz7qb");
    			add_location(div0, file$3, 220, 6, 5304);
    			attr_dev(div1, "class", "constants svelte-gdz7qb");
    			add_location(div1, file$3, 178, 4, 4306);
    			attr_dev(div2, "class", "result-wrapper svelte-gdz7qb");
    			add_location(div2, file$3, 177, 2, 4273);
    			attr_dev(div3, "class", "calculate-block svelte-gdz7qb");
    			add_location(div3, file$3, 175, 0, 4240);

    			dispose = [
    				listen_dev(input0, "input", input0_input_handler),
    				listen_dev(input1, "input", input1_input_handler),
    				listen_dev(input2, "input", input2_input_handler),
    				listen_dev(input3, "input", input3_input_handler),
    				listen_dev(button0, "click", ctx.onStart),
    				listen_dev(button1, "click", ctx.onStop)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, label0);
    			append_dev(label0, span0);
    			append_dev(label0, t1);
    			append_dev(label0, input0);

    			set_input_value(input0, ctx.populationSize);

    			append_dev(div1, t2);
    			append_dev(div1, label1);
    			append_dev(label1, span1);
    			append_dev(label1, t4);
    			append_dev(label1, input1);

    			set_input_value(input1, ctx.crossoverProbability);

    			append_dev(div1, t5);
    			append_dev(div1, label2);
    			append_dev(label2, span2);
    			append_dev(label2, t7);
    			append_dev(label2, input2);

    			set_input_value(input2, ctx.mutationProbability);

    			append_dev(div1, t8);
    			append_dev(div1, label3);
    			append_dev(label3, span3);
    			append_dev(label3, t10);
    			append_dev(label3, input3);

    			set_input_value(input3, ctx.intervalDuration);

    			append_dev(div1, t11);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t13);
    			append_dev(div0, button1);
    			append_dev(div2, t15);
    			mount_component(resultgrid, div2, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!input0_updating && changed.populationSize) set_input_value(input0, ctx.populationSize);
    			input0_updating = false;
    			if (!input1_updating && changed.crossoverProbability) set_input_value(input1, ctx.crossoverProbability);
    			input1_updating = false;
    			if (!input2_updating && changed.mutationProbability) set_input_value(input2, ctx.mutationProbability);
    			input2_updating = false;
    			if (!input3_updating && changed.intervalDuration) set_input_value(input3, ctx.intervalDuration);
    			input3_updating = false;

    			var resultgrid_changes = {};
    			if (changed.running) resultgrid_changes.running = ctx.running;
    			if (changed.graph) resultgrid_changes.graph = ctx.graph;
    			if (changed.currentGeneration) resultgrid_changes.currentGeneration = ctx.currentGeneration;
    			if (changed.mutationsCount) resultgrid_changes.mutationsCount = ctx.mutationsCount;
    			if (changed.bestValue) resultgrid_changes.bestValue = ctx.bestValue;
    			if (changed.currentBest) resultgrid_changes.currentBest = ctx.currentBest;
    			if (changed.population) resultgrid_changes.population = ctx.population;
    			if (changed.best) resultgrid_changes.best = ctx.best;
    			if (changed.bestValuesArray) resultgrid_changes.bestValuesArray = ctx.bestValuesArray;
    			resultgrid.$set(resultgrid_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(resultgrid.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(resultgrid.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div3);
    			}

    			destroy_component(resultgrid);

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	
      const dispatch = createEventDispatcher();

      // constants
      let populationSize = 20;
      let crossoverProbability = 0.9;
      let mutationProbability = 0.1;
      let intervalDuration = 40;

      let { graph, stationsBetween, dis } = $$props;

      let running = false;
      let mainInterval;

      let currentGeneration = 0;
      let bestValue = 0;
      let bestValuesArray = [];
      let best = [];
      let currentBest = {
        bestPosition: 0,
        bestValue: []
      };
      let population = [];
      let values = [];
      let mutationsCount;

      const unsubscribe = count.subscribe(value => {
        $$invalidate('mutationsCount', mutationsCount = value);
      });

      function onStart() {
        if (!running) {
          GAStart();
          $$invalidate('running', running = true);
        }
      }

      function onStop() {
        if (running) {
          GAStop();
          $$invalidate('running', running = false);
        }
      }

      function GAStop() {
        clearInterval(mainInterval);
        dispatch("getResult", {
          result: best
        });
      }

      function GAStart() {
        initData();
        GAInitialize();
        mainInterval = setInterval(render, intervalDuration);
      }

      function initData() {
        $$invalidate('currentGeneration', currentGeneration = 0);
        $$invalidate('bestValue', bestValue = undefined);
        $$invalidate('best', best = []);
        $$invalidate('bestValuesArray', bestValuesArray = []);
        $$invalidate('currentBest', currentBest = 0);
        $$invalidate('population', population = []);
        values = new Array(populationSize);
      }

      function render() {
        GANextGeneration();
      }

      function GAInitialize() {
        const stationsCount = graph.nodes().length;
        $$invalidate('population', population = Array.apply(null, Array(populationSize)).map(item =>
          randomIndivial(stationsCount)
        ));
        setBestValue();
      }

      function GANextGeneration() {
        $$invalidate('currentGeneration', currentGeneration++, currentGeneration);
        $$invalidate('population', population = selection(population, currentBest, best, values, populationSize));
        $$invalidate('population', population = crossover(population, dis, populationSize, crossoverProbability));
        $$invalidate('population', population = mutation(population, populationSize, mutationProbability));
        setBestValue();
      }

      function setBestValue() {
        values = population.map(item => evaluate(item, dis));
        $$invalidate('currentBest', currentBest = getCurrentBest(values));

        if (bestValue === undefined || bestValue > currentBest.bestValue) {
          $$invalidate('best', best = population[currentBest.bestPosition].clone());
          $$invalidate('bestValue', bestValue = currentBest.bestValue);
          $$invalidate('bestValuesArray', bestValuesArray = [...bestValuesArray, bestValue]);
        }
      }

    	const writable_props = ['graph', 'stationsBetween', 'dis'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<PathCalculate> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		populationSize = to_number(this.value);
    		$$invalidate('populationSize', populationSize);
    	}

    	function input1_input_handler() {
    		crossoverProbability = to_number(this.value);
    		$$invalidate('crossoverProbability', crossoverProbability);
    	}

    	function input2_input_handler() {
    		mutationProbability = to_number(this.value);
    		$$invalidate('mutationProbability', mutationProbability);
    	}

    	function input3_input_handler() {
    		intervalDuration = to_number(this.value);
    		$$invalidate('intervalDuration', intervalDuration);
    	}

    	$$self.$set = $$props => {
    		if ('graph' in $$props) $$invalidate('graph', graph = $$props.graph);
    		if ('stationsBetween' in $$props) $$invalidate('stationsBetween', stationsBetween = $$props.stationsBetween);
    		if ('dis' in $$props) $$invalidate('dis', dis = $$props.dis);
    	};

    	$$self.$capture_state = () => {
    		return { populationSize, crossoverProbability, mutationProbability, intervalDuration, graph, stationsBetween, dis, running, mainInterval, currentGeneration, bestValue, bestValuesArray, best, currentBest, population, values, mutationsCount };
    	};

    	$$self.$inject_state = $$props => {
    		if ('populationSize' in $$props) $$invalidate('populationSize', populationSize = $$props.populationSize);
    		if ('crossoverProbability' in $$props) $$invalidate('crossoverProbability', crossoverProbability = $$props.crossoverProbability);
    		if ('mutationProbability' in $$props) $$invalidate('mutationProbability', mutationProbability = $$props.mutationProbability);
    		if ('intervalDuration' in $$props) $$invalidate('intervalDuration', intervalDuration = $$props.intervalDuration);
    		if ('graph' in $$props) $$invalidate('graph', graph = $$props.graph);
    		if ('stationsBetween' in $$props) $$invalidate('stationsBetween', stationsBetween = $$props.stationsBetween);
    		if ('dis' in $$props) $$invalidate('dis', dis = $$props.dis);
    		if ('running' in $$props) $$invalidate('running', running = $$props.running);
    		if ('mainInterval' in $$props) mainInterval = $$props.mainInterval;
    		if ('currentGeneration' in $$props) $$invalidate('currentGeneration', currentGeneration = $$props.currentGeneration);
    		if ('bestValue' in $$props) $$invalidate('bestValue', bestValue = $$props.bestValue);
    		if ('bestValuesArray' in $$props) $$invalidate('bestValuesArray', bestValuesArray = $$props.bestValuesArray);
    		if ('best' in $$props) $$invalidate('best', best = $$props.best);
    		if ('currentBest' in $$props) $$invalidate('currentBest', currentBest = $$props.currentBest);
    		if ('population' in $$props) $$invalidate('population', population = $$props.population);
    		if ('values' in $$props) values = $$props.values;
    		if ('mutationsCount' in $$props) $$invalidate('mutationsCount', mutationsCount = $$props.mutationsCount);
    	};

    	return {
    		populationSize,
    		crossoverProbability,
    		mutationProbability,
    		intervalDuration,
    		graph,
    		stationsBetween,
    		dis,
    		running,
    		currentGeneration,
    		bestValue,
    		bestValuesArray,
    		best,
    		currentBest,
    		population,
    		mutationsCount,
    		onStart,
    		onStop,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler
    	};
    }

    class PathCalculate extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["graph", "stationsBetween", "dis"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "PathCalculate", options, id: create_fragment$3.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.graph === undefined && !('graph' in props)) {
    			console.warn("<PathCalculate> was created without expected prop 'graph'");
    		}
    		if (ctx.stationsBetween === undefined && !('stationsBetween' in props)) {
    			console.warn("<PathCalculate> was created without expected prop 'stationsBetween'");
    		}
    		if (ctx.dis === undefined && !('dis' in props)) {
    			console.warn("<PathCalculate> was created without expected prop 'dis'");
    		}
    	}

    	get graph() {
    		throw new Error("<PathCalculate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set graph(value) {
    		throw new Error("<PathCalculate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stationsBetween() {
    		throw new Error("<PathCalculate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stationsBetween(value) {
    		throw new Error("<PathCalculate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dis() {
    		throw new Error("<PathCalculate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dis(value) {
    		throw new Error("<PathCalculate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/SchemeSVG.svelte generated by Svelte v3.12.1 */

    function create_fragment$4(ctx) {
    	const block = {
    		c: noop,

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    class SchemeSVG extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$4, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "SchemeSVG", options, id: create_fragment$4.name });
    	}
    }

    /* src/SchemeRender.svelte generated by Svelte v3.12.1 */

    const file$4 = "src/SchemeRender.svelte";

    function get_each_context$1(ctx, list, i) {
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

    // (134:0) {#if resultPath && resultPath.length}
    function create_if_block(ctx) {
    	var div, aside, button, t1, t2, svg, defs, symbol, path0, path1, path2, g0, text0, t3, text1, t4, text2, t5, g1, g2, text3, t6, text4, t7, svg_class_value, t8, current, dispose;

    	let each_value_1 = ctx.stationsPath;

    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	var if_block = (ctx.resultPath.length) && create_if_block_1(ctx);

    	var schemesvg = new SchemeSVG({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			aside = element("aside");
    			button = element("button");
    			button.textContent = "Play";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			symbol = svg_element("symbol");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			g0 = svg_element("g");
    			text0 = svg_element("text");
    			t3 = text("Холодногірсько-заводська лінія\n        ");
    			text1 = svg_element("text");
    			t4 = text("Салтівська лінія\n        ");
    			text2 = svg_element("text");
    			t5 = text("Олексіївська лінія\n        ");
    			g1 = svg_element("g");
    			if (if_block) if_block.c();
    			g2 = svg_element("g");
    			text3 = svg_element("text");
    			t6 = text("Державiнська");
    			text4 = svg_element("text");
    			t7 = text("Одеська");
    			t8 = space();
    			schemesvg.$$.fragment.c();
    			attr_dev(button, "class", "start-button svelte-w4l2x3");
    			add_location(button, file$4, 138, 6, 2829);
    			attr_dev(aside, "class", "svelte-w4l2x3");
    			add_location(aside, file$4, 137, 4, 2815);
    			attr_dev(path0, "fill", "#fff");
    			attr_dev(path0, "d", "M6.6 11.5a4.9 4.9 0 110-9.8A4.8 4.8 0 019.7 3a9.7 9.7 0 004.5\n            2v3.5a9.7 9.7 0 00-3.9 1.6l-.9.6a4.8 4.8 0 01-2.8 1z");
    			add_location(path0, file$4, 161, 10, 3506);
    			attr_dev(path1, "d", "M6.7 3.5a3 3 0 012 .7 11.5 11.5 0 003.7 2V7a11.4 11.4 0 00-3.1\n            1.6l-.9.6a3 3 0 01-1.8.6 3.1 3.1 0 110-6.3m0-3.5A6.6 6.6 0 000\n            6.6a6.6 6.6 0 006.6 6.7 6.5 6.5 0 003.8-1.3l.9-.6a8 8 0\n            014.6-1.4V3.3a8 8 0 01-5-1.8A6.5 6.5 0 006.6 0z");
    			add_location(path1, file$4, 165, 10, 3692);
    			attr_dev(symbol, "id", "w");
    			add_location(symbol, file$4, 160, 8, 3480);
    			add_location(defs, file$4, 159, 6, 3465);
    			attr_dev(path2, "fill", "none");
    			attr_dev(path2, "stroke", ctx.colors.green);
    			attr_dev(path2, "stroke-width", "3");
    			attr_dev(path2, "d", "M747 1310l-18-18-241 241a72 72 0 00-21 51v85h-15v21h56v-21h-16v-85a47\n        47 0 0114-34l46-45 12 12 15-15-12-12z");
    			add_location(path2, file$4, 173, 6, 4022);
    			attr_dev(text0, "fill", ctx.colors.red);
    			attr_dev(text0, "transform", "rotate(-90 1562.5 515.7)");
    			add_location(text0, file$4, 181, 8, 4268);
    			attr_dev(text1, "fill", ctx.colors.blue);
    			attr_dev(text1, "transform", "rotate(-90 700.6 -347.6)");
    			add_location(text1, file$4, 184, 8, 4395);
    			attr_dev(text2, "fill", ctx.colors.green);
    			attr_dev(text2, "transform", "rotate(-90 415.7 -32.8)");
    			add_location(text2, file$4, 187, 8, 4509);
    			attr_dev(g0, "font-size", "34");
    			add_location(g0, file$4, 180, 6, 4241);
    			attr_dev(g1, "fill", ctx.colors.text);
    			attr_dev(g1, "font-size", "53");
    			add_location(g1, file$4, 191, 6, 4634);
    			attr_dev(text3, "transform", "translate(573 1556)");
    			add_location(text3, file$4, 217, 8, 5440);
    			attr_dev(text4, "transform", "translate(519 1690)");
    			add_location(text4, file$4, 218, 8, 5506);
    			attr_dev(g2, "fill", ctx.colors.textDisable);
    			attr_dev(g2, "font-size", "53");
    			add_location(g2, file$4, 216, 6, 5387);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "class", svg_class_value = "map " + (ctx.isMapActive ? 'map-active' : '') + " svelte-w4l2x3");
    			attr_dev(svg, "font-family", "Tahoma");
    			attr_dev(svg, "viewBox", "0 0 1501 2151");
    			add_location(svg, file$4, 152, 4, 3253);
    			attr_dev(div, "class", "container svelte-w4l2x3");
    			add_location(div, file$4, 135, 2, 2786);
    			dispose = listen_dev(button, "click", ctx.onShow);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, aside);
    			append_dev(aside, button);
    			append_dev(aside, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(aside, null);
    			}

    			append_dev(div, t2);
    			append_dev(div, svg);
    			append_dev(svg, defs);
    			append_dev(defs, symbol);
    			append_dev(symbol, path0);
    			append_dev(symbol, path1);
    			append_dev(svg, path2);
    			append_dev(svg, g0);
    			append_dev(g0, text0);
    			append_dev(text0, t3);
    			append_dev(g0, text1);
    			append_dev(text1, t4);
    			append_dev(g0, text2);
    			append_dev(text2, t5);
    			append_dev(svg, g1);
    			if (if_block) if_block.m(g1, null);
    			append_dev(svg, g2);
    			append_dev(g2, text3);
    			append_dev(text3, t6);
    			append_dev(g2, text4);
    			append_dev(text4, t7);
    			append_dev(div, t8);
    			mount_component(schemesvg, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.stationsPath || changed.showingStation) {
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

    			if (ctx.resultPath.length) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(g1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if ((!current || changed.isMapActive) && svg_class_value !== (svg_class_value = "map " + (ctx.isMapActive ? 'map-active' : '') + " svelte-w4l2x3")) {
    				attr_dev(svg, "class", svg_class_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(schemesvg.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(schemesvg.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			destroy_each(each_blocks, detaching);

    			if (if_block) if_block.d();

    			destroy_component(schemesvg);

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(134:0) {#if resultPath && resultPath.length}", ctx });
    	return block;
    }

    // (142:8) {#if station}
    function create_if_block_3(ctx) {
    	var div, html_tag, raw_value = ctx.station.text + "", t, div_class_value, dispose;

    	function mouseover_handler() {
    		return ctx.mouseover_handler(ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			html_tag = new HtmlTag(raw_value, t);
    			attr_dev(div, "class", div_class_value = "station-row " + (ctx.showingStation === ctx.index ? 'activeStation' : '') + " svelte-w4l2x3");
    			add_location(div, file$4, 142, 10, 2968);

    			dispose = [
    				listen_dev(div, "mouseover", mouseover_handler),
    				listen_dev(div, "mouseout", ctx.disableStationHover)
    			];
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

    			if ((changed.showingStation) && div_class_value !== (div_class_value = "station-row " + (ctx.showingStation === ctx.index ? 'activeStation' : '') + " svelte-w4l2x3")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3.name, type: "if", source: "(142:8) {#if station}", ctx });
    	return block;
    }

    // (141:6) {#each stationsPath as station, index}
    function create_each_block_1(ctx) {
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1.name, type: "each", source: "(141:6) {#each stationsPath as station, index}", ctx });
    	return block;
    }

    // (194:8) {#if resultPath.length}
    function create_if_block_1(ctx) {
    	var each_blocks = [], each_1_lookup = new Map(), each_1_anchor;

    	let each_value = ctx.stationsPath;

    	const get_key = ctx => ctx.station.id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
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
    			const each_value = ctx.stationsPath;
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
    		},

    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) {
    				detach_dev(each_1_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(194:8) {#if resultPath.length}", ctx });
    	return block;
    }

    // (196:12) {#if station}
    function create_if_block_2(ctx) {
    	var g3, g1, g0, raw0_value = ctx.station.path + "", g0_stroke_value, g2, raw1_value = ctx.station.stop + "", g2_fill_value, text_1, raw2_value = ctx.station.text + "", text_1_style_value, g3_class_value;

    	const block = {
    		c: function create() {
    			g3 = svg_element("g");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			g2 = svg_element("g");
    			text_1 = svg_element("text");
    			attr_dev(g0, "stroke", g0_stroke_value = ctx.colors[ctx.station.color]);
    			add_location(g0, file$4, 198, 18, 4961);
    			attr_dev(g1, "fill", "none");
    			attr_dev(g1, "stroke-miterlimit", "10");
    			attr_dev(g1, "stroke-width", "28");
    			add_location(g1, file$4, 197, 16, 4886);
    			attr_dev(g2, "fill", g2_fill_value = ctx.colors[ctx.station.color]);
    			add_location(g2, file$4, 203, 16, 5098);
    			attr_dev(text_1, "style", text_1_style_value = ctx.station.style);
    			add_location(text_1, file$4, 207, 16, 5208);
    			attr_dev(g3, "class", g3_class_value = "station " + (ctx.showingStation === ctx.index ? 'fadein' : '') + " svelte-w4l2x3");
    			add_location(g3, file$4, 196, 14, 4807);
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

    			if ((changed.stationsPath) && g0_stroke_value !== (g0_stroke_value = ctx.colors[ctx.station.color])) {
    				attr_dev(g0, "stroke", g0_stroke_value);
    			}

    			if ((changed.stationsPath) && raw1_value !== (raw1_value = ctx.station.stop + "")) {
    				g2.innerHTML = raw1_value;
    			}

    			if ((changed.stationsPath) && g2_fill_value !== (g2_fill_value = ctx.colors[ctx.station.color])) {
    				attr_dev(g2, "fill", g2_fill_value);
    			}

    			if ((changed.stationsPath) && raw2_value !== (raw2_value = ctx.station.text + "")) {
    				text_1.innerHTML = raw2_value;
    			}

    			if ((changed.stationsPath) && text_1_style_value !== (text_1_style_value = ctx.station.style)) {
    				attr_dev(text_1, "style", text_1_style_value);
    			}

    			if ((changed.showingStation || changed.stationsPath) && g3_class_value !== (g3_class_value = "station " + (ctx.showingStation === ctx.index ? 'fadein' : '') + " svelte-w4l2x3")) {
    				attr_dev(g3, "class", g3_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(g3);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(196:12) {#if station}", ctx });
    	return block;
    }

    // (195:10) {#each stationsPath as station, index (station.id)}
    function create_each_block$1(key_1, ctx) {
    	var first, if_block_anchor;

    	var if_block = (ctx.station) && create_if_block_2(ctx);

    	const block = {
    		key: key_1,

    		first: null,

    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.station) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(first);
    			}

    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$1.name, type: "each", source: "(195:10) {#each stationsPath as station, index (station.id)}", ctx });
    	return block;
    }

    function create_fragment$5(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.resultPath && ctx.resultPath.length) && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.resultPath && ctx.resultPath.length) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
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

    function instance$4($$self, $$props, $$invalidate) {
    	

      let { stationsBetween, path, stations } = $$props;

      let isMapActive = true;
      let showScheme = false;
      let resultPath = [];
      let stationsPath = [];

      let timerId;

      let showingStation = null;

      function showStation(index) {
        $$invalidate('isMapActive', isMapActive = false);
        $$invalidate('showingStation', showingStation = index);
      }

      function onStationHover(index) {
        clearInterval(timerId);
        showStation(index);
      }

      function disableStationHover() {
        $$invalidate('isMapActive', isMapActive = true);
        $$invalidate('showingStation', showingStation = null);
      }

      function onShow() {
        clearInterval(timerId);
        showScheme = true;
        showPath();
      }

      function calculatePath({ path = [], stationsBetween }) {
        let newStationsPath = [];

        if (path && path.length) {
          $$invalidate('resultPath', resultPath = getResultPath({ path, stationsBetween }));

          resultPath.map(item => {
            newStationsPath.push(stations.find(station => station.id == item));
          });
        }

        return newStationsPath;
      }

      function showPath() {
        let index = 0;
        timerId = setInterval(() => {
          if (index < resultPath.length) {
            showStation(index);
            index++;
          } else {
            clearInterval(timerId);
            disableStationHover();
          }
        }, 300);
      }

      const colors = {
        red: "#d22531",
        blue: "#2060ba",
        green: "#41a747",
        text: "#09303b",
        textDisable: "#9c98a6"
      };

    	const writable_props = ['stationsBetween', 'path', 'stations'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SchemeRender> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = ({ index }) => onStationHover(index);

    	$$self.$set = $$props => {
    		if ('stationsBetween' in $$props) $$invalidate('stationsBetween', stationsBetween = $$props.stationsBetween);
    		if ('path' in $$props) $$invalidate('path', path = $$props.path);
    		if ('stations' in $$props) $$invalidate('stations', stations = $$props.stations);
    	};

    	$$self.$capture_state = () => {
    		return { stationsBetween, path, stations, isMapActive, showScheme, resultPath, stationsPath, timerId, showingStation };
    	};

    	$$self.$inject_state = $$props => {
    		if ('stationsBetween' in $$props) $$invalidate('stationsBetween', stationsBetween = $$props.stationsBetween);
    		if ('path' in $$props) $$invalidate('path', path = $$props.path);
    		if ('stations' in $$props) $$invalidate('stations', stations = $$props.stations);
    		if ('isMapActive' in $$props) $$invalidate('isMapActive', isMapActive = $$props.isMapActive);
    		if ('showScheme' in $$props) showScheme = $$props.showScheme;
    		if ('resultPath' in $$props) $$invalidate('resultPath', resultPath = $$props.resultPath);
    		if ('stationsPath' in $$props) $$invalidate('stationsPath', stationsPath = $$props.stationsPath);
    		if ('timerId' in $$props) timerId = $$props.timerId;
    		if ('showingStation' in $$props) $$invalidate('showingStation', showingStation = $$props.showingStation);
    	};

    	$$self.$$.update = ($$dirty = { path: 1, stationsBetween: 1 }) => {
    		if ($$dirty.path || $$dirty.stationsBetween) { $$invalidate('stationsPath', stationsPath = calculatePath({ path, stationsBetween })); }
    	};

    	return {
    		stationsBetween,
    		path,
    		stations,
    		isMapActive,
    		resultPath,
    		stationsPath,
    		showingStation,
    		onStationHover,
    		disableStationHover,
    		onShow,
    		colors,
    		mouseover_handler
    	};
    }

    class SchemeRender extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$5, safe_not_equal, ["stationsBetween", "path", "stations"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "SchemeRender", options, id: create_fragment$5.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.stationsBetween === undefined && !('stationsBetween' in props)) {
    			console.warn("<SchemeRender> was created without expected prop 'stationsBetween'");
    		}
    		if (ctx.path === undefined && !('path' in props)) {
    			console.warn("<SchemeRender> was created without expected prop 'path'");
    		}
    		if (ctx.stations === undefined && !('stations' in props)) {
    			console.warn("<SchemeRender> was created without expected prop 'stations'");
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

    	get stations() {
    		throw new Error("<SchemeRender>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stations(value) {
    		throw new Error("<SchemeRender>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/GraphSwitcher/GraphSwitcher.svelte generated by Svelte v3.12.1 */

    const file$5 = "src/GraphSwitcher/GraphSwitcher.svelte";

    function create_fragment$6(ctx) {
    	var section, label0, input0, t0, t1, label1, input1, t2, dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			label0 = element("label");
    			input0 = element("input");
    			t0 = text("\n    Kharkiv metro");
    			t1 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t2 = text("\n    Other metro");
    			ctx.$$binding_groups[0].push(input0);
    			attr_dev(input0, "type", "radio");
    			input0.__value = 1;
    			input0.value = input0.__value;
    			add_location(input0, file$5, 21, 4, 324);
    			add_location(label0, file$5, 20, 2, 312);
    			ctx.$$binding_groups[0].push(input1);
    			attr_dev(input1, "type", "radio");
    			input1.__value = 2;
    			input1.value = input1.__value;
    			add_location(input1, file$5, 26, 4, 445);
    			add_location(label1, file$5, 25, 2, 433);
    			attr_dev(section, "class", "svelte-1sgfbb2");
    			add_location(section, file$5, 19, 0, 300);

    			dispose = [
    				listen_dev(input0, "change", ctx.input0_change_handler),
    				listen_dev(input0, "change", ctx.onChange),
    				listen_dev(input1, "change", ctx.input1_change_handler),
    				listen_dev(input1, "change", ctx.onChange)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, label0);
    			append_dev(label0, input0);

    			input0.checked = input0.__value === ctx.selectedMetro;

    			append_dev(label0, t0);
    			append_dev(section, t1);
    			append_dev(section, label1);
    			append_dev(label1, input1);

    			input1.checked = input1.__value === ctx.selectedMetro;

    			append_dev(label1, t2);
    		},

    		p: function update(changed, ctx) {
    			if (changed.selectedMetro) input0.checked = input0.__value === ctx.selectedMetro;
    			if (changed.selectedMetro) input1.checked = input1.__value === ctx.selectedMetro;
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(section);
    			}

    			ctx.$$binding_groups[0].splice(ctx.$$binding_groups[0].indexOf(input0), 1);
    			ctx.$$binding_groups[0].splice(ctx.$$binding_groups[0].indexOf(input1), 1);
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$6.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();

      let { selectedMetro } = $$props;

      function onChange() {
        dispatch("onSelectMetro", {
          result: selectedMetro
        });
      }

    	const writable_props = ['selectedMetro'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<GraphSwitcher> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input0_change_handler() {
    		selectedMetro = this.__value;
    		$$invalidate('selectedMetro', selectedMetro);
    	}

    	function input1_change_handler() {
    		selectedMetro = this.__value;
    		$$invalidate('selectedMetro', selectedMetro);
    	}

    	$$self.$set = $$props => {
    		if ('selectedMetro' in $$props) $$invalidate('selectedMetro', selectedMetro = $$props.selectedMetro);
    	};

    	$$self.$capture_state = () => {
    		return { selectedMetro };
    	};

    	$$self.$inject_state = $$props => {
    		if ('selectedMetro' in $$props) $$invalidate('selectedMetro', selectedMetro = $$props.selectedMetro);
    	};

    	return {
    		selectedMetro,
    		onChange,
    		input0_change_handler,
    		input1_change_handler,
    		$$binding_groups
    	};
    }

    class GraphSwitcher extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$6, safe_not_equal, ["selectedMetro"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "GraphSwitcher", options, id: create_fragment$6.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.selectedMetro === undefined && !('selectedMetro' in props)) {
    			console.warn("<GraphSwitcher> was created without expected prop 'selectedMetro'");
    		}
    	}

    	get selectedMetro() {
    		throw new Error("<GraphSwitcher>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedMetro(value) {
    		throw new Error("<GraphSwitcher>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

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

      let stationsBetween = [];

      graph.nodes().map((i, index) => {
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

      const distances = countDistances(graph);

      return { graph, stationsBetween, distances };
    }

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

    /* src/App.svelte generated by Svelte v3.12.1 */

    const file$6 = "src/App.svelte";

    // (134:2) {#if graph && stationsBetween && dis}
    function create_if_block$1(ctx) {
    	var current;

    	var pathcalculate = new PathCalculate({
    		props: {
    		graph: ctx.graph,
    		stationsBetween: ctx.stationsBetween,
    		dis: ctx.dis
    	},
    		$$inline: true
    	});
    	pathcalculate.$on("getResult", ctx.getResult);

    	const block = {
    		c: function create() {
    			pathcalculate.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(pathcalculate, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var pathcalculate_changes = {};
    			if (changed.graph) pathcalculate_changes.graph = ctx.graph;
    			if (changed.stationsBetween) pathcalculate_changes.stationsBetween = ctx.stationsBetween;
    			if (changed.dis) pathcalculate_changes.dis = ctx.dis;
    			pathcalculate.$set(pathcalculate_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(pathcalculate.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(pathcalculate.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(pathcalculate, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(134:2) {#if graph && stationsBetween && dis}", ctx });
    	return block;
    }

    function create_fragment$7(ctx) {
    	var header, h1, t1, p, t3, main, t4, t5, current;

    	var graphswitcher = new GraphSwitcher({
    		props: { selectedMetro: ctx.selectedMetro },
    		$$inline: true
    	});
    	graphswitcher.$on("onSelectMetro", ctx.onSelectMetro);

    	var if_block = (ctx.graph && ctx.stationsBetween && ctx.dis) && create_if_block$1(ctx);

    	var schemerender = new SchemeRender({
    		props: {
    		path: ctx.bestPath,
    		stationsBetween: ctx.stationsBetween,
    		stations: ctx.stations
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Transit challenge solver";
    			t1 = space();
    			p = element("p");
    			p.textContent = "For Kharkiv metropoliten";
    			t3 = space();
    			main = element("main");
    			graphswitcher.$$.fragment.c();
    			t4 = space();
    			if (if_block) if_block.c();
    			t5 = space();
    			schemerender.$$.fragment.c();
    			add_location(h1, file$6, 126, 2, 6573);
    			add_location(p, file$6, 127, 2, 6609);
    			add_location(header, file$6, 125, 0, 6562);
    			add_location(main, file$6, 130, 0, 6652);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(header, t1);
    			append_dev(header, p);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(graphswitcher, main, null);
    			append_dev(main, t4);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t5);
    			mount_component(schemerender, main, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var graphswitcher_changes = {};
    			if (changed.selectedMetro) graphswitcher_changes.selectedMetro = ctx.selectedMetro;
    			graphswitcher.$set(graphswitcher_changes);

    			if (ctx.graph && ctx.stationsBetween && ctx.dis) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, t5);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}

    			var schemerender_changes = {};
    			if (changed.bestPath) schemerender_changes.path = ctx.bestPath;
    			if (changed.stationsBetween) schemerender_changes.stationsBetween = ctx.stationsBetween;
    			if (changed.stations) schemerender_changes.stations = ctx.stations;
    			schemerender.$set(schemerender_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(graphswitcher.$$.fragment, local);

    			transition_in(if_block);

    			transition_in(schemerender.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(graphswitcher.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(schemerender.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(header);
    				detach_dev(t3);
    				detach_dev(main);
    			}

    			destroy_component(graphswitcher);

    			if (if_block) if_block.d();

    			destroy_component(schemerender);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$7.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	

      let selectedMetro;

      let bestPath;
      let graph;
      let stationsBetween;
      let dis;

      let stations;

      function onSelectMetro(e) {
        $$invalidate('selectedMetro', selectedMetro = e.detail.result);
        getGraph();
        getStations();
      }

      function getResult(e) {
        $$invalidate('bestPath', bestPath = e.detail.result);
      }

      async function getGraph() {
        const res = await fetch(`https://metro.kh.ua/metroapi.php?value=path`);
        const data = await res.json();
        const graphData = createGraph(data);
        $$invalidate('graph', graph = graphData.graph);
        $$invalidate('stationsBetween', stationsBetween = graphData.stationsBetween);
        $$invalidate('dis', dis = graphData.distances);
      }

      async function getStations() {
        const res = await fetch(`https://metro.kh.ua/metroapi.php?value=stations`);
        const data = await res.json();
        $$invalidate('stations', stations = data);
      }
    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('selectedMetro' in $$props) $$invalidate('selectedMetro', selectedMetro = $$props.selectedMetro);
    		if ('bestPath' in $$props) $$invalidate('bestPath', bestPath = $$props.bestPath);
    		if ('graph' in $$props) $$invalidate('graph', graph = $$props.graph);
    		if ('stationsBetween' in $$props) $$invalidate('stationsBetween', stationsBetween = $$props.stationsBetween);
    		if ('dis' in $$props) $$invalidate('dis', dis = $$props.dis);
    		if ('stations' in $$props) $$invalidate('stations', stations = $$props.stations);
    	};

    	return {
    		selectedMetro,
    		bestPath,
    		graph,
    		stationsBetween,
    		dis,
    		stations,
    		onSelectMetro,
    		getResult
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$7, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$7.name });
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

    initArrayPrototypes();

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
