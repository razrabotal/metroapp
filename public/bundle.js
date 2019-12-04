
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    let running = false;
    function run_tasks() {
        tasks.forEach(task => {
            if (!task[0](now())) {
                tasks.delete(task);
                task[1]();
            }
        });
        running = tasks.size > 0;
        if (running)
            raf(run_tasks);
    }
    function loop(fn) {
        let task;
        if (!running) {
            running = true;
            raf(run_tasks);
        }
        return {
            promise: new Promise(fulfil => {
                tasks.add(task = [fn, fulfil]);
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function set_attributes(node, attributes) {
        for (const key in attributes) {
            if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key in node) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
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

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
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

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        if (component.$$.props.indexOf(name) === -1)
            return;
        component.$$.bound[name] = callback;
        callback(component.$$.ctx[name]);
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

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    function zeroPadded(number) {
        return number >= 10 ? number.toString() : `0${number}`;
    }

    function last2Digits(number) {
        return number.toString().slice(-2);
    }

    function formatTime(milliseconds) {
        const mm = zeroPadded(Math.floor(milliseconds / 1000 / 60));
        const ss = zeroPadded(Math.floor(milliseconds / 1000) % 60);
        const t = last2Digits(Math.floor(milliseconds / 10));
        return `${mm}:${ss}.${t}`;
    }

    /* src/stopWatch/StopWatchSVG.svelte generated by Svelte v3.12.1 */

    const file = "src/stopWatch/StopWatchSVG.svelte";

    function create_fragment(ctx) {
    	var svg, g4, circle0, g1, g0, path0, g1_transform_value, g3, g2, path1, g2_transform_value, circle1, circle2, text_1, t_value = formatTime(ctx.lapse) + "", t;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g4 = svg_element("g");
    			circle0 = svg_element("circle");
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
    			attr_dev(circle0, "cx", "0");
    			attr_dev(circle0, "cy", "0");
    			attr_dev(circle0, "r", "42");
    			attr_dev(circle0, "fill", "none");
    			attr_dev(circle0, "stroke", "currentColor");
    			attr_dev(circle0, "stroke-width", "6");
    			attr_dev(circle0, "stroke-dasharray", "0.3 1.898");
    			attr_dev(circle0, "transform", "scale(-1 1)");
    			add_location(circle0, file, 36, 4, 869);
    			attr_dev(path0, "d", "M -2.25 0 h 4.5 l -2.25 2.5 l -2.25 -2.5");
    			attr_dev(path0, "fill", "currentColor");
    			attr_dev(path0, "stroke", "currentColor");
    			attr_dev(path0, "stroke-width", "1");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "stroke-linecap", "round");
    			add_location(path0, file, 48, 8, 1159);
    			attr_dev(g0, "transform", "translate(0 -50)");
    			add_location(g0, file, 47, 6, 1118);
    			attr_dev(g1, "transform", g1_transform_value = "rotate(" + ctx.rotation + ")");
    			add_location(g1, file, 46, 4, 1057);
    			attr_dev(path1, "d", "M 0 -1 v -7.5");
    			attr_dev(path1, "stroke-linejoin", "round");
    			attr_dev(path1, "stroke-linecap", "round");
    			add_location(path1, file, 64, 8, 1595);
    			attr_dev(g2, "transform", g2_transform_value = "rotate(" + (ctx.rotation * 60) % 360 + ")");
    			add_location(g2, file, 63, 6, 1519);
    			attr_dev(circle1, "r", "9");
    			add_location(circle1, file, 69, 6, 1716);
    			attr_dev(circle2, "r", "1");
    			add_location(circle2, file, 70, 6, 1739);
    			attr_dev(g3, "transform", "translate(0 20)");
    			attr_dev(g3, "stroke", "currentColor");
    			attr_dev(g3, "stroke-width", "0.4");
    			attr_dev(g3, "fill", "none");
    			add_location(g3, file, 58, 4, 1404);
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "fill", "currentColor");
    			attr_dev(text_1, "dominant-baseline", "middle");
    			attr_dev(text_1, "font-size", "14");
    			set_style(text_1, "font-weight", "300");
    			set_style(text_1, "letter-spacing", "1px");
    			add_location(text_1, file, 73, 4, 1770);
    			attr_dev(g4, "transform", "translate(50 50)");
    			add_location(g4, file, 35, 2, 832);
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "width", "230");
    			attr_dev(svg, "height", "230");
    			attr_dev(svg, "class", "svelte-1fqq2s5");
    			add_location(svg, file, 34, 0, 777);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g4);
    			append_dev(g4, circle0);
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

    const time = readable(0, function start(set) {
      const beginning = new Date();
      const beginningTime = beginning.getTime();

      const interval = setInterval(() => {
        const currentTime = new Date().getTime();
        set((currentTime - beginningTime) * 4);
      }, 10);

      return function stop() {
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
    			add_location(div, file$1, 40, 0, 600);
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
        unsubscribe = time.subscribe(value => {
          $$invalidate('lapse', lapse = value);
        });
      }

      function terminate() {
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
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
    		return { running, lapse, unsubscribe };
    	};

    	$$self.$inject_state = $$props => {
    		if ('running' in $$props) $$invalidate('running', running = $$props.running);
    		if ('lapse' in $$props) $$invalidate('lapse', lapse = $$props.lapse);
    		if ('unsubscribe' in $$props) unsubscribe = $$props.unsubscribe;
    	};

    	$$self.$$.update = ($$dirty = { running: 1 }) => {
    		if ($$dirty.running) { if (running) {
            stop();
            start();
          } else {
            terminate();
          } }
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

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	return child_ctx;
    }

    // (162:8) {#each population as item}
    function create_each_block_1(ctx) {
    	var p, t_value = ctx.item.toString() + "", t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-5txtp8");
    			add_location(p, file$2, 162, 10, 3718);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1.name, type: "each", source: "(162:8) {#each population as item}", ctx });
    	return block;
    }

    // (175:8) {:else}
    function create_else_block(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "No paths in storage";
    			attr_dev(p, "class", "svelte-5txtp8");
    			add_location(p, file$2, 175, 10, 4105);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(175:8) {:else}", ctx });
    	return block;
    }

    // (172:10) {#if item.bestValue && item.bestPath}
    function create_if_block(ctx) {
    	var p, t0_value = ctx.item.bestValue + "", t0, t1, t2_value = ctx.item.bestPath.toString() + "", t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = text(" - ");
    			t2 = text(t2_value);
    			attr_dev(p, "class", "svelte-5txtp8");
    			add_location(p, file$2, 172, 12, 4010);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.bestResultsFromStorage) && t0_value !== (t0_value = ctx.item.bestValue + "")) {
    				set_data_dev(t0, t0_value);
    			}

    			if ((changed.bestResultsFromStorage) && t2_value !== (t2_value = ctx.item.bestPath.toString() + "")) {
    				set_data_dev(t2, t2_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(172:10) {#if item.bestValue && item.bestPath}", ctx });
    	return block;
    }

    // (171:8) {#each bestResultsFromStorage as item}
    function create_each_block(ctx) {
    	var if_block_anchor;

    	var if_block = (ctx.item.bestValue && ctx.item.bestPath) && create_if_block(ctx);

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
    			if (ctx.item.bestValue && ctx.item.bestPath) {
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

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(171:8) {#each bestResultsFromStorage as item}", ctx });
    	return block;
    }

    function create_fragment$2(ctx) {
    	var div37, div17, div0, t0, div16, div3, div1, t2, div2, t3_value = ctx.graph.nodes().length + "", t3, t4, div6, div4, t6, div5, t7, t8, div9, div7, t10, div8, t11, t12, div12, div10, t14, div11, t15, t16, div15, div13, t18, div14, t19, t20, div36, div20, div18, t22, div19, p0, t23, t24, div23, div21, t26, div22, p1, t27_value = ctx.best.toString() + "", t27, t28, div26, div24, t30, div25, p2, t31, t32, div29, div27, t34, div28, p3, t35_value = ctx.currentBest.bestValue + "", t35, t36, div32, div30, t38, div31, t39, div35, div33, t41, div34, current;

    	var stopwatch = new StopWatch({
    		props: { running: ctx.running },
    		$$inline: true
    	});

    	let each_value_1 = ctx.population;

    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = ctx.bestResultsFromStorage;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let each1_else = null;

    	if (!each_value.length) {
    		each1_else = create_else_block(ctx);
    		each1_else.c();
    	}

    	const block = {
    		c: function create() {
    			div37 = element("div");
    			div17 = element("div");
    			div0 = element("div");
    			stopwatch.$$.fragment.c();
    			t0 = space();
    			div16 = element("div");
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
    			div10.textContent = "Crossovers:";
    			t14 = space();
    			div11 = element("div");
    			t15 = text(ctx.crossoversCount);
    			t16 = space();
    			div15 = element("div");
    			div13 = element("div");
    			div13.textContent = "Best result:";
    			t18 = space();
    			div14 = element("div");
    			t19 = text(ctx.bestValue);
    			t20 = space();
    			div36 = element("div");
    			div20 = element("div");
    			div18 = element("div");
    			div18.textContent = "Сhange of the best result";
    			t22 = space();
    			div19 = element("div");
    			p0 = element("p");
    			t23 = text(ctx.bestValuesString);
    			t24 = space();
    			div23 = element("div");
    			div21 = element("div");
    			div21.textContent = "Best path";
    			t26 = space();
    			div22 = element("div");
    			p1 = element("p");
    			t27 = text(t27_value);
    			t28 = space();
    			div26 = element("div");
    			div24 = element("div");
    			div24.textContent = "Best path in current population";
    			t30 = space();
    			div25 = element("div");
    			p2 = element("p");
    			t31 = text(ctx.bestPopulation);
    			t32 = space();
    			div29 = element("div");
    			div27 = element("div");
    			div27.textContent = "Best value in population";
    			t34 = space();
    			div28 = element("div");
    			p3 = element("p");
    			t35 = text(t35_value);
    			t36 = space();
    			div32 = element("div");
    			div30 = element("div");
    			div30.textContent = "Population";
    			t38 = space();
    			div31 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t39 = space();
    			div35 = element("div");
    			div33 = element("div");
    			div33.textContent = "Best results from storage";
    			t41 = space();
    			div34 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "stop-watch svelte-5txtp8");
    			add_location(div0, file$2, 102, 4, 2047);
    			attr_dev(div1, "class", "label");
    			add_location(div1, file$2, 107, 8, 2178);
    			attr_dev(div2, "class", "value svelte-5txtp8");
    			add_location(div2, file$2, 108, 8, 2221);
    			attr_dev(div3, "class", "row svelte-5txtp8");
    			add_location(div3, file$2, 106, 6, 2152);
    			attr_dev(div4, "class", "label");
    			add_location(div4, file$2, 111, 8, 2314);
    			attr_dev(div5, "class", "value svelte-5txtp8");
    			add_location(div5, file$2, 112, 8, 2359);
    			attr_dev(div6, "class", "row svelte-5txtp8");
    			add_location(div6, file$2, 110, 6, 2288);
    			attr_dev(div7, "class", "label");
    			add_location(div7, file$2, 115, 8, 2449);
    			attr_dev(div8, "class", "value svelte-5txtp8");
    			add_location(div8, file$2, 116, 8, 2493);
    			attr_dev(div9, "class", "row svelte-5txtp8");
    			add_location(div9, file$2, 114, 6, 2423);
    			attr_dev(div10, "class", "label");
    			add_location(div10, file$2, 119, 8, 2580);
    			attr_dev(div11, "class", "value svelte-5txtp8");
    			add_location(div11, file$2, 120, 8, 2625);
    			attr_dev(div12, "class", "row svelte-5txtp8");
    			add_location(div12, file$2, 118, 6, 2554);
    			attr_dev(div13, "class", "label");
    			add_location(div13, file$2, 123, 8, 2724);
    			attr_dev(div14, "class", "value svelte-5txtp8");
    			add_location(div14, file$2, 124, 8, 2770);
    			attr_dev(div15, "class", "row row-result svelte-5txtp8");
    			add_location(div15, file$2, 122, 6, 2687);
    			attr_dev(div16, "class", "table__content svelte-5txtp8");
    			add_location(div16, file$2, 105, 4, 2117);
    			attr_dev(div17, "class", "table svelte-5txtp8");
    			add_location(div17, file$2, 101, 2, 2023);
    			attr_dev(div18, "class", "label-row svelte-5txtp8");
    			add_location(div18, file$2, 131, 6, 2898);
    			attr_dev(p0, "class", "svelte-5txtp8");
    			add_location(p0, file$2, 133, 8, 2991);
    			attr_dev(div19, "class", "value-row svelte-5txtp8");
    			add_location(div19, file$2, 132, 6, 2959);
    			attr_dev(div20, "class", "paths-row svelte-5txtp8");
    			add_location(div20, file$2, 130, 4, 2868);
    			attr_dev(div21, "class", "label-row svelte-5txtp8");
    			add_location(div21, file$2, 138, 6, 3078);
    			attr_dev(p1, "class", "svelte-5txtp8");
    			add_location(p1, file$2, 140, 8, 3155);
    			attr_dev(div22, "class", "value-row svelte-5txtp8");
    			add_location(div22, file$2, 139, 6, 3123);
    			attr_dev(div23, "class", "paths-row svelte-5txtp8");
    			add_location(div23, file$2, 137, 4, 3048);
    			attr_dev(div24, "class", "label-row svelte-5txtp8");
    			add_location(div24, file$2, 145, 6, 3239);
    			attr_dev(p2, "class", "svelte-5txtp8");
    			add_location(p2, file$2, 147, 8, 3338);
    			attr_dev(div25, "class", "value-row svelte-5txtp8");
    			add_location(div25, file$2, 146, 6, 3306);
    			attr_dev(div26, "class", "paths-row svelte-5txtp8");
    			add_location(div26, file$2, 144, 4, 3209);
    			attr_dev(div27, "class", "label-row svelte-5txtp8");
    			add_location(div27, file$2, 152, 6, 3421);
    			attr_dev(p3, "class", "svelte-5txtp8");
    			add_location(p3, file$2, 154, 8, 3513);
    			attr_dev(div28, "class", "value-row svelte-5txtp8");
    			add_location(div28, file$2, 153, 6, 3481);
    			attr_dev(div29, "class", "paths-row svelte-5txtp8");
    			add_location(div29, file$2, 151, 4, 3391);
    			attr_dev(div30, "class", "label-row svelte-5txtp8");
    			add_location(div30, file$2, 159, 6, 3603);
    			attr_dev(div31, "class", "value-row svelte-5txtp8");
    			add_location(div31, file$2, 160, 6, 3649);
    			attr_dev(div32, "class", "paths-row svelte-5txtp8");
    			add_location(div32, file$2, 158, 4, 3573);
    			attr_dev(div33, "class", "label-row svelte-5txtp8");
    			add_location(div33, file$2, 168, 6, 3818);
    			attr_dev(div34, "class", "value-row svelte-5txtp8");
    			add_location(div34, file$2, 169, 6, 3879);
    			attr_dev(div35, "class", "paths-row svelte-5txtp8");
    			add_location(div35, file$2, 167, 4, 3788);
    			attr_dev(div36, "class", "paths svelte-5txtp8");
    			add_location(div36, file$2, 129, 2, 2844);
    			attr_dev(div37, "class", "info svelte-5txtp8");
    			add_location(div37, file$2, 100, 0, 2002);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div37, anchor);
    			append_dev(div37, div17);
    			append_dev(div17, div0);
    			mount_component(stopwatch, div0, null);
    			append_dev(div17, t0);
    			append_dev(div17, div16);
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
    			append_dev(div37, t20);
    			append_dev(div37, div36);
    			append_dev(div36, div20);
    			append_dev(div20, div18);
    			append_dev(div20, t22);
    			append_dev(div20, div19);
    			append_dev(div19, p0);
    			append_dev(p0, t23);
    			append_dev(div36, t24);
    			append_dev(div36, div23);
    			append_dev(div23, div21);
    			append_dev(div23, t26);
    			append_dev(div23, div22);
    			append_dev(div22, p1);
    			append_dev(p1, t27);
    			append_dev(div36, t28);
    			append_dev(div36, div26);
    			append_dev(div26, div24);
    			append_dev(div26, t30);
    			append_dev(div26, div25);
    			append_dev(div25, p2);
    			append_dev(p2, t31);
    			append_dev(div36, t32);
    			append_dev(div36, div29);
    			append_dev(div29, div27);
    			append_dev(div29, t34);
    			append_dev(div29, div28);
    			append_dev(div28, p3);
    			append_dev(p3, t35);
    			append_dev(div36, t36);
    			append_dev(div36, div32);
    			append_dev(div32, div30);
    			append_dev(div32, t38);
    			append_dev(div32, div31);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div31, null);
    			}

    			append_dev(div36, t39);
    			append_dev(div36, div35);
    			append_dev(div35, div33);
    			append_dev(div35, t41);
    			append_dev(div35, div34);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div34, null);
    			}

    			if (each1_else) {
    				each1_else.m(div34, null);
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

    			if (!current || changed.crossoversCount) {
    				set_data_dev(t15, ctx.crossoversCount);
    			}

    			if (!current || changed.bestValue) {
    				set_data_dev(t19, ctx.bestValue);
    			}

    			if (!current || changed.bestValuesString) {
    				set_data_dev(t23, ctx.bestValuesString);
    			}

    			if ((!current || changed.best) && t27_value !== (t27_value = ctx.best.toString() + "")) {
    				set_data_dev(t27, t27_value);
    			}

    			if (!current || changed.bestPopulation) {
    				set_data_dev(t31, ctx.bestPopulation);
    			}

    			if ((!current || changed.currentBest) && t35_value !== (t35_value = ctx.currentBest.bestValue + "")) {
    				set_data_dev(t35, t35_value);
    			}

    			if (changed.population) {
    				each_value_1 = ctx.population;

    				let i;
    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div31, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}
    				each_blocks_1.length = each_value_1.length;
    			}

    			if (changed.bestResultsFromStorage) {
    				each_value = ctx.bestResultsFromStorage;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div34, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (each_value.length) {
    				if (each1_else) {
    					each1_else.d(1);
    					each1_else = null;
    				}
    			} else if (!each1_else) {
    				each1_else = create_else_block(ctx);
    				each1_else.c();
    				each1_else.m(div34, null);
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
    				detach_dev(div37);
    			}

    			destroy_component(stopwatch);

    			destroy_each(each_blocks_1, detaching);

    			destroy_each(each_blocks, detaching);

    			if (each1_else) each1_else.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { running, graph, currentGeneration, mutationsCount, crossoversCount, bestValue, currentBest, population, best, bestValuesArray, bestResultsFromStorage } = $$props;

    	const writable_props = ['running', 'graph', 'currentGeneration', 'mutationsCount', 'crossoversCount', 'bestValue', 'currentBest', 'population', 'best', 'bestValuesArray', 'bestResultsFromStorage'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<ResultGrid> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('running' in $$props) $$invalidate('running', running = $$props.running);
    		if ('graph' in $$props) $$invalidate('graph', graph = $$props.graph);
    		if ('currentGeneration' in $$props) $$invalidate('currentGeneration', currentGeneration = $$props.currentGeneration);
    		if ('mutationsCount' in $$props) $$invalidate('mutationsCount', mutationsCount = $$props.mutationsCount);
    		if ('crossoversCount' in $$props) $$invalidate('crossoversCount', crossoversCount = $$props.crossoversCount);
    		if ('bestValue' in $$props) $$invalidate('bestValue', bestValue = $$props.bestValue);
    		if ('currentBest' in $$props) $$invalidate('currentBest', currentBest = $$props.currentBest);
    		if ('population' in $$props) $$invalidate('population', population = $$props.population);
    		if ('best' in $$props) $$invalidate('best', best = $$props.best);
    		if ('bestValuesArray' in $$props) $$invalidate('bestValuesArray', bestValuesArray = $$props.bestValuesArray);
    		if ('bestResultsFromStorage' in $$props) $$invalidate('bestResultsFromStorage', bestResultsFromStorage = $$props.bestResultsFromStorage);
    	};

    	$$self.$capture_state = () => {
    		return { running, graph, currentGeneration, mutationsCount, crossoversCount, bestValue, currentBest, population, best, bestValuesArray, bestResultsFromStorage, bestPopulation, bestValuesString };
    	};

    	$$self.$inject_state = $$props => {
    		if ('running' in $$props) $$invalidate('running', running = $$props.running);
    		if ('graph' in $$props) $$invalidate('graph', graph = $$props.graph);
    		if ('currentGeneration' in $$props) $$invalidate('currentGeneration', currentGeneration = $$props.currentGeneration);
    		if ('mutationsCount' in $$props) $$invalidate('mutationsCount', mutationsCount = $$props.mutationsCount);
    		if ('crossoversCount' in $$props) $$invalidate('crossoversCount', crossoversCount = $$props.crossoversCount);
    		if ('bestValue' in $$props) $$invalidate('bestValue', bestValue = $$props.bestValue);
    		if ('currentBest' in $$props) $$invalidate('currentBest', currentBest = $$props.currentBest);
    		if ('population' in $$props) $$invalidate('population', population = $$props.population);
    		if ('best' in $$props) $$invalidate('best', best = $$props.best);
    		if ('bestValuesArray' in $$props) $$invalidate('bestValuesArray', bestValuesArray = $$props.bestValuesArray);
    		if ('bestResultsFromStorage' in $$props) $$invalidate('bestResultsFromStorage', bestResultsFromStorage = $$props.bestResultsFromStorage);
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
    		crossoversCount,
    		bestValue,
    		currentBest,
    		population,
    		best,
    		bestValuesArray,
    		bestResultsFromStorage,
    		bestPopulation,
    		bestValuesString
    	};
    }

    class ResultGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["running", "graph", "currentGeneration", "mutationsCount", "crossoversCount", "bestValue", "currentBest", "population", "best", "bestValuesArray", "bestResultsFromStorage"]);
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
    		if (ctx.crossoversCount === undefined && !('crossoversCount' in props)) {
    			console.warn("<ResultGrid> was created without expected prop 'crossoversCount'");
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
    		if (ctx.bestResultsFromStorage === undefined && !('bestResultsFromStorage' in props)) {
    			console.warn("<ResultGrid> was created without expected prop 'bestResultsFromStorage'");
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

    	get crossoversCount() {
    		throw new Error("<ResultGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set crossoversCount(value) {
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

    	get bestResultsFromStorage() {
    		throw new Error("<ResultGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bestResultsFromStorage(value) {
    		throw new Error("<ResultGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pathCalculate/_LabelItem.svelte generated by Svelte v3.12.1 */

    const file$3 = "src/pathCalculate/_LabelItem.svelte";

    function create_fragment$3(ctx) {
    	var label, span, t, input, input_updating = false, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	function input_input_handler() {
    		input_updating = true;
    		ctx.input_input_handler.call(input);
    	}

    	var input_levels = [
    		ctx.attrs,
    		{ class: "text-input svelte-386rdl" },
    		{ type: "number" }
    	];

    	var input_data = {};
    	for (var i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			span = element("span");

    			if (default_slot) default_slot.c();
    			t = space();
    			input = element("input");

    			attr_dev(span, "class", "svelte-386rdl");
    			add_location(span, file$3, 36, 2, 680);
    			set_attributes(input, input_data);
    			add_location(input, file$3, 39, 2, 712);
    			attr_dev(label, "class", "svelte-386rdl");
    			add_location(label, file$3, 35, 0, 670);
    			dispose = listen_dev(input, "input", input_input_handler);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(span_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			append_dev(label, t);
    			append_dev(label, input);

    			set_input_value(input, ctx.value);

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			if (!input_updating && changed.value) set_input_value(input, ctx.value);
    			input_updating = false;

    			set_attributes(input, get_spread_update(input_levels, [
    				(changed.attrs) && ctx.attrs,
    				{ class: "text-input svelte-386rdl" },
    				{ type: "number" }
    			]));
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(label);
    			}

    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { value = "" } = $$props;

      let attrs = {};

    	let { $$slots = {}, $$scope } = $$props;

    	function input_input_handler() {
    		value = to_number(this.value);
    		$$invalidate('value', value);
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('value' in $$new_props) $$invalidate('value', value = $$new_props.value);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { value, attrs };
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('value' in $$props) $$invalidate('value', value = $$new_props.value);
    		if ('attrs' in $$props) $$invalidate('attrs', attrs = $$new_props.attrs);
    	};

    	$$self.$$.update = ($$dirty = { $$props: 1 }) => {
    		{
            const { value, ...other } = $$props;
            $$invalidate('attrs', attrs = other);
          }
    	};

    	return {
    		value,
    		attrs,
    		input_input_handler,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class LabelItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["value"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "LabelItem", options, id: create_fragment$3.name });
    	}

    	get value() {
    		throw new Error("<LabelItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<LabelItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pathCalculate/MatrixRender.svelte generated by Svelte v3.12.1 */

    const file$4 = "src/pathCalculate/MatrixRender.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.node2 = list[i];
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.node1 = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.node1 = list[i];
    	return child_ctx;
    }

    // (64:12) {#each graph.nodes() as node1}
    function create_each_block_2(ctx) {
    	var td, t_value = ctx.node1 + "", t;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			attr_dev(td, "class", "metro-table__hd svelte-1h0naoo");
    			add_location(td, file$4, 64, 14, 1710);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.graph) && t_value !== (t_value = ctx.node1 + "")) {
    				set_data_dev(t, t_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(td);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_2.name, type: "each", source: "(64:12) {#each graph.nodes() as node1}", ctx });
    	return block;
    }

    // (72:14) {#each graph.nodes() as node2}
    function create_each_block_1$1(ctx) {
    	var td, t_value = ctx.graph.getEdgeWeight(ctx.node1, ctx.node2) + "", t;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			attr_dev(td, "class", "svelte-1h0naoo");
    			add_location(td, file$4, 72, 16, 1962);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.graph) && t_value !== (t_value = ctx.graph.getEdgeWeight(ctx.node1, ctx.node2) + "")) {
    				set_data_dev(t, t_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(td);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1$1.name, type: "each", source: "(72:14) {#each graph.nodes() as node2}", ctx });
    	return block;
    }

    // (69:10) {#each graph.nodes() as node1}
    function create_each_block$1(ctx) {
    	var tr0, td, t0_value = ctx.node1 + "", t0, t1, t2, tr1;

    	let each_value_1 = ctx.graph.nodes();

    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			tr0 = element("tr");
    			td = element("td");
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			tr1 = element("tr");
    			attr_dev(td, "class", "metro-table__hd svelte-1h0naoo");
    			add_location(td, file$4, 70, 14, 1860);
    			add_location(tr0, file$4, 69, 12, 1841);
    			add_location(tr1, file$4, 74, 12, 2041);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, tr0, anchor);
    			append_dev(tr0, td);
    			append_dev(td, t0);
    			append_dev(tr0, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr0, null);
    			}

    			append_dev(tr0, t2);
    			insert_dev(target, tr1, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.graph) && t0_value !== (t0_value = ctx.node1 + "")) {
    				set_data_dev(t0, t0_value);
    			}

    			if (changed.graph) {
    				each_value_1 = ctx.graph.nodes();

    				let i;
    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr0, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_1.length;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(tr0);
    			}

    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach_dev(tr1);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$1.name, type: "each", source: "(69:10) {#each graph.nodes() as node1}", ctx });
    	return block;
    }

    function create_fragment$4(ctx) {
    	var div3, h3, t1, div2, div0, table, tr, td, t2, t3, t4, div1, img, div3_intro;

    	let each_value_2 = ctx.graph.nodes();

    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = ctx.graph.nodes();

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Adjacency matrix of the metrograph";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			table = element("table");
    			tr = element("tr");
    			td = element("td");
    			t2 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div1 = element("div");
    			img = element("img");
    			attr_dev(h3, "class", "svelte-1h0naoo");
    			add_location(h3, file$4, 56, 2, 1463);
    			attr_dev(td, "class", "svelte-1h0naoo");
    			add_location(td, file$4, 62, 12, 1643);
    			add_location(tr, file$4, 61, 10, 1626);
    			attr_dev(table, "class", "metro-table svelte-1h0naoo");
    			add_location(table, file$4, 60, 6, 1588);
    			attr_dev(div0, "class", "metro-table-wrapper svelte-1h0naoo");
    			add_location(div0, file$4, 59, 4, 1548);
    			attr_dev(img, "alt", "metro-image");
    			attr_dev(img, "src", ctx.metroImage);
    			attr_dev(img, "class", "svelte-1h0naoo");
    			add_location(img, file$4, 81, 6, 2136);
    			attr_dev(div1, "class", "metro-image svelte-1h0naoo");
    			add_location(div1, file$4, 80, 4, 2104);
    			attr_dev(div2, "class", "matrix-render__data svelte-1h0naoo");
    			add_location(div2, file$4, 58, 2, 1510);
    			attr_dev(div3, "class", "matrix-render");
    			add_location(div3, file$4, 55, 0, 1396);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, h3);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, table);
    			append_dev(table, tr);
    			append_dev(tr, td);
    			append_dev(tr, t2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr, null);
    			}

    			append_dev(table, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    		},

    		p: function update(changed, ctx) {
    			if (changed.graph) {
    				each_value_2 = ctx.graph.nodes();

    				let i;
    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}
    				each_blocks_1.length = each_value_2.length;
    			}

    			if (changed.graph) {
    				each_value = ctx.graph.nodes();

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (changed.metroImage) {
    				attr_dev(img, "src", ctx.metroImage);
    			}
    		},

    		i: function intro(local) {
    			if (!div3_intro) {
    				add_render_callback(() => {
    					div3_intro = create_in_transition(div3, fly, { y: 50, duration: 1000 });
    					div3_intro.start();
    				});
    			}
    		},

    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div3);
    			}

    			destroy_each(each_blocks_1, detaching);

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { graph, metroImage } = $$props;

    	const writable_props = ['graph', 'metroImage'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<MatrixRender> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('graph' in $$props) $$invalidate('graph', graph = $$props.graph);
    		if ('metroImage' in $$props) $$invalidate('metroImage', metroImage = $$props.metroImage);
    	};

    	$$self.$capture_state = () => {
    		return { graph, metroImage };
    	};

    	$$self.$inject_state = $$props => {
    		if ('graph' in $$props) $$invalidate('graph', graph = $$props.graph);
    		if ('metroImage' in $$props) $$invalidate('metroImage', metroImage = $$props.metroImage);
    	};

    	return { graph, metroImage };
    }

    class MatrixRender extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["graph", "metroImage"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "MatrixRender", options, id: create_fragment$4.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.graph === undefined && !('graph' in props)) {
    			console.warn("<MatrixRender> was created without expected prop 'graph'");
    		}
    		if (ctx.metroImage === undefined && !('metroImage' in props)) {
    			console.warn("<MatrixRender> was created without expected prop 'metroImage'");
    		}
    	}

    	get graph() {
    		throw new Error("<MatrixRender>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set graph(value) {
    		throw new Error("<MatrixRender>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get metroImage() {
    		throw new Error("<MatrixRender>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set metroImage(value) {
    		throw new Error("<MatrixRender>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const mutationCount = writable(0);
    const crossoverCount = writable(0);

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
      mutationCount.update(n => n + 1);
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

    function mutation(population, populationSize, mutationProps) {
      let newPopulation = population.clone();
      for (let i = 0; i < populationSize; i++) {
        if (Math.random() < mutationProps.mutationProbability) {
          if (Math.random() > mutationProps.doMutateProbability) {
            newPopulation[i] = doMutate(population[i]);
          } 
          if (Math.random() > mutationProps.pushMutateProbability) {
            newPopulation[i] = pushMutate(population[i]);
          }
          if (Math.random() > mutationProps.reverseMutateProbability) {
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
        crossoverCount.update(n => n + 1);
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

    const file$5 = "src/pathCalculate/PathCalculate.svelte";

    // (250:6) <LabelItem step="1" min="1" max="50" bind:value={populationSize}>
    function create_default_slot_6(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Population size:");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_6.name, type: "slot", source: "(250:6) <LabelItem step=\"1\" min=\"1\" max=\"50\" bind:value={populationSize}>", ctx });
    	return block;
    }

    // (254:6) <LabelItem         step="20"         min="10"         max="3000"         disabled={running}         bind:value={intervalDuration}>
    function create_default_slot_5(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Interval duration:");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_5.name, type: "slot", source: "(254:6) <LabelItem         step=\"20\"         min=\"10\"         max=\"3000\"         disabled={running}         bind:value={intervalDuration}>", ctx });
    	return block;
    }

    // (265:6) <LabelItem         step="0.1"         min="0.01"         max="1"         bind:value={crossoverProbability}>
    function create_default_slot_4(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Crossovers probability:");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_4.name, type: "slot", source: "(265:6) <LabelItem         step=\"0.1\"         min=\"0.01\"         max=\"1\"         bind:value={crossoverProbability}>", ctx });
    	return block;
    }

    // (274:4) <LabelItem       step="0.01"       min="0.01"       max="1"       bind:value={mutationProps.mutationProbability}>
    function create_default_slot_3(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Mutation probability:");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_3.name, type: "slot", source: "(274:4) <LabelItem       step=\"0.01\"       min=\"0.01\"       max=\"1\"       bind:value={mutationProps.mutationProbability}>", ctx });
    	return block;
    }

    // (282:4) <LabelItem       step="0.01"       min="0.01"       max="1"       bind:value={mutationProps.doMutateProbability}>
    function create_default_slot_2(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("'Do' mutation:");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_2.name, type: "slot", source: "(282:4) <LabelItem       step=\"0.01\"       min=\"0.01\"       max=\"1\"       bind:value={mutationProps.doMutateProbability}>", ctx });
    	return block;
    }

    // (290:4) <LabelItem       step="0.01"       min="0.01"       max="1"       bind:value={mutationProps.pushMutateProbability}>
    function create_default_slot_1(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("'Push' mutation:");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_1.name, type: "slot", source: "(290:4) <LabelItem       step=\"0.01\"       min=\"0.01\"       max=\"1\"       bind:value={mutationProps.pushMutateProbability}>", ctx });
    	return block;
    }

    // (298:4) <LabelItem       step="0.01"       min="0.01"       max="1"       bind:value={mutationProps.reverseMutateProbability}>
    function create_default_slot(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("'Reverse' mutation:");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot.name, type: "slot", source: "(298:4) <LabelItem       step=\"0.01\"       min=\"0.01\"       max=\"1\"       bind:value={mutationProps.reverseMutateProbability}>", ctx });
    	return block;
    }

    // (311:4) {#if !running && bestValue}
    function create_if_block$1(ctx) {
    	var div, button, t_1, dispose;

    	var if_block = (ctx.bestResultsFromStorage.length) && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Save to storage";
    			t_1 = space();
    			if (if_block) if_block.c();
    			attr_dev(button, "class", "startButton svelte-1cwhiuw");
    			add_location(button, file$5, 312, 8, 7303);
    			attr_dev(div, "class", "storage-buttons svelte-1cwhiuw");
    			add_location(div, file$5, 311, 6, 7265);
    			dispose = listen_dev(button, "click", ctx.onSave);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t_1);
    			if (if_block) if_block.m(div, null);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.bestResultsFromStorage.length) {
    				if (!if_block) {
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

    			if (if_block) if_block.d();
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(311:4) {#if !running && bestValue}", ctx });
    	return block;
    }

    // (315:8) {#if bestResultsFromStorage.length}
    function create_if_block_1(ctx) {
    	var button, dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Clear storage";
    			attr_dev(button, "class", "startButton svelte-1cwhiuw");
    			add_location(button, file$5, 315, 10, 7429);
    			dispose = listen_dev(button, "click", ctx.onClear);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(button);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(315:8) {#if bestResultsFromStorage.length}", ctx });
    	return block;
    }

    function create_fragment$5(ctx) {
    	var t0, div4, div3, h4, t2, div0, updating_value, t3, updating_value_1, t4, div1, updating_value_2, t5, updating_value_3, t6, updating_value_4, t7, updating_value_5, t8, updating_value_6, t9, div2, button0, t11, button1, t13, t14, div4_intro, current, dispose;

    	var matrixrender = new MatrixRender({
    		props: {
    		graph: ctx.graph,
    		metroImage: ctx.metroImage
    	},
    		$$inline: true
    	});

    	function labelitem0_value_binding(value) {
    		ctx.labelitem0_value_binding.call(null, value);
    		updating_value = true;
    		add_flush_callback(() => updating_value = false);
    	}

    	let labelitem0_props = {
    		step: "1",
    		min: "1",
    		max: "50",
    		$$slots: { default: [create_default_slot_6] },
    		$$scope: { ctx }
    	};
    	if (ctx.populationSize !== void 0) {
    		labelitem0_props.value = ctx.populationSize;
    	}
    	var labelitem0 = new LabelItem({ props: labelitem0_props, $$inline: true });

    	binding_callbacks.push(() => bind(labelitem0, 'value', labelitem0_value_binding));

    	function labelitem1_value_binding(value_1) {
    		ctx.labelitem1_value_binding.call(null, value_1);
    		updating_value_1 = true;
    		add_flush_callback(() => updating_value_1 = false);
    	}

    	let labelitem1_props = {
    		step: "20",
    		min: "10",
    		max: "3000",
    		disabled: ctx.running,
    		$$slots: { default: [create_default_slot_5] },
    		$$scope: { ctx }
    	};
    	if (ctx.intervalDuration !== void 0) {
    		labelitem1_props.value = ctx.intervalDuration;
    	}
    	var labelitem1 = new LabelItem({ props: labelitem1_props, $$inline: true });

    	binding_callbacks.push(() => bind(labelitem1, 'value', labelitem1_value_binding));

    	function labelitem2_value_binding(value_2) {
    		ctx.labelitem2_value_binding.call(null, value_2);
    		updating_value_2 = true;
    		add_flush_callback(() => updating_value_2 = false);
    	}

    	let labelitem2_props = {
    		step: "0.1",
    		min: "0.01",
    		max: "1",
    		$$slots: { default: [create_default_slot_4] },
    		$$scope: { ctx }
    	};
    	if (ctx.crossoverProbability !== void 0) {
    		labelitem2_props.value = ctx.crossoverProbability;
    	}
    	var labelitem2 = new LabelItem({ props: labelitem2_props, $$inline: true });

    	binding_callbacks.push(() => bind(labelitem2, 'value', labelitem2_value_binding));

    	function labelitem3_value_binding(value_3) {
    		ctx.labelitem3_value_binding.call(null, value_3);
    		updating_value_3 = true;
    		add_flush_callback(() => updating_value_3 = false);
    	}

    	let labelitem3_props = {
    		step: "0.01",
    		min: "0.01",
    		max: "1",
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	};
    	if (ctx.mutationProps.mutationProbability !== void 0) {
    		labelitem3_props.value = ctx.mutationProps.mutationProbability;
    	}
    	var labelitem3 = new LabelItem({ props: labelitem3_props, $$inline: true });

    	binding_callbacks.push(() => bind(labelitem3, 'value', labelitem3_value_binding));

    	function labelitem4_value_binding(value_4) {
    		ctx.labelitem4_value_binding.call(null, value_4);
    		updating_value_4 = true;
    		add_flush_callback(() => updating_value_4 = false);
    	}

    	let labelitem4_props = {
    		step: "0.01",
    		min: "0.01",
    		max: "1",
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	};
    	if (ctx.mutationProps.doMutateProbability !== void 0) {
    		labelitem4_props.value = ctx.mutationProps.doMutateProbability;
    	}
    	var labelitem4 = new LabelItem({ props: labelitem4_props, $$inline: true });

    	binding_callbacks.push(() => bind(labelitem4, 'value', labelitem4_value_binding));

    	function labelitem5_value_binding(value_5) {
    		ctx.labelitem5_value_binding.call(null, value_5);
    		updating_value_5 = true;
    		add_flush_callback(() => updating_value_5 = false);
    	}

    	let labelitem5_props = {
    		step: "0.01",
    		min: "0.01",
    		max: "1",
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};
    	if (ctx.mutationProps.pushMutateProbability !== void 0) {
    		labelitem5_props.value = ctx.mutationProps.pushMutateProbability;
    	}
    	var labelitem5 = new LabelItem({ props: labelitem5_props, $$inline: true });

    	binding_callbacks.push(() => bind(labelitem5, 'value', labelitem5_value_binding));

    	function labelitem6_value_binding(value_6) {
    		ctx.labelitem6_value_binding.call(null, value_6);
    		updating_value_6 = true;
    		add_flush_callback(() => updating_value_6 = false);
    	}

    	let labelitem6_props = {
    		step: "0.01",
    		min: "0.01",
    		max: "1",
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};
    	if (ctx.mutationProps.reverseMutateProbability !== void 0) {
    		labelitem6_props.value = ctx.mutationProps.reverseMutateProbability;
    	}
    	var labelitem6 = new LabelItem({ props: labelitem6_props, $$inline: true });

    	binding_callbacks.push(() => bind(labelitem6, 'value', labelitem6_value_binding));

    	var if_block = (!ctx.running && ctx.bestValue) && create_if_block$1(ctx);

    	var resultgrid = new ResultGrid({
    		props: {
    		running: ctx.running,
    		graph: ctx.graph,
    		currentGeneration: ctx.currentGeneration,
    		mutationsCount: ctx.mutationsCount,
    		crossoversCount: ctx.crossoversCount,
    		bestValue: ctx.bestValue,
    		currentBest: ctx.currentBest,
    		population: ctx.population,
    		best: ctx.best,
    		bestValuesArray: ctx.bestValuesArray,
    		bestResultsFromStorage: ctx.bestResultsFromStorage
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			matrixrender.$$.fragment.c();
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Algorithm parameters";
    			t2 = space();
    			div0 = element("div");
    			labelitem0.$$.fragment.c();
    			t3 = space();
    			labelitem1.$$.fragment.c();
    			t4 = space();
    			div1 = element("div");
    			labelitem2.$$.fragment.c();
    			t5 = space();
    			labelitem3.$$.fragment.c();
    			t6 = space();
    			labelitem4.$$.fragment.c();
    			t7 = space();
    			labelitem5.$$.fragment.c();
    			t8 = space();
    			labelitem6.$$.fragment.c();
    			t9 = space();
    			div2 = element("div");
    			button0 = element("button");
    			button0.textContent = "Start";
    			t11 = space();
    			button1 = element("button");
    			button1.textContent = "Stop";
    			t13 = space();
    			if (if_block) if_block.c();
    			t14 = space();
    			resultgrid.$$.fragment.c();
    			attr_dev(h4, "class", "svelte-1cwhiuw");
    			add_location(h4, file$5, 246, 4, 5832);
    			attr_dev(div0, "class", "flex svelte-1cwhiuw");
    			add_location(div0, file$5, 248, 4, 5867);
    			attr_dev(div1, "class", "flex svelte-1cwhiuw");
    			add_location(div1, file$5, 263, 4, 6202);
    			attr_dev(button0, "class", "startButton general svelte-1cwhiuw");
    			add_location(button0, file$5, 306, 6, 7079);
    			attr_dev(button1, "class", "startButton svelte-1cwhiuw");
    			add_location(button1, file$5, 307, 6, 7155);
    			attr_dev(div2, "class", "buttons svelte-1cwhiuw");
    			add_location(div2, file$5, 305, 4, 7051);
    			attr_dev(div3, "class", "calculate-block__left svelte-1cwhiuw");
    			add_location(div3, file$5, 245, 2, 5792);
    			attr_dev(div4, "class", "calculate-block svelte-1cwhiuw");
    			add_location(div4, file$5, 243, 0, 5724);

    			dispose = [
    				listen_dev(button0, "click", ctx.onStart),
    				listen_dev(button1, "click", ctx.onStop)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(matrixrender, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, h4);
    			append_dev(div3, t2);
    			append_dev(div3, div0);
    			mount_component(labelitem0, div0, null);
    			append_dev(div0, t3);
    			mount_component(labelitem1, div0, null);
    			append_dev(div3, t4);
    			append_dev(div3, div1);
    			mount_component(labelitem2, div1, null);
    			append_dev(div3, t5);
    			mount_component(labelitem3, div3, null);
    			append_dev(div3, t6);
    			mount_component(labelitem4, div3, null);
    			append_dev(div3, t7);
    			mount_component(labelitem5, div3, null);
    			append_dev(div3, t8);
    			mount_component(labelitem6, div3, null);
    			append_dev(div3, t9);
    			append_dev(div3, div2);
    			append_dev(div2, button0);
    			append_dev(div2, t11);
    			append_dev(div2, button1);
    			append_dev(div3, t13);
    			if (if_block) if_block.m(div3, null);
    			append_dev(div4, t14);
    			mount_component(resultgrid, div4, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var matrixrender_changes = {};
    			if (changed.graph) matrixrender_changes.graph = ctx.graph;
    			if (changed.metroImage) matrixrender_changes.metroImage = ctx.metroImage;
    			matrixrender.$set(matrixrender_changes);

    			var labelitem0_changes = {};
    			if (changed.$$scope) labelitem0_changes.$$scope = { changed, ctx };
    			if (!updating_value && changed.populationSize) {
    				labelitem0_changes.value = ctx.populationSize;
    			}
    			labelitem0.$set(labelitem0_changes);

    			var labelitem1_changes = {};
    			if (changed.running) labelitem1_changes.disabled = ctx.running;
    			if (changed.$$scope) labelitem1_changes.$$scope = { changed, ctx };
    			if (!updating_value_1 && changed.intervalDuration) {
    				labelitem1_changes.value = ctx.intervalDuration;
    			}
    			labelitem1.$set(labelitem1_changes);

    			var labelitem2_changes = {};
    			if (changed.$$scope) labelitem2_changes.$$scope = { changed, ctx };
    			if (!updating_value_2 && changed.crossoverProbability) {
    				labelitem2_changes.value = ctx.crossoverProbability;
    			}
    			labelitem2.$set(labelitem2_changes);

    			var labelitem3_changes = {};
    			if (changed.$$scope) labelitem3_changes.$$scope = { changed, ctx };
    			if (!updating_value_3 && changed.mutationProps) {
    				labelitem3_changes.value = ctx.mutationProps.mutationProbability;
    			}
    			labelitem3.$set(labelitem3_changes);

    			var labelitem4_changes = {};
    			if (changed.$$scope) labelitem4_changes.$$scope = { changed, ctx };
    			if (!updating_value_4 && changed.mutationProps) {
    				labelitem4_changes.value = ctx.mutationProps.doMutateProbability;
    			}
    			labelitem4.$set(labelitem4_changes);

    			var labelitem5_changes = {};
    			if (changed.$$scope) labelitem5_changes.$$scope = { changed, ctx };
    			if (!updating_value_5 && changed.mutationProps) {
    				labelitem5_changes.value = ctx.mutationProps.pushMutateProbability;
    			}
    			labelitem5.$set(labelitem5_changes);

    			var labelitem6_changes = {};
    			if (changed.$$scope) labelitem6_changes.$$scope = { changed, ctx };
    			if (!updating_value_6 && changed.mutationProps) {
    				labelitem6_changes.value = ctx.mutationProps.reverseMutateProbability;
    			}
    			labelitem6.$set(labelitem6_changes);

    			if (!ctx.running && ctx.bestValue) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div3, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			var resultgrid_changes = {};
    			if (changed.running) resultgrid_changes.running = ctx.running;
    			if (changed.graph) resultgrid_changes.graph = ctx.graph;
    			if (changed.currentGeneration) resultgrid_changes.currentGeneration = ctx.currentGeneration;
    			if (changed.mutationsCount) resultgrid_changes.mutationsCount = ctx.mutationsCount;
    			if (changed.crossoversCount) resultgrid_changes.crossoversCount = ctx.crossoversCount;
    			if (changed.bestValue) resultgrid_changes.bestValue = ctx.bestValue;
    			if (changed.currentBest) resultgrid_changes.currentBest = ctx.currentBest;
    			if (changed.population) resultgrid_changes.population = ctx.population;
    			if (changed.best) resultgrid_changes.best = ctx.best;
    			if (changed.bestValuesArray) resultgrid_changes.bestValuesArray = ctx.bestValuesArray;
    			if (changed.bestResultsFromStorage) resultgrid_changes.bestResultsFromStorage = ctx.bestResultsFromStorage;
    			resultgrid.$set(resultgrid_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(matrixrender.$$.fragment, local);

    			transition_in(labelitem0.$$.fragment, local);

    			transition_in(labelitem1.$$.fragment, local);

    			transition_in(labelitem2.$$.fragment, local);

    			transition_in(labelitem3.$$.fragment, local);

    			transition_in(labelitem4.$$.fragment, local);

    			transition_in(labelitem5.$$.fragment, local);

    			transition_in(labelitem6.$$.fragment, local);

    			transition_in(resultgrid.$$.fragment, local);

    			if (!div4_intro) {
    				add_render_callback(() => {
    					div4_intro = create_in_transition(div4, fly, { y: 50, duration: 1000 });
    					div4_intro.start();
    				});
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(matrixrender.$$.fragment, local);
    			transition_out(labelitem0.$$.fragment, local);
    			transition_out(labelitem1.$$.fragment, local);
    			transition_out(labelitem2.$$.fragment, local);
    			transition_out(labelitem3.$$.fragment, local);
    			transition_out(labelitem4.$$.fragment, local);
    			transition_out(labelitem5.$$.fragment, local);
    			transition_out(labelitem6.$$.fragment, local);
    			transition_out(resultgrid.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(matrixrender, detaching);

    			if (detaching) {
    				detach_dev(t0);
    				detach_dev(div4);
    			}

    			destroy_component(labelitem0);

    			destroy_component(labelitem1);

    			destroy_component(labelitem2);

    			destroy_component(labelitem3);

    			destroy_component(labelitem4);

    			destroy_component(labelitem5);

    			destroy_component(labelitem6);

    			if (if_block) if_block.d();

    			destroy_component(resultgrid);

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	

      const dispatch = createEventDispatcher();

      // constants
      let populationSize = 20;
      let crossoverProbability = 0.5;
      let intervalDuration = 20;
      let mutationProps = {
        mutationProbability: 0.1,
        doMutateProbability: 0.1,
        pushMutateProbability: 0.1,
        reverseMutateProbability: 0.05
      };

      let { id, graph, stationsBetween, dis, metroImage } = $$props;

      let running = false;
      let bestResultsFromStorage = [];
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
      let crossoversCount;

      const unsubscribeMutation = mutationCount.subscribe(
        value => ($$invalidate('mutationsCount', mutationsCount = value))
      );
      const unsubscribeCrossover = crossoverCount.subscribe(
        value => ($$invalidate('crossoversCount', crossoversCount = value))
      );

      onDestroy(() => {
        clearInterval(mainInterval);
      });

      onMount(() => {
        $$invalidate('bestResultsFromStorage', bestResultsFromStorage = JSON.parse(localStorage.getItem(id)) || []);
      });

      function onSave() {
        $$invalidate('bestResultsFromStorage', bestResultsFromStorage = [
          ...bestResultsFromStorage,
          { bestValue, bestPath: best }
        ]);
        localStorage.setItem(id, JSON.stringify(bestResultsFromStorage));
      }

      function onClear() {
        localStorage.setItem(id, JSON.stringify("[]"));
        $$invalidate('bestResultsFromStorage', bestResultsFromStorage = []);
      }

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

      function dispatchBestResult() {
        dispatch("getResult", {
          result: best
        });
      }

      function GAStop() {
        clearInterval(mainInterval);
        dispatchBestResult();
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
        mutationCount.update(n => 0);
        crossoverCount.update(n => 0);
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
        $$invalidate('population', population = selection(
          population,
          currentBest,
          best,
          values,
          populationSize
        ));
        $$invalidate('population', population = crossover(
          population,
          dis,
          populationSize,
          crossoverProbability
        ));
        $$invalidate('population', population = mutation(population, populationSize, mutationProps));
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

    	const writable_props = ['id', 'graph', 'stationsBetween', 'dis', 'metroImage'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<PathCalculate> was created with unknown prop '${key}'`);
    	});

    	function labelitem0_value_binding(value) {
    		populationSize = value;
    		$$invalidate('populationSize', populationSize);
    	}

    	function labelitem1_value_binding(value_1) {
    		intervalDuration = value_1;
    		$$invalidate('intervalDuration', intervalDuration);
    	}

    	function labelitem2_value_binding(value_2) {
    		crossoverProbability = value_2;
    		$$invalidate('crossoverProbability', crossoverProbability);
    	}

    	function labelitem3_value_binding(value_3) {
    		mutationProps.mutationProbability = value_3;
    		$$invalidate('mutationProps', mutationProps);
    	}

    	function labelitem4_value_binding(value_4) {
    		mutationProps.doMutateProbability = value_4;
    		$$invalidate('mutationProps', mutationProps);
    	}

    	function labelitem5_value_binding(value_5) {
    		mutationProps.pushMutateProbability = value_5;
    		$$invalidate('mutationProps', mutationProps);
    	}

    	function labelitem6_value_binding(value_6) {
    		mutationProps.reverseMutateProbability = value_6;
    		$$invalidate('mutationProps', mutationProps);
    	}

    	$$self.$set = $$props => {
    		if ('id' in $$props) $$invalidate('id', id = $$props.id);
    		if ('graph' in $$props) $$invalidate('graph', graph = $$props.graph);
    		if ('stationsBetween' in $$props) $$invalidate('stationsBetween', stationsBetween = $$props.stationsBetween);
    		if ('dis' in $$props) $$invalidate('dis', dis = $$props.dis);
    		if ('metroImage' in $$props) $$invalidate('metroImage', metroImage = $$props.metroImage);
    	};

    	$$self.$capture_state = () => {
    		return { populationSize, crossoverProbability, intervalDuration, mutationProps, id, graph, stationsBetween, dis, metroImage, running, bestResultsFromStorage, mainInterval, currentGeneration, bestValue, bestValuesArray, best, currentBest, population, values, mutationsCount, crossoversCount };
    	};

    	$$self.$inject_state = $$props => {
    		if ('populationSize' in $$props) $$invalidate('populationSize', populationSize = $$props.populationSize);
    		if ('crossoverProbability' in $$props) $$invalidate('crossoverProbability', crossoverProbability = $$props.crossoverProbability);
    		if ('intervalDuration' in $$props) $$invalidate('intervalDuration', intervalDuration = $$props.intervalDuration);
    		if ('mutationProps' in $$props) $$invalidate('mutationProps', mutationProps = $$props.mutationProps);
    		if ('id' in $$props) $$invalidate('id', id = $$props.id);
    		if ('graph' in $$props) $$invalidate('graph', graph = $$props.graph);
    		if ('stationsBetween' in $$props) $$invalidate('stationsBetween', stationsBetween = $$props.stationsBetween);
    		if ('dis' in $$props) $$invalidate('dis', dis = $$props.dis);
    		if ('metroImage' in $$props) $$invalidate('metroImage', metroImage = $$props.metroImage);
    		if ('running' in $$props) $$invalidate('running', running = $$props.running);
    		if ('bestResultsFromStorage' in $$props) $$invalidate('bestResultsFromStorage', bestResultsFromStorage = $$props.bestResultsFromStorage);
    		if ('mainInterval' in $$props) mainInterval = $$props.mainInterval;
    		if ('currentGeneration' in $$props) $$invalidate('currentGeneration', currentGeneration = $$props.currentGeneration);
    		if ('bestValue' in $$props) $$invalidate('bestValue', bestValue = $$props.bestValue);
    		if ('bestValuesArray' in $$props) $$invalidate('bestValuesArray', bestValuesArray = $$props.bestValuesArray);
    		if ('best' in $$props) $$invalidate('best', best = $$props.best);
    		if ('currentBest' in $$props) $$invalidate('currentBest', currentBest = $$props.currentBest);
    		if ('population' in $$props) $$invalidate('population', population = $$props.population);
    		if ('values' in $$props) values = $$props.values;
    		if ('mutationsCount' in $$props) $$invalidate('mutationsCount', mutationsCount = $$props.mutationsCount);
    		if ('crossoversCount' in $$props) $$invalidate('crossoversCount', crossoversCount = $$props.crossoversCount);
    	};

    	return {
    		populationSize,
    		crossoverProbability,
    		intervalDuration,
    		mutationProps,
    		id,
    		graph,
    		stationsBetween,
    		dis,
    		metroImage,
    		running,
    		bestResultsFromStorage,
    		currentGeneration,
    		bestValue,
    		bestValuesArray,
    		best,
    		currentBest,
    		population,
    		mutationsCount,
    		crossoversCount,
    		onSave,
    		onClear,
    		onStart,
    		onStop,
    		labelitem0_value_binding,
    		labelitem1_value_binding,
    		labelitem2_value_binding,
    		labelitem3_value_binding,
    		labelitem4_value_binding,
    		labelitem5_value_binding,
    		labelitem6_value_binding
    	};
    }

    class PathCalculate extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, ["id", "graph", "stationsBetween", "dis", "metroImage"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "PathCalculate", options, id: create_fragment$5.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.id === undefined && !('id' in props)) {
    			console.warn("<PathCalculate> was created without expected prop 'id'");
    		}
    		if (ctx.graph === undefined && !('graph' in props)) {
    			console.warn("<PathCalculate> was created without expected prop 'graph'");
    		}
    		if (ctx.stationsBetween === undefined && !('stationsBetween' in props)) {
    			console.warn("<PathCalculate> was created without expected prop 'stationsBetween'");
    		}
    		if (ctx.dis === undefined && !('dis' in props)) {
    			console.warn("<PathCalculate> was created without expected prop 'dis'");
    		}
    		if (ctx.metroImage === undefined && !('metroImage' in props)) {
    			console.warn("<PathCalculate> was created without expected prop 'metroImage'");
    		}
    	}

    	get id() {
    		throw new Error("<PathCalculate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<PathCalculate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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

    	get metroImage() {
    		throw new Error("<PathCalculate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set metroImage(value) {
    		throw new Error("<PathCalculate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/render/SchemeRender.svelte generated by Svelte v3.12.1 */

    const file$6 = "src/render/SchemeRender.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.station = list[i];
    	child_ctx.index = i;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.station = list[i];
    	child_ctx.indexInside = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.gap = list[i];
    	child_ctx.index = i;
    	return child_ctx;
    }

    // (167:10) {#each gap.stations as station, indexInside}
    function create_each_block_2$1(ctx) {
    	var div, html_tag, raw_value = ctx.getStation(ctx.station).text + "", t, div_class_value, dispose;

    	function mouseenter_handler() {
    		return ctx.mouseenter_handler(ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			html_tag = new HtmlTag(raw_value, t);
    			attr_dev(div, "class", div_class_value = "aside-row__name " + (ctx.gap.counter - ctx.gap.stations.length + ctx.indexInside + 1 === ctx.showingRow ? 'active' : '') + " svelte-1a2ox9j");
    			add_location(div, file$6, 167, 12, 3578);

    			dispose = [
    				listen_dev(div, "mouseenter", mouseenter_handler),
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
    			if ((changed.resultPath) && raw_value !== (raw_value = ctx.getStation(ctx.station).text + "")) {
    				html_tag.p(raw_value);
    			}

    			if ((changed.resultPath || changed.showingRow) && div_class_value !== (div_class_value = "aside-row__name " + (ctx.gap.counter - ctx.gap.stations.length + ctx.indexInside + 1 === ctx.showingRow ? 'active' : '') + " svelte-1a2ox9j")) {
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_2$1.name, type: "each", source: "(167:10) {#each gap.stations as station, indexInside}", ctx });
    	return block;
    }

    // (164:4) {#each resultPath as gap, index}
    function create_each_block_1$2(ctx) {
    	var div2, div0, t0, div1, t1_value = ctx.gap.weight + "", t1, t2;

    	let each_value_2 = ctx.gap.stations;

    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(div0, "class", "aside-row__stations svelte-1a2ox9j");
    			add_location(div0, file$6, 165, 8, 3477);
    			attr_dev(div1, "class", "aside-row__weight svelte-1a2ox9j");
    			add_location(div1, file$6, 175, 8, 3937);
    			attr_dev(div2, "class", "aside-row svelte-1a2ox9j");
    			add_location(div2, file$6, 164, 6, 3445);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, t1);
    			append_dev(div2, t2);
    		},

    		p: function update(changed, ctx) {
    			if (changed.resultPath || changed.showingRow || changed.getStation) {
    				each_value_2 = ctx.gap.stations;

    				let i;
    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_2$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_2.length;
    			}

    			if ((changed.resultPath) && t1_value !== (t1_value = ctx.gap.weight + "")) {
    				set_data_dev(t1, t1_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1$2.name, type: "each", source: "(164:4) {#each resultPath as gap, index}", ctx });
    	return block;
    }

    // (187:4) {#if schemeSVGData}
    function create_if_block$2(ctx) {
    	var svg, g, each_blocks = [], each_1_lookup = new Map(), svg_font_family_value, svg_viewBox_value, svg_class_value;

    	var if_block = (ctx.schemeSVGData.defs) && create_if_block_2(ctx);

    	let each_value = ctx.stationsPath;

    	const get_key = ctx => ctx.station.id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(g, "fill", ctx.colors.text);
    			add_location(g, file$6, 200, 8, 4568);
    			attr_dev(svg, "font-family", svg_font_family_value = ctx.schemeSVGData.font);
    			attr_dev(svg, "viewBox", svg_viewBox_value = ctx.schemeSVGData.viewBox);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "class", svg_class_value = "map " + (ctx.isMapActive ? 'map-active' : '') + " svelte-1a2ox9j");
    			add_location(svg, file$6, 187, 6, 4202);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, g);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (ctx.schemeSVGData.defs) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(svg, g);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const each_value = ctx.stationsPath;
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, g, destroy_block, create_each_block$2, null, get_each_context$2);

    			if ((changed.schemeSVGData) && svg_font_family_value !== (svg_font_family_value = ctx.schemeSVGData.font)) {
    				attr_dev(svg, "font-family", svg_font_family_value);
    			}

    			if ((changed.schemeSVGData) && svg_viewBox_value !== (svg_viewBox_value = ctx.schemeSVGData.viewBox)) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if ((changed.isMapActive) && svg_class_value !== (svg_class_value = "map " + (ctx.isMapActive ? 'map-active' : '') + " svelte-1a2ox9j")) {
    				attr_dev(svg, "class", svg_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(svg);
    			}

    			if (if_block) if_block.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$2.name, type: "if", source: "(187:4) {#if schemeSVGData}", ctx });
    	return block;
    }

    // (195:8) {#if schemeSVGData.defs}
    function create_if_block_2(ctx) {
    	var defs, raw_value = ctx.schemeSVGData.defs + "";

    	const block = {
    		c: function create() {
    			defs = svg_element("defs");
    			add_location(defs, file$6, 195, 10, 4481);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, defs, anchor);
    			defs.innerHTML = raw_value;
    		},

    		p: function update(changed, ctx) {
    			if ((changed.schemeSVGData) && raw_value !== (raw_value = ctx.schemeSVGData.defs + "")) {
    				defs.innerHTML = raw_value;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(defs);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(195:8) {#if schemeSVGData.defs}", ctx });
    	return block;
    }

    // (203:12) {#if station}
    function create_if_block_1$1(ctx) {
    	var g2, g0, raw0_value = ctx.station.path + "", g0_stroke_value, g1, raw1_value = ctx.station.stop + "", g1_fill_value, text_1, raw2_value = ctx.station.text + "", text_1_style_value, g2_class_value;

    	const block = {
    		c: function create() {
    			g2 = svg_element("g");
    			g0 = svg_element("g");
    			g1 = svg_element("g");
    			text_1 = svg_element("text");
    			attr_dev(g0, "stroke", g0_stroke_value = ctx.colors[ctx.station.color]);
    			add_location(g0, file$6, 204, 16, 4776);
    			attr_dev(g1, "fill", g1_fill_value = ctx.colors[ctx.station.color]);
    			add_location(g1, file$6, 208, 16, 4888);
    			attr_dev(text_1, "style", text_1_style_value = ctx.station.style);
    			add_location(text_1, file$6, 212, 16, 4998);
    			attr_dev(g2, "class", g2_class_value = "station " + (ctx.showingStation == ctx.station.id ? 'fadein' : '') + " svelte-1a2ox9j");
    			add_location(g2, file$6, 203, 14, 4693);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, g2, anchor);
    			append_dev(g2, g0);
    			g0.innerHTML = raw0_value;
    			append_dev(g2, g1);
    			g1.innerHTML = raw1_value;
    			append_dev(g2, text_1);
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
    				g1.innerHTML = raw1_value;
    			}

    			if ((changed.stationsPath) && g1_fill_value !== (g1_fill_value = ctx.colors[ctx.station.color])) {
    				attr_dev(g1, "fill", g1_fill_value);
    			}

    			if ((changed.stationsPath) && raw2_value !== (raw2_value = ctx.station.text + "")) {
    				text_1.innerHTML = raw2_value;
    			}

    			if ((changed.stationsPath) && text_1_style_value !== (text_1_style_value = ctx.station.style)) {
    				attr_dev(text_1, "style", text_1_style_value);
    			}

    			if ((changed.showingStation || changed.stationsPath) && g2_class_value !== (g2_class_value = "station " + (ctx.showingStation == ctx.station.id ? 'fadein' : '') + " svelte-1a2ox9j")) {
    				attr_dev(g2, "class", g2_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(g2);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$1.name, type: "if", source: "(203:12) {#if station}", ctx });
    	return block;
    }

    // (202:10) {#each stationsPath as station, index (station.id)}
    function create_each_block$2(key_1, ctx) {
    	var first, if_block_anchor;

    	var if_block = (ctx.station) && create_if_block_1$1(ctx);

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
    					if_block = create_if_block_1$1(ctx);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$2.name, type: "each", source: "(202:10) {#each stationsPath as station, index (station.id)}", ctx });
    	return block;
    }

    function create_fragment$6(ctx) {
    	var div1, aside, button, t1, t2, div0, img, img_class_value, t3, dispose;

    	let each_value_1 = ctx.resultPath;

    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	var if_block = (ctx.schemeSVGData) && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			aside = element("aside");
    			button = element("button");
    			button.textContent = "Play";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div0 = element("div");
    			img = element("img");
    			t3 = space();
    			if (if_block) if_block.c();
    			attr_dev(button, "class", "start-button general svelte-1a2ox9j");
    			add_location(button, file$6, 161, 4, 3332);
    			attr_dev(aside, "class", "svelte-1a2ox9j");
    			add_location(aside, file$6, 160, 2, 3320);
    			attr_dev(img, "class", img_class_value = "svg-render__back " + (ctx.isMapActive ? 'active' : '') + " svelte-1a2ox9j");
    			attr_dev(img, "alt", "metro-image");
    			attr_dev(img, "src", ctx.metroImage);
    			add_location(img, file$6, 181, 4, 4055);
    			attr_dev(div0, "class", "svg-render svelte-1a2ox9j");
    			add_location(div0, file$6, 180, 2, 4026);
    			attr_dev(div1, "class", "container svelte-1a2ox9j");
    			add_location(div1, file$6, 158, 0, 3293);
    			dispose = listen_dev(button, "click", ctx.onPlay);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, aside);
    			append_dev(aside, button);
    			append_dev(aside, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(aside, null);
    			}

    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t3);
    			if (if_block) if_block.m(div0, null);
    		},

    		p: function update(changed, ctx) {
    			if (changed.resultPath || changed.showingRow || changed.getStation) {
    				each_value_1 = ctx.resultPath;

    				let i;
    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(aside, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_1.length;
    			}

    			if ((changed.isMapActive) && img_class_value !== (img_class_value = "svg-render__back " + (ctx.isMapActive ? 'active' : '') + " svelte-1a2ox9j")) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (changed.metroImage) {
    				attr_dev(img, "src", ctx.metroImage);
    			}

    			if (ctx.schemeSVGData) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div0, null);
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
    				detach_dev(div1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (if_block) if_block.d();
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$6.name, type: "component", source: "", ctx });
    	return block;
    }

    const ANIMATION_DURATION = 200;

    function instance$6($$self, $$props, $$invalidate) {
    	let { stationsPath, resultPath, stations, metroImage, schemeSVGData } = $$props;

      let isMapActive = true;
      let timerId;
      let showingStation,
        showingRow = null;

      // Events
      function onStationHover(index, rowIndex) {
        clearListInterval();
        showStation(index);
        $$invalidate('showingRow', showingRow = null);
      }
      function onPlay() {
        clearListInterval();
        initInterval();
      }

      function initInterval() {
        let index = 0;
        timerId = setInterval(() => {
          if (index < stationsPath.length) {
            showStation(stationsPath[index].id);
            $$invalidate('showingRow', showingRow = index);
            index++;
          } else {
            clearListInterval();
            disableStationHover();
          }
        }, ANIMATION_DURATION);
      }
      function clearListInterval() {
        $$invalidate('showingRow', showingRow = null);
        clearInterval(timerId);
      }
      function showStation(index) {
        $$invalidate('isMapActive', isMapActive = false);
        $$invalidate('showingStation', showingStation = index);
      }
      function disableStationHover() {
        $$invalidate('isMapActive', isMapActive = true);
        $$invalidate('showingStation', showingStation = null);
      }

      // For render
      const getStation = station => stations.find(item => item.id == station) || {};

      const colors = {
        red: "#d22531",
        blue: "#2060ba",
        green: "#41a747",
        text: "#09303b",
        textDisable: "#9c98a6"
      };

    	const writable_props = ['stationsPath', 'resultPath', 'stations', 'metroImage', 'schemeSVGData'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SchemeRender> was created with unknown prop '${key}'`);
    	});

    	const mouseenter_handler = ({ station }) => onStationHover(getStation(station).id);

    	$$self.$set = $$props => {
    		if ('stationsPath' in $$props) $$invalidate('stationsPath', stationsPath = $$props.stationsPath);
    		if ('resultPath' in $$props) $$invalidate('resultPath', resultPath = $$props.resultPath);
    		if ('stations' in $$props) $$invalidate('stations', stations = $$props.stations);
    		if ('metroImage' in $$props) $$invalidate('metroImage', metroImage = $$props.metroImage);
    		if ('schemeSVGData' in $$props) $$invalidate('schemeSVGData', schemeSVGData = $$props.schemeSVGData);
    	};

    	$$self.$capture_state = () => {
    		return { stationsPath, resultPath, stations, metroImage, schemeSVGData, isMapActive, timerId, showingStation, showingRow };
    	};

    	$$self.$inject_state = $$props => {
    		if ('stationsPath' in $$props) $$invalidate('stationsPath', stationsPath = $$props.stationsPath);
    		if ('resultPath' in $$props) $$invalidate('resultPath', resultPath = $$props.resultPath);
    		if ('stations' in $$props) $$invalidate('stations', stations = $$props.stations);
    		if ('metroImage' in $$props) $$invalidate('metroImage', metroImage = $$props.metroImage);
    		if ('schemeSVGData' in $$props) $$invalidate('schemeSVGData', schemeSVGData = $$props.schemeSVGData);
    		if ('isMapActive' in $$props) $$invalidate('isMapActive', isMapActive = $$props.isMapActive);
    		if ('timerId' in $$props) timerId = $$props.timerId;
    		if ('showingStation' in $$props) $$invalidate('showingStation', showingStation = $$props.showingStation);
    		if ('showingRow' in $$props) $$invalidate('showingRow', showingRow = $$props.showingRow);
    	};

    	return {
    		stationsPath,
    		resultPath,
    		stations,
    		metroImage,
    		schemeSVGData,
    		isMapActive,
    		showingStation,
    		showingRow,
    		onStationHover,
    		onPlay,
    		disableStationHover,
    		getStation,
    		colors,
    		mouseenter_handler
    	};
    }

    class SchemeRender extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, ["stationsPath", "resultPath", "stations", "metroImage", "schemeSVGData"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "SchemeRender", options, id: create_fragment$6.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.stationsPath === undefined && !('stationsPath' in props)) {
    			console.warn("<SchemeRender> was created without expected prop 'stationsPath'");
    		}
    		if (ctx.resultPath === undefined && !('resultPath' in props)) {
    			console.warn("<SchemeRender> was created without expected prop 'resultPath'");
    		}
    		if (ctx.stations === undefined && !('stations' in props)) {
    			console.warn("<SchemeRender> was created without expected prop 'stations'");
    		}
    		if (ctx.metroImage === undefined && !('metroImage' in props)) {
    			console.warn("<SchemeRender> was created without expected prop 'metroImage'");
    		}
    		if (ctx.schemeSVGData === undefined && !('schemeSVGData' in props)) {
    			console.warn("<SchemeRender> was created without expected prop 'schemeSVGData'");
    		}
    	}

    	get stationsPath() {
    		throw new Error("<SchemeRender>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stationsPath(value) {
    		throw new Error("<SchemeRender>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get resultPath() {
    		throw new Error("<SchemeRender>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resultPath(value) {
    		throw new Error("<SchemeRender>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stations() {
    		throw new Error("<SchemeRender>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stations(value) {
    		throw new Error("<SchemeRender>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get metroImage() {
    		throw new Error("<SchemeRender>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set metroImage(value) {
    		throw new Error("<SchemeRender>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get schemeSVGData() {
    		throw new Error("<SchemeRender>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set schemeSVGData(value) {
    		throw new Error("<SchemeRender>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/render/ResultRender.svelte generated by Svelte v3.12.1 */

    const file$7 = "src/render/ResultRender.svelte";

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.station = list[i];
    	child_ctx.indexInside = i;
    	return child_ctx;
    }

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.gap = list[i];
    	child_ctx.index = i;
    	return child_ctx;
    }

    // (102:0) {#if stationsPath && resultPath && stations}
    function create_if_block_1$2(ctx) {
    	var section, h3, t_1, section_intro, current;

    	var schemerender = new SchemeRender({
    		props: {
    		stations: ctx.stations,
    		stationsPath: ctx.stationsPath,
    		resultPath: ctx.resultPath,
    		metroImage: ctx.metroImage,
    		schemeSVGData: ctx.schemeSVGData
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			section = element("section");
    			h3 = element("h3");
    			h3.textContent = "Path render";
    			t_1 = space();
    			schemerender.$$.fragment.c();
    			attr_dev(h3, "class", "svelte-1dkq84v");
    			add_location(h3, file$7, 103, 4, 2900);
    			attr_dev(section, "class", "scheme svelte-1dkq84v");
    			add_location(section, file$7, 102, 2, 2836);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h3);
    			append_dev(section, t_1);
    			mount_component(schemerender, section, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var schemerender_changes = {};
    			if (changed.stations) schemerender_changes.stations = ctx.stations;
    			if (changed.stationsPath) schemerender_changes.stationsPath = ctx.stationsPath;
    			if (changed.resultPath) schemerender_changes.resultPath = ctx.resultPath;
    			if (changed.metroImage) schemerender_changes.metroImage = ctx.metroImage;
    			if (changed.schemeSVGData) schemerender_changes.schemeSVGData = ctx.schemeSVGData;
    			schemerender.$set(schemerender_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(schemerender.$$.fragment, local);

    			if (!section_intro) {
    				add_render_callback(() => {
    					section_intro = create_in_transition(section, fly, { y: 50, duration: 1000 });
    					section_intro.start();
    				});
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(schemerender.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(section);
    			}

    			destroy_component(schemerender);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$2.name, type: "if", source: "(102:0) {#if stationsPath && resultPath && stations}", ctx });
    	return block;
    }

    // (114:0) {#if resultPath}
    function create_if_block$3(ctx) {
    	var section, h3, t_1, div1, div0, section_intro;

    	let each_value = ctx.resultPath;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			h3 = element("h3");
    			h3.textContent = "Full best path";
    			t_1 = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(h3, "class", "svelte-1dkq84v");
    			add_location(h3, file$7, 115, 4, 3146);
    			attr_dev(div0, "class", "path-list svelte-1dkq84v");
    			add_location(div0, file$7, 118, 6, 3213);
    			attr_dev(div1, "class", "path-list-wrapper svelte-1dkq84v");
    			add_location(div1, file$7, 117, 4, 3175);
    			attr_dev(section, "class", "full-path svelte-1dkq84v");
    			add_location(section, file$7, 114, 2, 3079);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h3);
    			append_dev(section, t_1);
    			append_dev(section, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.resultPath) {
    				each_value = ctx.resultPath;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: function intro(local) {
    			if (!section_intro) {
    				add_render_callback(() => {
    					section_intro = create_in_transition(section, fly, { y: 50, duration: 1000 });
    					section_intro.start();
    				});
    			}
    		},

    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(section);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$3.name, type: "if", source: "(114:0) {#if resultPath}", ctx });
    	return block;
    }

    // (122:12) {#each gap.stations as station, indexInside}
    function create_each_block_1$3(ctx) {
    	var span, t_value = ctx.station + "", t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "path-list__item svelte-1dkq84v");
    			add_location(span, file$7, 122, 14, 3389);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.resultPath) && t_value !== (t_value = ctx.station + "")) {
    				set_data_dev(t, t_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1$3.name, type: "each", source: "(122:12) {#each gap.stations as station, indexInside}", ctx });
    	return block;
    }

    // (120:8) {#each resultPath as gap, index}
    function create_each_block$3(ctx) {
    	var div, t;

    	let each_value_1 = ctx.gap.stations;

    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "path-list__part svelte-1dkq84v");
    			add_location(div, file$7, 120, 10, 3288);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.resultPath) {
    				each_value_1 = ctx.gap.stations;

    				let i;
    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_1.length;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$3.name, type: "each", source: "(120:8) {#each resultPath as gap, index}", ctx });
    	return block;
    }

    function create_fragment$7(ctx) {
    	var t, if_block1_anchor, current;

    	var if_block0 = (ctx.stationsPath && ctx.resultPath && ctx.stations) && create_if_block_1$2(ctx);

    	var if_block1 = (ctx.resultPath) && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.stationsPath && ctx.resultPath && ctx.stations) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();
    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});
    				check_outros();
    			}

    			if (ctx.resultPath) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);

    			if (detaching) {
    				detach_dev(t);
    			}

    			if (if_block1) if_block1.d(detaching);

    			if (detaching) {
    				detach_dev(if_block1_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$7.name, type: "component", source: "", ctx });
    	return block;
    }

    function getResultPath({ path = [], stationsBetween }) {
      let resultPath = new Array(path.length);
      let counter = 0;

      for (let i = 1; i < path.length; i++) {
        const firstIndex = path[i - 1];
        const secondIndex = path[i];
        const currentGap = stationsBetween[firstIndex][secondIndex];
        counter += currentGap.length - 1;

        resultPath[i] = {
          stations: currentGap.slice(1),
          weight: currentGap.weight,
          counter
        };
      }

      resultPath[0] = {
        stations: [path[0].toString()],
        weight: 0,
        counter: 0
      };

      return resultPath;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	

      let { stationsBetween, path, stations, metroImage, schemeSVGData } = $$props;

      let resultPath = [];
      let stationsPath = [];

      function calculatePath({ path = [], stationsBetween }) {
        let newStationsPath = [];

        $$invalidate('resultPath', resultPath = getResultPath({ path, stationsBetween }));

        if (stations) {
          resultPath.map(gap => {
            gap.stations.map(item => {
              newStationsPath.push(stations.find(station => station.id == item));
            });
          });
        }

        return newStationsPath;
      }

    	const writable_props = ['stationsBetween', 'path', 'stations', 'metroImage', 'schemeSVGData'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<ResultRender> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('stationsBetween' in $$props) $$invalidate('stationsBetween', stationsBetween = $$props.stationsBetween);
    		if ('path' in $$props) $$invalidate('path', path = $$props.path);
    		if ('stations' in $$props) $$invalidate('stations', stations = $$props.stations);
    		if ('metroImage' in $$props) $$invalidate('metroImage', metroImage = $$props.metroImage);
    		if ('schemeSVGData' in $$props) $$invalidate('schemeSVGData', schemeSVGData = $$props.schemeSVGData);
    	};

    	$$self.$capture_state = () => {
    		return { stationsBetween, path, stations, metroImage, schemeSVGData, resultPath, stationsPath };
    	};

    	$$self.$inject_state = $$props => {
    		if ('stationsBetween' in $$props) $$invalidate('stationsBetween', stationsBetween = $$props.stationsBetween);
    		if ('path' in $$props) $$invalidate('path', path = $$props.path);
    		if ('stations' in $$props) $$invalidate('stations', stations = $$props.stations);
    		if ('metroImage' in $$props) $$invalidate('metroImage', metroImage = $$props.metroImage);
    		if ('schemeSVGData' in $$props) $$invalidate('schemeSVGData', schemeSVGData = $$props.schemeSVGData);
    		if ('resultPath' in $$props) $$invalidate('resultPath', resultPath = $$props.resultPath);
    		if ('stationsPath' in $$props) $$invalidate('stationsPath', stationsPath = $$props.stationsPath);
    	};

    	$$self.$$.update = ($$dirty = { path: 1, stationsBetween: 1 }) => {
    		if ($$dirty.path || $$dirty.stationsBetween) { $$invalidate('stationsPath', stationsPath = calculatePath({ path, stationsBetween })); }
    	};

    	return {
    		stationsBetween,
    		path,
    		stations,
    		metroImage,
    		schemeSVGData,
    		resultPath,
    		stationsPath
    	};
    }

    class ResultRender extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, ["stationsBetween", "path", "stations", "metroImage", "schemeSVGData"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "ResultRender", options, id: create_fragment$7.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.stationsBetween === undefined && !('stationsBetween' in props)) {
    			console.warn("<ResultRender> was created without expected prop 'stationsBetween'");
    		}
    		if (ctx.path === undefined && !('path' in props)) {
    			console.warn("<ResultRender> was created without expected prop 'path'");
    		}
    		if (ctx.stations === undefined && !('stations' in props)) {
    			console.warn("<ResultRender> was created without expected prop 'stations'");
    		}
    		if (ctx.metroImage === undefined && !('metroImage' in props)) {
    			console.warn("<ResultRender> was created without expected prop 'metroImage'");
    		}
    		if (ctx.schemeSVGData === undefined && !('schemeSVGData' in props)) {
    			console.warn("<ResultRender> was created without expected prop 'schemeSVGData'");
    		}
    	}

    	get stationsBetween() {
    		throw new Error("<ResultRender>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stationsBetween(value) {
    		throw new Error("<ResultRender>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<ResultRender>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<ResultRender>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stations() {
    		throw new Error("<ResultRender>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stations(value) {
    		throw new Error("<ResultRender>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get metroImage() {
    		throw new Error("<ResultRender>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set metroImage(value) {
    		throw new Error("<ResultRender>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get schemeSVGData() {
    		throw new Error("<ResultRender>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set schemeSVGData(value) {
    		throw new Error("<ResultRender>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const schemes = [
      {
        id: 1,
        name: "Kharkiv metro",
        graphUrl: "https://metro.kh.ua/metroapi.php?value=path",
        stationsUrl: "https://metro.kh.ua/metroapi.php?value=stations",
        schemeUrl: "https://metro.kh.ua/metroapi.php?value=scheme",
        image: "images/metro-kh.svg"
      },
      {
        id: 2,
        name: "Kyiv metro",
        graphUrl: "https://raw.githubusercontent.com/razrabotal/db-2/master/metro.kiev.json",
        stationsUrl: "https://raw.githubusercontent.com/razrabotal/db-2/master/kiev-stations.json",
        schemeUrl: "",
        image: "images/metro-kiev.svg"
      },
      {
        id: 3,
        name: "Custom metro",
        graphUrl: "https://raw.githubusercontent.com/razrabotal/db-2/master/metro-custom-graph.json",
        stationsUrl: "",
        schemeUrl: "",
        image: "images/metro-my-custom.svg"
      },
      {
        id: 4,
        name: "Other metro",
        graphUrl: null,
        stationsUrl: null,
        schemeUrl: null,
        image: "images/metro-custom.svg"
      }
    ];

    /* src/GraphSwitcher/GraphSwitcher.svelte generated by Svelte v3.12.1 */

    const file$8 = "src/GraphSwitcher/GraphSwitcher.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.id = list[i].id;
    	child_ctx.name = list[i].name;
    	child_ctx.image = list[i].image;
    	return child_ctx;
    }

    // (96:2) {#each schemes as { id, name, image }}
    function create_each_block$4(ctx) {
    	var label, input, t0, section, img, t1, h3, t2_value = ctx.name + "", t2, dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			section = element("section");
    			img = element("img");
    			t1 = space();
    			h3 = element("h3");
    			t2 = text(t2_value);
    			ctx.$$binding_groups[0].push(input);
    			attr_dev(input, "class", "radio-input__input svelte-1yep7wz");
    			attr_dev(input, "type", "radio");
    			input.__value = ctx.id;
    			input.value = input.__value;
    			add_location(input, file$8, 97, 6, 2440);
    			attr_dev(img, "alt", ctx.name);
    			attr_dev(img, "src", ctx.image);
    			attr_dev(img, "class", "svelte-1yep7wz");
    			add_location(img, file$8, 99, 8, 2571);
    			attr_dev(h3, "class", "svelte-1yep7wz");
    			add_location(h3, file$8, 100, 8, 2609);
    			attr_dev(section, "class", "svelte-1yep7wz");
    			add_location(section, file$8, 98, 6, 2553);
    			attr_dev(label, "class", "radio-input svelte-1yep7wz");
    			add_location(label, file$8, 96, 4, 2406);

    			dispose = [
    				listen_dev(input, "change", ctx.input_change_handler),
    				listen_dev(input, "change", ctx.onChange)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);

    			input.checked = input.__value === ctx.selectedMetro;

    			append_dev(label, t0);
    			append_dev(label, section);
    			append_dev(section, img);
    			append_dev(section, t1);
    			append_dev(section, h3);
    			append_dev(h3, t2);
    		},

    		p: function update(changed, ctx) {
    			if (changed.selectedMetro) input.checked = input.__value === ctx.selectedMetro;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(label);
    			}

    			ctx.$$binding_groups[0].splice(ctx.$$binding_groups[0].indexOf(input), 1);
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$4.name, type: "each", source: "(96:2) {#each schemes as { id, name, image }}", ctx });
    	return block;
    }

    function create_fragment$8(ctx) {
    	var section, t0, label, span, t2, input, input_updating = false, dispose;

    	let each_value = schemes;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	function input_input_handler() {
    		input_updating = true;
    		ctx.input_input_handler.call(input);
    	}

    	const block = {
    		c: function create() {
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			label = element("label");
    			span = element("span");
    			span.textContent = "Station stay time, min";
    			t2 = space();
    			input = element("input");
    			attr_dev(span, "class", "svelte-1yep7wz");
    			add_location(span, file$8, 106, 4, 2700);
    			attr_dev(input, "class", "input-number svelte-1yep7wz");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "10");
    			add_location(input, file$8, 107, 4, 2740);
    			attr_dev(label, "class", "text-field svelte-1yep7wz");
    			add_location(label, file$8, 105, 2, 2669);
    			attr_dev(section, "class", "graph-switcher svelte-1yep7wz");
    			add_location(section, file$8, 93, 0, 2325);

    			dispose = [
    				listen_dev(input, "input", input_input_handler),
    				listen_dev(input, "change", ctx.onChange)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			append_dev(section, t0);
    			append_dev(section, label);
    			append_dev(label, span);
    			append_dev(label, t2);
    			append_dev(label, input);

    			set_input_value(input, ctx.timeOnStation);
    		},

    		p: function update(changed, ctx) {
    			if (changed.schemes || changed.selectedMetro) {
    				each_value = schemes;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(section, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (!input_updating && changed.timeOnStation) set_input_value(input, ctx.timeOnStation);
    			input_updating = false;
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(section);
    			}

    			destroy_each(each_blocks, detaching);

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$8.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	
      const dispatch = createEventDispatcher();

      let selectedMetro, timeOnStation;

      function onChange() {
        const currentScheme = schemes.find(item => item.id === selectedMetro);

        dispatch("onSelectMetro", {
          result: selectedMetro,
          timeOnStation: timeOnStation,
          graphUrl: currentScheme && currentScheme.graphUrl,
          stationsUrl: currentScheme && currentScheme.stationsUrl,
          schemeUrl: currentScheme && currentScheme.schemeUrl,
          metroImage: currentScheme.image
        });
      } 

      onMount(() => {
        $$invalidate('selectedMetro', selectedMetro = schemes && schemes.length && schemes[0].id);
        $$invalidate('timeOnStation', timeOnStation = 5);
        onChange();
    	});

    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		selectedMetro = this.__value;
    		$$invalidate('selectedMetro', selectedMetro);
    	}

    	function input_input_handler() {
    		timeOnStation = to_number(this.value);
    		$$invalidate('timeOnStation', timeOnStation);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('selectedMetro' in $$props) $$invalidate('selectedMetro', selectedMetro = $$props.selectedMetro);
    		if ('timeOnStation' in $$props) $$invalidate('timeOnStation', timeOnStation = $$props.timeOnStation);
    	};

    	return {
    		selectedMetro,
    		timeOnStation,
    		onChange,
    		input_change_handler,
    		input_input_handler,
    		$$binding_groups
    	};
    }

    class GraphSwitcher extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "GraphSwitcher", options, id: create_fragment$8.name });
    	}
    }

    /* src/GraphSwitcher/UserMetroGraph.svelte generated by Svelte v3.12.1 */

    const file$9 = "src/GraphSwitcher/UserMetroGraph.svelte";

    function create_fragment$9(ctx) {
    	var section, input, t, button, dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			input = element("input");
    			t = space();
    			button = element("button");
    			button.textContent = "Send";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-13aqs62");
    			add_location(input, file$9, 40, 2, 856);
    			attr_dev(button, "class", "svelte-13aqs62");
    			add_location(button, file$9, 41, 2, 900);
    			attr_dev(section, "class", "svelte-13aqs62");
    			add_location(section, file$9, 39, 0, 844);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler),
    				listen_dev(button, "click", ctx.onSubmit)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, input);

    			set_input_value(input, ctx.jsonUrl);

    			append_dev(section, t);
    			append_dev(section, button);
    		},

    		p: function update(changed, ctx) {
    			if (changed.jsonUrl && (input.value !== ctx.jsonUrl)) set_input_value(input, ctx.jsonUrl);
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(section);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$9.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();

      let jsonUrl;

      function onSubmit() {
        dispatch("onSubmitGraph", {
          graphUrl: jsonUrl
        });
      }

    	function input_input_handler() {
    		jsonUrl = this.value;
    		$$invalidate('jsonUrl', jsonUrl);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('jsonUrl' in $$props) $$invalidate('jsonUrl', jsonUrl = $$props.jsonUrl);
    	};

    	return { jsonUrl, onSubmit, input_input_handler };
    }

    class UserMetroGraph extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "UserMetroGraph", options, id: create_fragment$9.name });
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

    function createGraph(data = [], timeOnStation = 0) {
      function getWeight(weight) {
        return weight + timeOnStation;
      }

      const graphTemp = graphDataStructure();
      const graph = graphDataStructure();

      data
        .map(item => ({
          ...item,
          weight: ~~getWeight(item.weight)
        }))
        .map(item => {
          graphTemp.addEdge(item.from, item.to, item.weight);
          graphTemp.addEdge(item.to, item.from, item.weight);
        });

      let stationsBetween = [];

      graphTemp.nodes().map((i, index) => {
        stationsBetween.push([]);

        graphTemp.nodes().map(j => {
          let path = graphTemp.shortestPath(i, j);
          // TODO: Maybe subtract time of station * path.length
          path = subsctractTimeOfStation(path, timeOnStation);
          graph.addEdge(i, j, path.weight);
          stationsBetween[index].push(path);
        });
      });

      const distances = countDistances(graph);

      return { graph, stationsBetween, distances };
    }

    function subsctractTimeOfStation(path, timeOnStation) {
      if (path.length > 2) {
        path.weight = path.weight - (path.length - 2) * timeOnStation;
      }

      return path;
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

    let cache = {};

    async function getGraph(url, timeOnStation) {
      const res = await fetch(url);
      const data = await res.json();
      return createGraph(data, timeOnStation);
    }
    async function getStations(url) {
      const res = await fetch(url);
      const data = await res.json();
      return data;
    }async function getScheme(url) {
      const res = await fetch(url);
      const data = await res.json();
      return data;
    }
    async function getData(variable, func) {
      if (cache[variable]) {
        return cache[variable];
      }
      const result = await func();
      cache[variable] = result;
      return result;
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    const file$a = "src/App.svelte";

    // (186:2) {#if isCustomShowed}
    function create_if_block_2$1(ctx) {
    	var current;

    	var usermetrograph = new UserMetroGraph({ $$inline: true });
    	usermetrograph.$on("onSubmitGraph", ctx.onGetUserGraph);

    	const block = {
    		c: function create() {
    			usermetrograph.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(usermetrograph, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(usermetrograph.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(usermetrograph.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(usermetrograph, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2$1.name, type: "if", source: "(186:2) {#if isCustomShowed}", ctx });
    	return block;
    }

    // (190:2) {#if graph && stationsBetween && dis && isCalculateShowed}
    function create_if_block_1$3(ctx) {
    	var current;

    	var pathcalculate = new PathCalculate({
    		props: {
    		graph: ctx.graph,
    		stationsBetween: ctx.stationsBetween,
    		dis: ctx.dis,
    		metroImage: ctx.metroImage,
    		id: ctx.getUniqueId()
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
    			if (changed.metroImage) pathcalculate_changes.metroImage = ctx.metroImage;
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$3.name, type: "if", source: "(190:2) {#if graph && stationsBetween && dis && isCalculateShowed}", ctx });
    	return block;
    }

    // (200:2) {#if bestPath}
    function create_if_block$4(ctx) {
    	var current;

    	var resultrender = new ResultRender({
    		props: {
    		path: ctx.bestPath,
    		stationsBetween: ctx.stationsBetween,
    		stations: ctx.stations,
    		metroImage: ctx.metroImage,
    		schemeSVGData: ctx.schemeSVGData
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			resultrender.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(resultrender, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var resultrender_changes = {};
    			if (changed.bestPath) resultrender_changes.path = ctx.bestPath;
    			if (changed.stationsBetween) resultrender_changes.stationsBetween = ctx.stationsBetween;
    			if (changed.stations) resultrender_changes.stations = ctx.stations;
    			if (changed.metroImage) resultrender_changes.metroImage = ctx.metroImage;
    			if (changed.schemeSVGData) resultrender_changes.schemeSVGData = ctx.schemeSVGData;
    			resultrender.$set(resultrender_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(resultrender.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(resultrender.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(resultrender, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$4.name, type: "if", source: "(200:2) {#if bestPath}", ctx });
    	return block;
    }

    function create_fragment$a(ctx) {
    	var header, h1, t1, p0, t3, main, t4, t5, t6, t7, footer, p1, current;

    	var graphswitcher = new GraphSwitcher({ $$inline: true });
    	graphswitcher.$on("onSelectMetro", ctx.onSelectMetro);

    	var if_block0 = (ctx.isCustomShowed) && create_if_block_2$1(ctx);

    	var if_block1 = (ctx.graph && ctx.stationsBetween && ctx.dis && ctx.isCalculateShowed) && create_if_block_1$3(ctx);

    	var if_block2 = (ctx.bestPath) && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Transit challenge solver";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "For Kharkiv and other metropolitens";
    			t3 = space();
    			main = element("main");
    			graphswitcher.$$.fragment.c();
    			t4 = space();
    			if (if_block0) if_block0.c();
    			t5 = space();
    			if (if_block1) if_block1.c();
    			t6 = space();
    			if (if_block2) if_block2.c();
    			t7 = space();
    			footer = element("footer");
    			p1 = element("p");
    			p1.textContent = "Taras Gordienko, 2019";
    			add_location(h1, file$a, 178, 2, 8088);
    			add_location(p0, file$a, 179, 2, 8124);
    			add_location(header, file$a, 177, 0, 8077);
    			add_location(main, file$a, 182, 0, 8178);
    			add_location(p1, file$a, 205, 2, 8688);
    			add_location(footer, file$a, 204, 0, 8677);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(header, t1);
    			append_dev(header, p0);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(graphswitcher, main, null);
    			append_dev(main, t4);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t5);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t6);
    			if (if_block2) if_block2.m(main, null);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, footer, anchor);
    			append_dev(footer, p1);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.isCustomShowed) {
    				if (!if_block0) {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t5);
    				} else transition_in(if_block0, 1);
    			} else if (if_block0) {
    				group_outros();
    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});
    				check_outros();
    			}

    			if (ctx.graph && ctx.stationsBetween && ctx.dis && ctx.isCalculateShowed) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, t6);
    				}
    			} else if (if_block1) {
    				group_outros();
    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});
    				check_outros();
    			}

    			if (ctx.bestPath) {
    				if (if_block2) {
    					if_block2.p(changed, ctx);
    					transition_in(if_block2, 1);
    				} else {
    					if_block2 = create_if_block$4(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(main, null);
    				}
    			} else if (if_block2) {
    				group_outros();
    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(graphswitcher.$$.fragment, local);

    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(graphswitcher.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(header);
    				detach_dev(t3);
    				detach_dev(main);
    			}

    			destroy_component(graphswitcher);

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();

    			if (detaching) {
    				detach_dev(t7);
    				detach_dev(footer);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$a.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	

      let graphUrl, stationsUrl, schemeUrl;
      let selectedMetro, timeOnStation, metroImage;
      let schemeSVGData, bestPath, stations, graph, stationsBetween, dis;
      let isCalculateShowed = false;
      let isCustomShowed = false;

      function onSelectMetro(e) {
        selectedMetro = e.detail.result;
        graphUrl = e.detail.graphUrl;
        stationsUrl = e.detail.stationsUrl;
        schemeUrl = e.detail.schemeUrl;
        timeOnStation = e.detail.timeOnStation;
        $$invalidate('metroImage', metroImage = e.detail.metroImage);

        resetData(); 

        if (!graphUrl && !stationsUrl) {
          return ($$invalidate('isCustomShowed', isCustomShowed = true));
        }
        setData(); 
        return ($$invalidate('isCustomShowed', isCustomShowed = false));
      }

      function getResult(e) {
        $$invalidate('bestPath', bestPath = e.detail.result);
      }

      function resetData() {
        $$invalidate('bestPath', bestPath = null);
        $$invalidate('stations', stations = null);
        $$invalidate('schemeSVGData', schemeSVGData = null);
        $$invalidate('isCalculateShowed', isCalculateShowed = false);
      }

      async function onGetUserGraph(e) {
        graphUrl = e.detail.graphUrl;
        stationsUrl = e.detail.stationsUrl;
        setData();
      }

      function getUniqueId(value = '') {
        return `${selectedMetro}-${timeOnStation}-${value}`;
      }

      async function setGraph(url) {
        const graphData = await getData(
          getUniqueId('graphData'),
          () => getGraph(url, timeOnStation)
        );
        $$invalidate('graph', graph = graphData.graph);
        $$invalidate('stationsBetween', stationsBetween = graphData.stationsBetween);
        $$invalidate('dis', dis = graphData.distances);
      }
      async function setStations(url) {
        const stationsData = await getData(
          getUniqueId('stations'),
          () => getStations(url)
        );
        $$invalidate('stations', stations = stationsData);
      }
      async function setScheme(url) {
        const schemeData = await getData(
          getUniqueId('scheme'),
          () => getScheme(url)
        );
        $$invalidate('schemeSVGData', schemeSVGData = schemeData);
      }
      async function setData() {
        if (graphUrl) await setGraph(graphUrl);
        $$invalidate('isCalculateShowed', isCalculateShowed = true);

        if (stationsUrl) await setStations(stationsUrl);
        if (schemeUrl) await setScheme(schemeUrl);
      }

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('graphUrl' in $$props) graphUrl = $$props.graphUrl;
    		if ('stationsUrl' in $$props) stationsUrl = $$props.stationsUrl;
    		if ('schemeUrl' in $$props) schemeUrl = $$props.schemeUrl;
    		if ('selectedMetro' in $$props) selectedMetro = $$props.selectedMetro;
    		if ('timeOnStation' in $$props) timeOnStation = $$props.timeOnStation;
    		if ('metroImage' in $$props) $$invalidate('metroImage', metroImage = $$props.metroImage);
    		if ('schemeSVGData' in $$props) $$invalidate('schemeSVGData', schemeSVGData = $$props.schemeSVGData);
    		if ('bestPath' in $$props) $$invalidate('bestPath', bestPath = $$props.bestPath);
    		if ('stations' in $$props) $$invalidate('stations', stations = $$props.stations);
    		if ('graph' in $$props) $$invalidate('graph', graph = $$props.graph);
    		if ('stationsBetween' in $$props) $$invalidate('stationsBetween', stationsBetween = $$props.stationsBetween);
    		if ('dis' in $$props) $$invalidate('dis', dis = $$props.dis);
    		if ('isCalculateShowed' in $$props) $$invalidate('isCalculateShowed', isCalculateShowed = $$props.isCalculateShowed);
    		if ('isCustomShowed' in $$props) $$invalidate('isCustomShowed', isCustomShowed = $$props.isCustomShowed);
    	};

    	return {
    		metroImage,
    		schemeSVGData,
    		bestPath,
    		stations,
    		graph,
    		stationsBetween,
    		dis,
    		isCalculateShowed,
    		isCustomShowed,
    		onSelectMetro,
    		getResult,
    		onGetUserGraph,
    		getUniqueId
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$a.name });
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
        if(!this.length) return this;
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
