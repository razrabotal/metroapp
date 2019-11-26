
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
    function null_to_empty(value) {
        return value == null ? '' : value;
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

    /* src\stopWatch\StopWatchSVG.svelte generated by Svelte v3.12.1 */

    const file = "src\\stopWatch\\StopWatchSVG.svelte";

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
    			add_location(circle0, file, 30, 8, 794);
    			attr_dev(use, "href", "#dial");
    			attr_dev(use, "transform", "scale(-1 1)");
    			add_location(use, file, 31, 8, 932);
    			attr_dev(path0, "d", "M -2.25 0 h 4.5 l -2.25 2.5 l -2.25 -2.5");
    			attr_dev(path0, "fill", "currentColor");
    			attr_dev(path0, "stroke", "currentColor");
    			attr_dev(path0, "stroke-width", "1");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "stroke-linecap", "round");
    			add_location(path0, file, 35, 16, 1112);
    			attr_dev(g0, "transform", "translate(0 -50)");
    			add_location(g0, file, 34, 12, 1062);
    			attr_dev(g1, "transform", g1_transform_value = "rotate(" + ctx.rotation + ")");
    			add_location(g1, file, 33, 8, 992);
    			attr_dev(path1, "d", "M 0 -1 v -7.5");
    			attr_dev(path1, "fill", "none");
    			attr_dev(path1, "stroke", "currentColor");
    			attr_dev(path1, "stroke-width", "0.4");
    			attr_dev(path1, "stroke-linejoin", "round");
    			attr_dev(path1, "stroke-linecap", "round");
    			add_location(path1, file, 41, 16, 1452);
    			attr_dev(g2, "transform", g2_transform_value = "rotate(" + (ctx.rotation * 60) % 360 + ")");
    			add_location(g2, file, 40, 12, 1365);
    			attr_dev(circle1, "r", "9");
    			attr_dev(circle1, "fill", "none");
    			attr_dev(circle1, "stroke", "currentColor");
    			attr_dev(circle1, "stroke-width", "0.4");
    			add_location(circle1, file, 43, 12, 1615);
    			attr_dev(circle2, "r", "1");
    			attr_dev(circle2, "fill", "none");
    			attr_dev(circle2, "stroke", "currentColor");
    			attr_dev(circle2, "stroke-width", "0.4");
    			add_location(circle2, file, 44, 12, 1705);
    			attr_dev(g3, "transform", "translate(0 20)");
    			add_location(g3, file, 39, 8, 1320);
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "fill", "currentColor");
    			attr_dev(text_1, "dominant-baseline", "middle");
    			attr_dev(text_1, "font-size", "14");
    			set_style(text_1, "font-weight", "300");
    			set_style(text_1, "letter-spacing", "1px");
    			add_location(text_1, file, 47, 8, 1807);
    			attr_dev(g4, "transform", "translate(50 50)");
    			add_location(g4, file, 29, 4, 752);
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "width", "200");
    			attr_dev(svg, "height", "200");
    			attr_dev(svg, "class", "svelte-11zd0v3");
    			add_location(svg, file, 28, 0, 694);
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

    /* src\stopWatch\StopWatch.svelte generated by Svelte v3.12.1 */

    const file$1 = "src\\stopWatch\\StopWatch.svelte";

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
    			add_location(div, file$1, 46, 0, 721);
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

    /* src\pathCalculate\ResultGrid.svelte generated by Svelte v3.12.1 */

    const file$2 = "src\\pathCalculate\\ResultGrid.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	return child_ctx;
    }

    // (93:8) {#each population as item}
    function create_each_block(ctx) {
    	var p, t_value = ctx.item.toString() + "", t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-159f179");
    			add_location(p, file$2, 93, 10, 2116);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(93:8) {#each population as item}", ctx });
    	return block;
    }

    function create_fragment$2(ctx) {
    	var div27, div16, div0, t0, div3, div1, t2, div2, t3_value = ctx.graph.nodes().length + "", t3, t4, div6, div4, t6, div5, t7, t8, div9, div7, t10, div8, t11, t12, div12, div10, t14, div11, t15, t16, div15, div13, t18, div14, t19_value = ctx.currentBest.bestValue + "", t19, t20, div26, div19, div17, t22, div18, p0, t23_value = ctx.best.toString() + "", t23, t24, div22, div20, t26, div21, p1, t27, t28, div25, div23, t30, div24, current;

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
    			div27 = element("div");
    			div16 = element("div");
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
    			div15 = element("div");
    			div13 = element("div");
    			div13.textContent = "Best in population:";
    			t18 = space();
    			div14 = element("div");
    			t19 = text(t19_value);
    			t20 = space();
    			div26 = element("div");
    			div19 = element("div");
    			div17 = element("div");
    			div17.textContent = "Best path:";
    			t22 = space();
    			div18 = element("div");
    			p0 = element("p");
    			t23 = text(t23_value);
    			t24 = space();
    			div22 = element("div");
    			div20 = element("div");
    			div20.textContent = "Best path in current population:";
    			t26 = space();
    			div21 = element("div");
    			p1 = element("p");
    			t27 = text(ctx.bestPopulation);
    			t28 = space();
    			div25 = element("div");
    			div23 = element("div");
    			div23.textContent = "Population:";
    			t30 = space();
    			div24 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "stopWatch svelte-159f179");
    			add_location(div0, file$2, 49, 4, 898);
    			attr_dev(div1, "class", "label");
    			add_location(div1, file$2, 53, 6, 995);
    			attr_dev(div2, "class", "value svelte-159f179");
    			add_location(div2, file$2, 54, 6, 1037);
    			attr_dev(div3, "class", "row svelte-159f179");
    			add_location(div3, file$2, 52, 4, 970);
    			attr_dev(div4, "class", "label");
    			add_location(div4, file$2, 57, 6, 1127);
    			attr_dev(div5, "class", "value svelte-159f179");
    			add_location(div5, file$2, 58, 6, 1171);
    			attr_dev(div6, "class", "row svelte-159f179");
    			add_location(div6, file$2, 56, 4, 1102);
    			attr_dev(div7, "class", "label");
    			add_location(div7, file$2, 61, 6, 1258);
    			attr_dev(div8, "class", "value svelte-159f179");
    			add_location(div8, file$2, 62, 6, 1301);
    			attr_dev(div9, "class", "row svelte-159f179");
    			add_location(div9, file$2, 60, 4, 1233);
    			attr_dev(div10, "class", "label");
    			add_location(div10, file$2, 65, 6, 1385);
    			attr_dev(div11, "class", "value svelte-159f179");
    			add_location(div11, file$2, 66, 6, 1429);
    			attr_dev(div12, "class", "row svelte-159f179");
    			add_location(div12, file$2, 64, 4, 1360);
    			attr_dev(div13, "class", "label");
    			add_location(div13, file$2, 69, 6, 1508);
    			attr_dev(div14, "class", "value svelte-159f179");
    			add_location(div14, file$2, 70, 6, 1560);
    			attr_dev(div15, "class", "row svelte-159f179");
    			add_location(div15, file$2, 68, 4, 1483);
    			attr_dev(div16, "class", "table svelte-159f179");
    			add_location(div16, file$2, 48, 2, 873);
    			attr_dev(div17, "class", "label-row svelte-159f179");
    			add_location(div17, file$2, 76, 6, 1674);
    			attr_dev(p0, "class", "svelte-159f179");
    			add_location(p0, file$2, 78, 8, 1754);
    			attr_dev(div18, "class", "value-row svelte-159f179");
    			add_location(div18, file$2, 77, 6, 1721);
    			add_location(div19, file$2, 75, 4, 1661);
    			attr_dev(div20, "class", "label-row svelte-159f179");
    			add_location(div20, file$2, 83, 6, 1825);
    			attr_dev(p1, "class", "svelte-159f179");
    			add_location(p1, file$2, 85, 8, 1927);
    			attr_dev(div21, "class", "value-row svelte-159f179");
    			add_location(div21, file$2, 84, 6, 1894);
    			add_location(div22, file$2, 82, 4, 1812);
    			attr_dev(div23, "class", "label-row svelte-159f179");
    			add_location(div23, file$2, 90, 6, 1997);
    			attr_dev(div24, "class", "value-row svelte-159f179");
    			add_location(div24, file$2, 91, 6, 2045);
    			add_location(div25, file$2, 89, 4, 1984);
    			attr_dev(div26, "class", "paths svelte-159f179");
    			add_location(div26, file$2, 74, 2, 1636);
    			attr_dev(div27, "class", "info svelte-159f179");
    			add_location(div27, file$2, 47, 0, 851);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div27, anchor);
    			append_dev(div27, div16);
    			append_dev(div16, div0);
    			mount_component(stopwatch, div0, null);
    			append_dev(div16, t0);
    			append_dev(div16, div3);
    			append_dev(div3, div1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, t3);
    			append_dev(div16, t4);
    			append_dev(div16, div6);
    			append_dev(div6, div4);
    			append_dev(div6, t6);
    			append_dev(div6, div5);
    			append_dev(div5, t7);
    			append_dev(div16, t8);
    			append_dev(div16, div9);
    			append_dev(div9, div7);
    			append_dev(div9, t10);
    			append_dev(div9, div8);
    			append_dev(div8, t11);
    			append_dev(div16, t12);
    			append_dev(div16, div12);
    			append_dev(div12, div10);
    			append_dev(div12, t14);
    			append_dev(div12, div11);
    			append_dev(div11, t15);
    			append_dev(div16, t16);
    			append_dev(div16, div15);
    			append_dev(div15, div13);
    			append_dev(div15, t18);
    			append_dev(div15, div14);
    			append_dev(div14, t19);
    			append_dev(div27, t20);
    			append_dev(div27, div26);
    			append_dev(div26, div19);
    			append_dev(div19, div17);
    			append_dev(div19, t22);
    			append_dev(div19, div18);
    			append_dev(div18, p0);
    			append_dev(p0, t23);
    			append_dev(div26, t24);
    			append_dev(div26, div22);
    			append_dev(div22, div20);
    			append_dev(div22, t26);
    			append_dev(div22, div21);
    			append_dev(div21, p1);
    			append_dev(p1, t27);
    			append_dev(div26, t28);
    			append_dev(div26, div25);
    			append_dev(div25, div23);
    			append_dev(div25, t30);
    			append_dev(div25, div24);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div24, null);
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

    			if ((!current || changed.currentBest) && t19_value !== (t19_value = ctx.currentBest.bestValue + "")) {
    				set_data_dev(t19, t19_value);
    			}

    			if ((!current || changed.best) && t23_value !== (t23_value = ctx.best.toString() + "")) {
    				set_data_dev(t23, t23_value);
    			}

    			if (!current || changed.bestPopulation) {
    				set_data_dev(t27, ctx.bestPopulation);
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
    						each_blocks[i].m(div24, null);
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
    				detach_dev(div27);
    			}

    			destroy_component(stopwatch);

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { running, graph, currentGeneration, mutationsCount, bestValue, currentBest, population, best } = $$props;

    	const writable_props = ['running', 'graph', 'currentGeneration', 'mutationsCount', 'bestValue', 'currentBest', 'population', 'best'];
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
    	};

    	$$self.$capture_state = () => {
    		return { running, graph, currentGeneration, mutationsCount, bestValue, currentBest, population, best, bestPopulation };
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
    		if ('bestPopulation' in $$props) $$invalidate('bestPopulation', bestPopulation = $$props.bestPopulation);
    	};

    	let bestPopulation;

    	$$self.$$.update = ($$dirty = { population: 1, currentBest: 1 }) => {
    		if ($$dirty.population || $$dirty.currentBest) { $$invalidate('bestPopulation', bestPopulation =
            population[currentBest.bestPosition] &&
            population[currentBest.bestPosition].toString()); }
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
    		bestPopulation
    	};
    }

    class ResultGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["running", "graph", "currentGeneration", "mutationsCount", "bestValue", "currentBest", "population", "best"]);
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

    const POPULATION_SIZE = 30;
    const CROSSOVER_PROBABILITY = 0.9;
    const MUTATION_PROBABILITY = 0.1;  
    const INTERVAL_DURATION = 40;

    // Functions with side effects
    function mutationIteration(array) {
      count.update(n => n + 1);
      return array;
    }
    const reverseMutate = seq => mutationIteration(reverseMutateMath(seq));
    const doMutate = seq => mutationIteration(doMutateMath(seq));
    const pushMutate = seq => mutationIteration(pushMutateMath(seq));

    // Main components
    function selection(population, currentBest, best, values) {
      let newPopulation = population.clone();

      let parents = new Array();
      let initnum = 5;
      parents.push(newPopulation[currentBest.bestPosition]);
      parents.push(doMutate(best.clone()));
      parents.push(pushMutate(best.clone()));
      parents.push(reverseMutate(best.clone()));
      parents.push(best.clone());

      const roulette = createRoulette(values);

      for (let i = initnum; i < POPULATION_SIZE; i++) {
        parents.push(newPopulation[wheelOut(roulette)]);
      }
      newPopulation = parents;

      return newPopulation;
    }

    function mutation(population) {
      let newPopulation = population.clone();
      for (let i = 0; i < POPULATION_SIZE; i++) {
        if (Math.random() < MUTATION_PROBABILITY) {
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

    function crossover(population, dis) {
      let queue = new Array();
      for (let i = 0; i < POPULATION_SIZE; i++) {
        if (Math.random() < CROSSOVER_PROBABILITY) {
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

    /* src\pathCalculate\PathCalculate.svelte generated by Svelte v3.12.1 */

    const file$3 = "src\\pathCalculate\\PathCalculate.svelte";

    function create_fragment$3(ctx) {
    	var div, t, button, current, dispose;

    	var resultgrid = new ResultGrid({
    		props: {
    		running: ctx.running,
    		graph: ctx.graph,
    		currentGeneration: ctx.iterators.currentGeneration,
    		mutationsCount: ctx.mutationsCount,
    		bestValue: ctx.bestValue,
    		currentBest: ctx.currentBest,
    		population: ctx.population,
    		best: ctx.best
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			resultgrid.$$.fragment.c();
    			t = space();
    			button = element("button");
    			button.textContent = "Start/Stop";
    			attr_dev(button, "class", "startButton svelte-1ena58u");
    			add_location(button, file$3, 108, 2, 2844);
    			attr_dev(div, "class", "calculateBlock");
    			add_location(div, file$3, 105, 0, 2663);
    			dispose = listen_dev(button, "click", ctx.onStartOrStop);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(resultgrid, div, null);
    			append_dev(div, t);
    			append_dev(div, button);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var resultgrid_changes = {};
    			if (changed.running) resultgrid_changes.running = ctx.running;
    			if (changed.graph) resultgrid_changes.graph = ctx.graph;
    			if (changed.iterators) resultgrid_changes.currentGeneration = ctx.iterators.currentGeneration;
    			if (changed.mutationsCount) resultgrid_changes.mutationsCount = ctx.mutationsCount;
    			if (changed.bestValue) resultgrid_changes.bestValue = ctx.bestValue;
    			if (changed.currentBest) resultgrid_changes.currentBest = ctx.currentBest;
    			if (changed.population) resultgrid_changes.population = ctx.population;
    			if (changed.best) resultgrid_changes.best = ctx.best;
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
    				detach_dev(div);
    			}

    			destroy_component(resultgrid);

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	
      const dispatch = createEventDispatcher();

      let { graph, stationsBetween, dis } = $$props;

      let running = false;
      let mainInterval;

      let iterators = {};
      let bestValue;
      let best = [];
      let currentBest = {};
      let population = [];
      let values;

      let mutationsCount;

      const unsubscribe = count.subscribe(value => {
        $$invalidate('mutationsCount', mutationsCount = value);
      });

      function onStartOrStop() {
        if (running) {
          clearInterval(mainInterval);
          dispatch("getResult", {
            result: best
          });
          return ($$invalidate('running', running = false));
        }
        initData();
        GAInitialize();
        mainInterval = setInterval(render, INTERVAL_DURATION);
        return ($$invalidate('running', running = true));
      }

      function initData() {
        $$invalidate('iterators', iterators = {
          currentGeneration: 0
        });
        $$invalidate('bestValue', bestValue = undefined);
        $$invalidate('best', best = []);
        $$invalidate('currentBest', currentBest = 0);
        $$invalidate('population', population = []);
        values = new Array(POPULATION_SIZE);
      }

      function render() {
        GANextGeneration();

        text = `<p>
      There are ${graph.nodes().length} stations in the map. 
      The ${iterators.currentGeneration}th generation 
      with ${mutationsCount} times of mutation. 
      Best value: ${~~bestValue} -- ${currentBest.bestValue}. 
      Path: ${best.toString()}</p>`;
      }

      function GAInitialize() {
        const stationsCount = graph.nodes().length;
        $$invalidate('population', population = Array.apply(null, Array(POPULATION_SIZE)).map(item =>
          randomIndivial(stationsCount)
        ));
        setBestValue();
      }
      function GANextGeneration() {
        $$invalidate('iterators', iterators.currentGeneration++, iterators);
        $$invalidate('population', population = selection(population, currentBest, best, values));
        $$invalidate('population', population = crossover(population, dis));
        $$invalidate('population', population = mutation(population));
        setBestValue();
      }

      function setBestValue() {
        values = population.map(item => evaluate(item, dis));
        $$invalidate('currentBest', currentBest = getCurrentBest(values));

        if (bestValue === undefined || bestValue > currentBest.bestValue) {
          $$invalidate('best', best = population[currentBest.bestPosition].clone());
          $$invalidate('bestValue', bestValue = currentBest.bestValue);
        }
      }

    	const writable_props = ['graph', 'stationsBetween', 'dis'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<PathCalculate> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('graph' in $$props) $$invalidate('graph', graph = $$props.graph);
    		if ('stationsBetween' in $$props) $$invalidate('stationsBetween', stationsBetween = $$props.stationsBetween);
    		if ('dis' in $$props) $$invalidate('dis', dis = $$props.dis);
    	};

    	$$self.$capture_state = () => {
    		return { graph, stationsBetween, dis, running, mainInterval, iterators, bestValue, best, currentBest, population, values, mutationsCount, text };
    	};

    	$$self.$inject_state = $$props => {
    		if ('graph' in $$props) $$invalidate('graph', graph = $$props.graph);
    		if ('stationsBetween' in $$props) $$invalidate('stationsBetween', stationsBetween = $$props.stationsBetween);
    		if ('dis' in $$props) $$invalidate('dis', dis = $$props.dis);
    		if ('running' in $$props) $$invalidate('running', running = $$props.running);
    		if ('mainInterval' in $$props) mainInterval = $$props.mainInterval;
    		if ('iterators' in $$props) $$invalidate('iterators', iterators = $$props.iterators);
    		if ('bestValue' in $$props) $$invalidate('bestValue', bestValue = $$props.bestValue);
    		if ('best' in $$props) $$invalidate('best', best = $$props.best);
    		if ('currentBest' in $$props) $$invalidate('currentBest', currentBest = $$props.currentBest);
    		if ('population' in $$props) $$invalidate('population', population = $$props.population);
    		if ('values' in $$props) values = $$props.values;
    		if ('mutationsCount' in $$props) $$invalidate('mutationsCount', mutationsCount = $$props.mutationsCount);
    		if ('text' in $$props) text = $$props.text;
    	};

    	let text;

    	text = "";

    	return {
    		graph,
    		stationsBetween,
    		dis,
    		running,
    		iterators,
    		bestValue,
    		best,
    		currentBest,
    		population,
    		mutationsCount,
    		onStartOrStop
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

    /* src\SchemeRender.svelte generated by Svelte v3.12.1 */

    const file$4 = "src\\SchemeRender.svelte";

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

    // (126:0) {#if resultPath}
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
    			attr_dev(aside, "class", "svelte-1jqfczw");
    			add_location(aside, file$4, 129, 0, 2510);
    			attr_dev(div, "class", "container svelte-1jqfczw");
    			add_location(div, file$4, 127, 0, 2483);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(126:0) {#if resultPath}", ctx });
    	return block;
    }

    // (132:4) {#if station}
    function create_if_block_4(ctx) {
    	var div, html_tag, raw_value = ctx.station.text + "", t, div_class_value, dispose;

    	function mouseover_handler() {
    		return ctx.mouseover_handler(ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			html_tag = new HtmlTag(raw_value, t);
    			attr_dev(div, "class", div_class_value = "" + null_to_empty((ctx.showingStation === ctx.index ? 'activeStation' : '')) + " svelte-1jqfczw");
    			add_location(div, file$4, 132, 6, 2586);
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

    			if ((changed.showingStation) && div_class_value !== (div_class_value = "" + null_to_empty((ctx.showingStation === ctx.index ? 'activeStation' : '')) + " svelte-1jqfczw")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_4.name, type: "if", source: "(132:4) {#if station}", ctx });
    	return block;
    }

    // (131:2) {#each stationsPath as station, index}
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1.name, type: "each", source: "(131:2) {#each stationsPath as station, index}", ctx });
    	return block;
    }

    // (140:0) {#if showScheme}
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
    			add_location(path0, file$4, 149, 8, 3006);
    			attr_dev(path1, "d", "M6.7 3.5a3 3 0 012 .7 11.5 11.5 0 003.7 2V7a11.4 11.4 0 00-3.1\r\n          1.6l-.9.6a3 3 0 01-1.8.6 3.1 3.1 0 110-6.3m0-3.5A6.6 6.6 0 000 6.6a6.6\r\n          6.6 0 006.6 6.7 6.5 6.5 0 003.8-1.3l.9-.6a8 8 0 014.6-1.4V3.3a8 8 0\r\n          01-5-1.8A6.5 6.5 0 006.6 0z");
    			add_location(path1, file$4, 153, 8, 3188);
    			attr_dev(symbol, "id", "w");
    			add_location(symbol, file$4, 148, 6, 2981);
    			add_location(defs, file$4, 147, 4, 2967);
    			attr_dev(path2, "fill", "none");
    			attr_dev(path2, "stroke", ctx.colors.green);
    			attr_dev(path2, "stroke-width", "3");
    			attr_dev(path2, "d", "M747 1310l-18-18-241 241a72 72 0 00-21 51v85h-15v21h56v-21h-16v-85a47\r\n      47 0 0114-34l46-45 12 12 15-15-12-12z");
    			add_location(path2, file$4, 161, 4, 3512);
    			attr_dev(text0, "fill", ctx.colors.red);
    			attr_dev(text0, "transform", "rotate(-90 1562.5 515.7)");
    			add_location(text0, file$4, 169, 6, 3752);
    			attr_dev(text1, "fill", ctx.colors.blue);
    			attr_dev(text1, "transform", "rotate(-90 700.6 -347.6)");
    			add_location(text1, file$4, 172, 6, 3876);
    			attr_dev(text2, "fill", ctx.colors.green);
    			attr_dev(text2, "transform", "rotate(-90 415.7 -32.8)");
    			add_location(text2, file$4, 175, 6, 3987);
    			attr_dev(g0, "font-size", "34");
    			add_location(g0, file$4, 168, 4, 3726);
    			attr_dev(g1, "fill", ctx.colors.text);
    			attr_dev(g1, "font-size", "53");
    			add_location(g1, file$4, 179, 4, 4108);
    			attr_dev(text3, "transform", "translate(573 1556)");
    			add_location(text3, file$4, 207, 6, 4887);
    			attr_dev(text4, "transform", "translate(519 1690)");
    			add_location(text4, file$4, 208, 6, 4952);
    			attr_dev(g2, "fill", ctx.colors.textDisable);
    			attr_dev(g2, "font-size", "53");
    			add_location(g2, file$4, 206, 4, 4835);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "class", "map svelte-1jqfczw");
    			attr_dev(svg, "font-family", "Tahoma");
    			attr_dev(svg, "viewBox", "0 0 1501 2151");
    			add_location(svg, file$4, 140, 2, 2794);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(140:0) {#if showScheme}", ctx });
    	return block;
    }

    // (182:6) {#if resultPath.length}
    function create_if_block_2(ctx) {
    	var each_1_anchor;

    	let each_value = ctx.stationsPath;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
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
    			if (changed.stationsPath || changed.showingStation || changed.colors) {
    				each_value = ctx.stationsPath;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(182:6) {#if resultPath.length}", ctx });
    	return block;
    }

    // (185:10) {#if station}
    function create_if_block_3(ctx) {
    	var g3, g1, g0, raw0_value = ctx.station.path + "", g0_stroke_value, g2, raw1_value = ctx.station.stop + "", g2_fill_value, text_1, raw2_value = ctx.station.text + "", text_1_style_value, g3_class_value;

    	const block = {
    		c: function create() {
    			g3 = svg_element("g");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			g2 = svg_element("g");
    			text_1 = svg_element("text");
    			attr_dev(g0, "stroke", g0_stroke_value = ctx.colors[ctx.station.color]);
    			add_location(g0, file$4, 187, 16, 4419);
    			attr_dev(g1, "fill", "none");
    			attr_dev(g1, "stroke-miterlimit", "10");
    			attr_dev(g1, "stroke-width", "28");
    			add_location(g1, file$4, 186, 14, 4345);
    			attr_dev(g2, "fill", g2_fill_value = ctx.colors[ctx.station.color]);
    			add_location(g2, file$4, 192, 14, 4553);
    			attr_dev(text_1, "style", text_1_style_value = ctx.station.style);
    			add_location(text_1, file$4, 196, 14, 4661);
    			attr_dev(g3, "class", g3_class_value = "station " + (ctx.showingStation === ctx.index ? 'fadein' : '') + " svelte-1jqfczw");
    			add_location(g3, file$4, 185, 12, 4267);
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

    			if ((changed.showingStation) && g3_class_value !== (g3_class_value = "station " + (ctx.showingStation === ctx.index ? 'fadein' : '') + " svelte-1jqfczw")) {
    				attr_dev(g3, "class", g3_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(g3);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3.name, type: "if", source: "(185:10) {#if station}", ctx });
    	return block;
    }

    // (184:8) {#each stationsPath as station, index}
    function create_each_block$1(ctx) {
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$1.name, type: "each", source: "(184:8) {#each stationsPath as station, index}", ctx });
    	return block;
    }

    function create_fragment$4(ctx) {
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
    			add_location(div, file$4, 120, 0, 2388);
    			add_location(button, file$4, 122, 0, 2415);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
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
    	let { stationsBetween, path } = $$props;

      let showScheme = false;
      let resultPath = [];
      let stationsPath = [];
      let stations;

      let timerId;

      onMount(async () => {
        const res = await fetch(`https://metro.kh.ua/metroapi.php?value=stations`);
        const data = await res.json();
        stations = data;
      });

      function showStation(index) {
        $$invalidate('showingStation', showingStation = index);
      }

      function onStationHover(index) {
        clearInterval(timerId);
        showStation(index);
      }

      function onShow(){
        clearInterval(timerId);
        $$invalidate('showScheme', showScheme = true);
        showPath();
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

      function showPath() {
        let index = 0;
        timerId = setInterval(() => { 
          if(index < resultPath.length) {
            showStation(index);
            index++;
          } else {
            clearInterval(timerId);
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

    	const writable_props = ['stationsBetween', 'path'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SchemeRender> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = ({ index }) => onStationHover(index);

    	$$self.$set = $$props => {
    		if ('stationsBetween' in $$props) $$invalidate('stationsBetween', stationsBetween = $$props.stationsBetween);
    		if ('path' in $$props) $$invalidate('path', path = $$props.path);
    	};

    	$$self.$capture_state = () => {
    		return { stationsBetween, path, showScheme, resultPath, stationsPath, stations, timerId, showingStation };
    	};

    	$$self.$inject_state = $$props => {
    		if ('stationsBetween' in $$props) $$invalidate('stationsBetween', stationsBetween = $$props.stationsBetween);
    		if ('path' in $$props) $$invalidate('path', path = $$props.path);
    		if ('showScheme' in $$props) $$invalidate('showScheme', showScheme = $$props.showScheme);
    		if ('resultPath' in $$props) $$invalidate('resultPath', resultPath = $$props.resultPath);
    		if ('stationsPath' in $$props) $$invalidate('stationsPath', stationsPath = $$props.stationsPath);
    		if ('stations' in $$props) stations = $$props.stations;
    		if ('timerId' in $$props) timerId = $$props.timerId;
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
    		onStationHover,
    		onShow,
    		colors,
    		showingStation,
    		mouseover_handler
    	};
    }

    class SchemeRender extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["stationsBetween", "path"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "SchemeRender", options, id: create_fragment$4.name });

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

    /* src\Scheme.svelte generated by Svelte v3.12.1 */

    const file$5 = "src\\Scheme.svelte";

    // (28:2) {#if graph && stationsBetween && dis}
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(28:2) {#if graph && stationsBetween && dis}", ctx });
    	return block;
    }

    function create_fragment$5(ctx) {
    	var div, t, current;

    	var if_block = (ctx.graph && ctx.stationsBetween && ctx.dis) && create_if_block$1(ctx);

    	var schemerender = new SchemeRender({
    		props: {
    		path: ctx.bestPath,
    		stationsBetween: ctx.stationsBetween
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			schemerender.$$.fragment.c();
    			attr_dev(div, "class", "lol");
    			add_location(div, file$5, 26, 0, 665);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);
    			mount_component(schemerender, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.graph && ctx.stationsBetween && ctx.dis) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t);
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
    			schemerender.$set(schemerender_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			transition_in(schemerender.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(schemerender.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			if (if_block) if_block.d();

    			destroy_component(schemerender);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	

      let graph;
      let stationsBetween;
      let dis;
      let bestPath;

      onMount(async () => {
        const res = await fetch(`https://metro.kh.ua/metroapi.php?value=path`);
        const data = await res.json();
        const graphData = createGraph(data);
        $$invalidate('graph', graph = graphData.graph);
        $$invalidate('stationsBetween', stationsBetween = graphData.stationsBetween);
        $$invalidate('dis', dis = graphData.distances);
      });

      function getResult(e) {
        $$invalidate('bestPath', bestPath = e.detail.result);
      }

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('graph' in $$props) $$invalidate('graph', graph = $$props.graph);
    		if ('stationsBetween' in $$props) $$invalidate('stationsBetween', stationsBetween = $$props.stationsBetween);
    		if ('dis' in $$props) $$invalidate('dis', dis = $$props.dis);
    		if ('bestPath' in $$props) $$invalidate('bestPath', bestPath = $$props.bestPath);
    	};

    	return {
    		graph,
    		stationsBetween,
    		dis,
    		bestPath,
    		getResult
    	};
    }

    class Scheme extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Scheme", options, id: create_fragment$5.name });
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

    /* src\App.svelte generated by Svelte v3.12.1 */

    const file$6 = "src\\App.svelte";

    function create_fragment$6(ctx) {
    	var main, current;

    	var scheme = new Scheme({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			scheme.$$.fragment.c();
    			add_location(main, file$6, 56, 0, 3086);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(scheme, main, null);
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
    			if (detaching) {
    				detach_dev(main);
    			}

    			destroy_component(scheme);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$6.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$6($$self) {
    	
      
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$6.name });
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
