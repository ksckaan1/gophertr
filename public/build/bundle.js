
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
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
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }
    function attribute_to_object(attributes) {
        const result = {};
        for (const attribute of attributes) {
            result[attribute.name] = attribute.value;
        }
        return result;
    }

    const active_docs = new Set();
    let active = 0;
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
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
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
                started = true;
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
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    let SvelteElement;
    if (typeof HTMLElement === 'function') {
        SvelteElement = class extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
            }
            connectedCallback() {
                const { on_mount } = this.$$;
                this.$$.on_disconnect = on_mount.map(run).filter(is_function);
                // @ts-ignore todo: improve typings
                for (const key in this.$$.slotted) {
                    // @ts-ignore todo: improve typings
                    this.appendChild(this.$$.slotted[key]);
                }
            }
            attributeChangedCallback(attr, _oldValue, newValue) {
                this[attr] = newValue;
            }
            disconnectedCallback() {
                run_all(this.$$.on_disconnect);
            }
            $destroy() {
                destroy_component(this, 1);
                this.$destroy = noop;
            }
            $on(type, callback) {
                // TODO should this delegate to addEventListener?
                const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
                callbacks.push(callback);
                return () => {
                    const index = callbacks.indexOf(callback);
                    if (index !== -1)
                        callbacks.splice(index, 1);
                };
            }
            $set($$props) {
                if (this.$$set && !is_empty($$props)) {
                    this.$$.skip_bound = true;
                    this.$$set($$props);
                    this.$$.skip_bound = false;
                }
            }
        };
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
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

    /* src/LoadingGophers.svelte generated by Svelte v3.44.2 */

    const file$a = "src/LoadingGophers.svelte";

    function create_fragment$a(ctx) {
    	let div18;
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;
    	let div17;
    	let div9;
    	let div4;
    	let t3;
    	let div8;
    	let div5;
    	let t4;
    	let div6;
    	let t5;
    	let div7;
    	let t6;
    	let div16;
    	let div10;
    	let t7;
    	let div11;
    	let t8;
    	let div12;
    	let t9;
    	let div13;
    	let t10;
    	let div14;
    	let t11;
    	let div15;
    	let t12;
    	let div37;
    	let div22;
    	let div19;
    	let t13;
    	let div20;
    	let t14;
    	let div21;
    	let t15;
    	let div36;
    	let div28;
    	let div23;
    	let t16;
    	let div27;
    	let div24;
    	let t17;
    	let div25;
    	let t18;
    	let div26;
    	let t19;
    	let div35;
    	let div29;
    	let t20;
    	let div30;
    	let t21;
    	let div31;
    	let t22;
    	let div32;
    	let t23;
    	let div33;
    	let t24;
    	let div34;
    	let t25;
    	let div56;
    	let div41;
    	let div38;
    	let t26;
    	let div39;
    	let t27;
    	let div40;
    	let t28;
    	let div55;
    	let div47;
    	let div42;
    	let t29;
    	let div46;
    	let div43;
    	let t30;
    	let div44;
    	let t31;
    	let div45;
    	let t32;
    	let div54;
    	let div48;
    	let t33;
    	let div49;
    	let t34;
    	let div50;
    	let t35;
    	let div51;
    	let t36;
    	let div52;
    	let t37;
    	let div53;
    	let t38;
    	let div75;
    	let div60;
    	let div57;
    	let t39;
    	let div58;
    	let t40;
    	let div59;
    	let t41;
    	let div74;
    	let div66;
    	let div61;
    	let t42;
    	let div65;
    	let div62;
    	let t43;
    	let div63;
    	let t44;
    	let div64;
    	let t45;
    	let div73;
    	let div67;
    	let t46;
    	let div68;
    	let t47;
    	let div69;
    	let t48;
    	let div70;
    	let t49;
    	let div71;
    	let t50;
    	let div72;
    	let t51;
    	let div94;
    	let div79;
    	let div76;
    	let t52;
    	let div77;
    	let t53;
    	let div78;
    	let t54;
    	let div93;
    	let div85;
    	let div80;
    	let t55;
    	let div84;
    	let div81;
    	let t56;
    	let div82;
    	let t57;
    	let div83;
    	let t58;
    	let div92;
    	let div86;
    	let t59;
    	let div87;
    	let t60;
    	let div88;
    	let t61;
    	let div89;
    	let t62;
    	let div90;
    	let t63;
    	let div91;
    	let t64;
    	let div113;
    	let div98;
    	let div95;
    	let t65;
    	let div96;
    	let t66;
    	let div97;
    	let t67;
    	let div112;
    	let div104;
    	let div99;
    	let t68;
    	let div103;
    	let div100;
    	let t69;
    	let div101;
    	let t70;
    	let div102;
    	let t71;
    	let div111;
    	let div105;
    	let t72;
    	let div106;
    	let t73;
    	let div107;
    	let t74;
    	let div108;
    	let t75;
    	let div109;
    	let t76;
    	let div110;
    	let t77;
    	let div132;
    	let div117;
    	let div114;
    	let t78;
    	let div115;
    	let t79;
    	let div116;
    	let t80;
    	let div131;
    	let div123;
    	let div118;
    	let t81;
    	let div122;
    	let div119;
    	let t82;
    	let div120;
    	let t83;
    	let div121;
    	let t84;
    	let div130;
    	let div124;
    	let t85;
    	let div125;
    	let t86;
    	let div126;
    	let t87;
    	let div127;
    	let t88;
    	let div128;
    	let t89;
    	let div129;
    	let t90;
    	let div151;
    	let div136;
    	let div133;
    	let t91;
    	let div134;
    	let t92;
    	let div135;
    	let t93;
    	let div150;
    	let div142;
    	let div137;
    	let t94;
    	let div141;
    	let div138;
    	let t95;
    	let div139;
    	let t96;
    	let div140;
    	let t97;
    	let div149;
    	let div143;
    	let t98;
    	let div144;
    	let t99;
    	let div145;
    	let t100;
    	let div146;
    	let t101;
    	let div147;
    	let t102;
    	let div148;
    	let t103;
    	let div170;
    	let div155;
    	let div152;
    	let t104;
    	let div153;
    	let t105;
    	let div154;
    	let t106;
    	let div169;
    	let div161;
    	let div156;
    	let t107;
    	let div160;
    	let div157;
    	let t108;
    	let div158;
    	let t109;
    	let div159;
    	let t110;
    	let div168;
    	let div162;
    	let t111;
    	let div163;
    	let t112;
    	let div164;
    	let t113;
    	let div165;
    	let t114;
    	let div166;
    	let t115;
    	let div167;
    	let t116;
    	let div189;
    	let div174;
    	let div171;
    	let t117;
    	let div172;
    	let t118;
    	let div173;
    	let t119;
    	let div188;
    	let div180;
    	let div175;
    	let t120;
    	let div179;
    	let div176;
    	let t121;
    	let div177;
    	let t122;
    	let div178;
    	let t123;
    	let div187;
    	let div181;
    	let t124;
    	let div182;
    	let t125;
    	let div183;
    	let t126;
    	let div184;
    	let t127;
    	let div185;
    	let t128;
    	let div186;
    	let t129;
    	let div208;
    	let div193;
    	let div190;
    	let t130;
    	let div191;
    	let t131;
    	let div192;
    	let t132;
    	let div207;
    	let div199;
    	let div194;
    	let t133;
    	let div198;
    	let div195;
    	let t134;
    	let div196;
    	let t135;
    	let div197;
    	let t136;
    	let div206;
    	let div200;
    	let t137;
    	let div201;
    	let t138;
    	let div202;
    	let t139;
    	let div203;
    	let t140;
    	let div204;
    	let t141;
    	let div205;
    	let t142;
    	let div227;
    	let div212;
    	let div209;
    	let t143;
    	let div210;
    	let t144;
    	let div211;
    	let t145;
    	let div226;
    	let div218;
    	let div213;
    	let t146;
    	let div217;
    	let div214;
    	let t147;
    	let div215;
    	let t148;
    	let div216;
    	let t149;
    	let div225;
    	let div219;
    	let t150;
    	let div220;
    	let t151;
    	let div221;
    	let t152;
    	let div222;
    	let t153;
    	let div223;
    	let t154;
    	let div224;

    	const block = {
    		c: function create() {
    			div18 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			t2 = space();
    			div17 = element("div");
    			div9 = element("div");
    			div4 = element("div");
    			t3 = space();
    			div8 = element("div");
    			div5 = element("div");
    			t4 = space();
    			div6 = element("div");
    			t5 = space();
    			div7 = element("div");
    			t6 = space();
    			div16 = element("div");
    			div10 = element("div");
    			t7 = space();
    			div11 = element("div");
    			t8 = space();
    			div12 = element("div");
    			t9 = space();
    			div13 = element("div");
    			t10 = space();
    			div14 = element("div");
    			t11 = space();
    			div15 = element("div");
    			t12 = space();
    			div37 = element("div");
    			div22 = element("div");
    			div19 = element("div");
    			t13 = space();
    			div20 = element("div");
    			t14 = space();
    			div21 = element("div");
    			t15 = space();
    			div36 = element("div");
    			div28 = element("div");
    			div23 = element("div");
    			t16 = space();
    			div27 = element("div");
    			div24 = element("div");
    			t17 = space();
    			div25 = element("div");
    			t18 = space();
    			div26 = element("div");
    			t19 = space();
    			div35 = element("div");
    			div29 = element("div");
    			t20 = space();
    			div30 = element("div");
    			t21 = space();
    			div31 = element("div");
    			t22 = space();
    			div32 = element("div");
    			t23 = space();
    			div33 = element("div");
    			t24 = space();
    			div34 = element("div");
    			t25 = space();
    			div56 = element("div");
    			div41 = element("div");
    			div38 = element("div");
    			t26 = space();
    			div39 = element("div");
    			t27 = space();
    			div40 = element("div");
    			t28 = space();
    			div55 = element("div");
    			div47 = element("div");
    			div42 = element("div");
    			t29 = space();
    			div46 = element("div");
    			div43 = element("div");
    			t30 = space();
    			div44 = element("div");
    			t31 = space();
    			div45 = element("div");
    			t32 = space();
    			div54 = element("div");
    			div48 = element("div");
    			t33 = space();
    			div49 = element("div");
    			t34 = space();
    			div50 = element("div");
    			t35 = space();
    			div51 = element("div");
    			t36 = space();
    			div52 = element("div");
    			t37 = space();
    			div53 = element("div");
    			t38 = space();
    			div75 = element("div");
    			div60 = element("div");
    			div57 = element("div");
    			t39 = space();
    			div58 = element("div");
    			t40 = space();
    			div59 = element("div");
    			t41 = space();
    			div74 = element("div");
    			div66 = element("div");
    			div61 = element("div");
    			t42 = space();
    			div65 = element("div");
    			div62 = element("div");
    			t43 = space();
    			div63 = element("div");
    			t44 = space();
    			div64 = element("div");
    			t45 = space();
    			div73 = element("div");
    			div67 = element("div");
    			t46 = space();
    			div68 = element("div");
    			t47 = space();
    			div69 = element("div");
    			t48 = space();
    			div70 = element("div");
    			t49 = space();
    			div71 = element("div");
    			t50 = space();
    			div72 = element("div");
    			t51 = space();
    			div94 = element("div");
    			div79 = element("div");
    			div76 = element("div");
    			t52 = space();
    			div77 = element("div");
    			t53 = space();
    			div78 = element("div");
    			t54 = space();
    			div93 = element("div");
    			div85 = element("div");
    			div80 = element("div");
    			t55 = space();
    			div84 = element("div");
    			div81 = element("div");
    			t56 = space();
    			div82 = element("div");
    			t57 = space();
    			div83 = element("div");
    			t58 = space();
    			div92 = element("div");
    			div86 = element("div");
    			t59 = space();
    			div87 = element("div");
    			t60 = space();
    			div88 = element("div");
    			t61 = space();
    			div89 = element("div");
    			t62 = space();
    			div90 = element("div");
    			t63 = space();
    			div91 = element("div");
    			t64 = space();
    			div113 = element("div");
    			div98 = element("div");
    			div95 = element("div");
    			t65 = space();
    			div96 = element("div");
    			t66 = space();
    			div97 = element("div");
    			t67 = space();
    			div112 = element("div");
    			div104 = element("div");
    			div99 = element("div");
    			t68 = space();
    			div103 = element("div");
    			div100 = element("div");
    			t69 = space();
    			div101 = element("div");
    			t70 = space();
    			div102 = element("div");
    			t71 = space();
    			div111 = element("div");
    			div105 = element("div");
    			t72 = space();
    			div106 = element("div");
    			t73 = space();
    			div107 = element("div");
    			t74 = space();
    			div108 = element("div");
    			t75 = space();
    			div109 = element("div");
    			t76 = space();
    			div110 = element("div");
    			t77 = space();
    			div132 = element("div");
    			div117 = element("div");
    			div114 = element("div");
    			t78 = space();
    			div115 = element("div");
    			t79 = space();
    			div116 = element("div");
    			t80 = space();
    			div131 = element("div");
    			div123 = element("div");
    			div118 = element("div");
    			t81 = space();
    			div122 = element("div");
    			div119 = element("div");
    			t82 = space();
    			div120 = element("div");
    			t83 = space();
    			div121 = element("div");
    			t84 = space();
    			div130 = element("div");
    			div124 = element("div");
    			t85 = space();
    			div125 = element("div");
    			t86 = space();
    			div126 = element("div");
    			t87 = space();
    			div127 = element("div");
    			t88 = space();
    			div128 = element("div");
    			t89 = space();
    			div129 = element("div");
    			t90 = space();
    			div151 = element("div");
    			div136 = element("div");
    			div133 = element("div");
    			t91 = space();
    			div134 = element("div");
    			t92 = space();
    			div135 = element("div");
    			t93 = space();
    			div150 = element("div");
    			div142 = element("div");
    			div137 = element("div");
    			t94 = space();
    			div141 = element("div");
    			div138 = element("div");
    			t95 = space();
    			div139 = element("div");
    			t96 = space();
    			div140 = element("div");
    			t97 = space();
    			div149 = element("div");
    			div143 = element("div");
    			t98 = space();
    			div144 = element("div");
    			t99 = space();
    			div145 = element("div");
    			t100 = space();
    			div146 = element("div");
    			t101 = space();
    			div147 = element("div");
    			t102 = space();
    			div148 = element("div");
    			t103 = space();
    			div170 = element("div");
    			div155 = element("div");
    			div152 = element("div");
    			t104 = space();
    			div153 = element("div");
    			t105 = space();
    			div154 = element("div");
    			t106 = space();
    			div169 = element("div");
    			div161 = element("div");
    			div156 = element("div");
    			t107 = space();
    			div160 = element("div");
    			div157 = element("div");
    			t108 = space();
    			div158 = element("div");
    			t109 = space();
    			div159 = element("div");
    			t110 = space();
    			div168 = element("div");
    			div162 = element("div");
    			t111 = space();
    			div163 = element("div");
    			t112 = space();
    			div164 = element("div");
    			t113 = space();
    			div165 = element("div");
    			t114 = space();
    			div166 = element("div");
    			t115 = space();
    			div167 = element("div");
    			t116 = space();
    			div189 = element("div");
    			div174 = element("div");
    			div171 = element("div");
    			t117 = space();
    			div172 = element("div");
    			t118 = space();
    			div173 = element("div");
    			t119 = space();
    			div188 = element("div");
    			div180 = element("div");
    			div175 = element("div");
    			t120 = space();
    			div179 = element("div");
    			div176 = element("div");
    			t121 = space();
    			div177 = element("div");
    			t122 = space();
    			div178 = element("div");
    			t123 = space();
    			div187 = element("div");
    			div181 = element("div");
    			t124 = space();
    			div182 = element("div");
    			t125 = space();
    			div183 = element("div");
    			t126 = space();
    			div184 = element("div");
    			t127 = space();
    			div185 = element("div");
    			t128 = space();
    			div186 = element("div");
    			t129 = space();
    			div208 = element("div");
    			div193 = element("div");
    			div190 = element("div");
    			t130 = space();
    			div191 = element("div");
    			t131 = space();
    			div192 = element("div");
    			t132 = space();
    			div207 = element("div");
    			div199 = element("div");
    			div194 = element("div");
    			t133 = space();
    			div198 = element("div");
    			div195 = element("div");
    			t134 = space();
    			div196 = element("div");
    			t135 = space();
    			div197 = element("div");
    			t136 = space();
    			div206 = element("div");
    			div200 = element("div");
    			t137 = space();
    			div201 = element("div");
    			t138 = space();
    			div202 = element("div");
    			t139 = space();
    			div203 = element("div");
    			t140 = space();
    			div204 = element("div");
    			t141 = space();
    			div205 = element("div");
    			t142 = space();
    			div227 = element("div");
    			div212 = element("div");
    			div209 = element("div");
    			t143 = space();
    			div210 = element("div");
    			t144 = space();
    			div211 = element("div");
    			t145 = space();
    			div226 = element("div");
    			div218 = element("div");
    			div213 = element("div");
    			t146 = space();
    			div217 = element("div");
    			div214 = element("div");
    			t147 = space();
    			div215 = element("div");
    			t148 = space();
    			div216 = element("div");
    			t149 = space();
    			div225 = element("div");
    			div219 = element("div");
    			t150 = space();
    			div220 = element("div");
    			t151 = space();
    			div221 = element("div");
    			t152 = space();
    			div222 = element("div");
    			t153 = space();
    			div223 = element("div");
    			t154 = space();
    			div224 = element("div");
    			this.c = noop;
    			attr_dev(div0, "class", "companySide");
    			add_location(div0, file$a, 5, 8, 123);
    			attr_dev(div1, "class", "avatar");
    			add_location(div1, file$a, 6, 8, 159);
    			attr_dev(div2, "class", "jobStatusSide");
    			add_location(div2, file$a, 7, 8, 190);
    			attr_dev(div3, "class", "leftSide");
    			add_location(div3, file$a, 4, 4, 92);
    			attr_dev(div4, "class", "name");
    			add_location(div4, file$a, 11, 12, 301);
    			attr_dev(div5, "class", "line");
    			add_location(div5, file$a, 13, 16, 376);
    			attr_dev(div6, "class", "line");
    			add_location(div6, file$a, 14, 16, 413);
    			attr_dev(div7, "class", "line");
    			add_location(div7, file$a, 15, 16, 450);
    			attr_dev(div8, "class", "description");
    			add_location(div8, file$a, 12, 12, 334);
    			attr_dev(div9, "class", "topSide");
    			add_location(div9, file$a, 10, 8, 267);
    			attr_dev(div10, "class", "socialIcon");
    			add_location(div10, file$a, 19, 12, 551);
    			attr_dev(div11, "class", "socialIcon");
    			add_location(div11, file$a, 20, 12, 590);
    			attr_dev(div12, "class", "socialIcon");
    			add_location(div12, file$a, 21, 12, 629);
    			attr_dev(div13, "class", "socialIcon");
    			add_location(div13, file$a, 22, 12, 668);
    			attr_dev(div14, "class", "socialIcon");
    			add_location(div14, file$a, 23, 12, 707);
    			attr_dev(div15, "class", "socialIcon");
    			add_location(div15, file$a, 24, 12, 746);
    			attr_dev(div16, "class", "socialLinks");
    			add_location(div16, file$a, 18, 8, 513);
    			attr_dev(div17, "class", "rightSide");
    			add_location(div17, file$a, 9, 4, 235);
    			attr_dev(div18, "class", "loadingGopher");
    			add_location(div18, file$a, 3, 0, 60);
    			attr_dev(div19, "class", "companySide");
    			add_location(div19, file$a, 30, 8, 869);
    			attr_dev(div20, "class", "avatar");
    			add_location(div20, file$a, 31, 8, 905);
    			attr_dev(div21, "class", "jobStatusSide");
    			add_location(div21, file$a, 32, 8, 936);
    			attr_dev(div22, "class", "leftSide");
    			add_location(div22, file$a, 29, 4, 838);
    			attr_dev(div23, "class", "name");
    			add_location(div23, file$a, 36, 12, 1047);
    			attr_dev(div24, "class", "line");
    			add_location(div24, file$a, 38, 16, 1122);
    			attr_dev(div25, "class", "line");
    			add_location(div25, file$a, 39, 16, 1159);
    			attr_dev(div26, "class", "line");
    			add_location(div26, file$a, 40, 16, 1196);
    			attr_dev(div27, "class", "description");
    			add_location(div27, file$a, 37, 12, 1080);
    			attr_dev(div28, "class", "topSide");
    			add_location(div28, file$a, 35, 8, 1013);
    			attr_dev(div29, "class", "socialIcon");
    			add_location(div29, file$a, 44, 12, 1297);
    			attr_dev(div30, "class", "socialIcon");
    			add_location(div30, file$a, 45, 12, 1336);
    			attr_dev(div31, "class", "socialIcon");
    			add_location(div31, file$a, 46, 12, 1375);
    			attr_dev(div32, "class", "socialIcon");
    			add_location(div32, file$a, 47, 12, 1414);
    			attr_dev(div33, "class", "socialIcon");
    			add_location(div33, file$a, 48, 12, 1453);
    			attr_dev(div34, "class", "socialIcon");
    			add_location(div34, file$a, 49, 12, 1492);
    			attr_dev(div35, "class", "socialLinks");
    			add_location(div35, file$a, 43, 8, 1259);
    			attr_dev(div36, "class", "rightSide");
    			add_location(div36, file$a, 34, 4, 981);
    			attr_dev(div37, "class", "loadingGopher");
    			add_location(div37, file$a, 28, 0, 806);
    			attr_dev(div38, "class", "companySide");
    			add_location(div38, file$a, 55, 8, 1615);
    			attr_dev(div39, "class", "avatar");
    			add_location(div39, file$a, 56, 8, 1651);
    			attr_dev(div40, "class", "jobStatusSide");
    			add_location(div40, file$a, 57, 8, 1682);
    			attr_dev(div41, "class", "leftSide");
    			add_location(div41, file$a, 54, 4, 1584);
    			attr_dev(div42, "class", "name");
    			add_location(div42, file$a, 61, 12, 1793);
    			attr_dev(div43, "class", "line");
    			add_location(div43, file$a, 63, 16, 1868);
    			attr_dev(div44, "class", "line");
    			add_location(div44, file$a, 64, 16, 1905);
    			attr_dev(div45, "class", "line");
    			add_location(div45, file$a, 65, 16, 1942);
    			attr_dev(div46, "class", "description");
    			add_location(div46, file$a, 62, 12, 1826);
    			attr_dev(div47, "class", "topSide");
    			add_location(div47, file$a, 60, 8, 1759);
    			attr_dev(div48, "class", "socialIcon");
    			add_location(div48, file$a, 69, 12, 2043);
    			attr_dev(div49, "class", "socialIcon");
    			add_location(div49, file$a, 70, 12, 2082);
    			attr_dev(div50, "class", "socialIcon");
    			add_location(div50, file$a, 71, 12, 2121);
    			attr_dev(div51, "class", "socialIcon");
    			add_location(div51, file$a, 72, 12, 2160);
    			attr_dev(div52, "class", "socialIcon");
    			add_location(div52, file$a, 73, 12, 2199);
    			attr_dev(div53, "class", "socialIcon");
    			add_location(div53, file$a, 74, 12, 2238);
    			attr_dev(div54, "class", "socialLinks");
    			add_location(div54, file$a, 68, 8, 2005);
    			attr_dev(div55, "class", "rightSide");
    			add_location(div55, file$a, 59, 4, 1727);
    			attr_dev(div56, "class", "loadingGopher");
    			add_location(div56, file$a, 53, 0, 1552);
    			attr_dev(div57, "class", "companySide");
    			add_location(div57, file$a, 80, 8, 2361);
    			attr_dev(div58, "class", "avatar");
    			add_location(div58, file$a, 81, 8, 2397);
    			attr_dev(div59, "class", "jobStatusSide");
    			add_location(div59, file$a, 82, 8, 2428);
    			attr_dev(div60, "class", "leftSide");
    			add_location(div60, file$a, 79, 4, 2330);
    			attr_dev(div61, "class", "name");
    			add_location(div61, file$a, 86, 12, 2539);
    			attr_dev(div62, "class", "line");
    			add_location(div62, file$a, 88, 16, 2614);
    			attr_dev(div63, "class", "line");
    			add_location(div63, file$a, 89, 16, 2651);
    			attr_dev(div64, "class", "line");
    			add_location(div64, file$a, 90, 16, 2688);
    			attr_dev(div65, "class", "description");
    			add_location(div65, file$a, 87, 12, 2572);
    			attr_dev(div66, "class", "topSide");
    			add_location(div66, file$a, 85, 8, 2505);
    			attr_dev(div67, "class", "socialIcon");
    			add_location(div67, file$a, 94, 12, 2789);
    			attr_dev(div68, "class", "socialIcon");
    			add_location(div68, file$a, 95, 12, 2828);
    			attr_dev(div69, "class", "socialIcon");
    			add_location(div69, file$a, 96, 12, 2867);
    			attr_dev(div70, "class", "socialIcon");
    			add_location(div70, file$a, 97, 12, 2906);
    			attr_dev(div71, "class", "socialIcon");
    			add_location(div71, file$a, 98, 12, 2945);
    			attr_dev(div72, "class", "socialIcon");
    			add_location(div72, file$a, 99, 12, 2984);
    			attr_dev(div73, "class", "socialLinks");
    			add_location(div73, file$a, 93, 8, 2751);
    			attr_dev(div74, "class", "rightSide");
    			add_location(div74, file$a, 84, 4, 2473);
    			attr_dev(div75, "class", "loadingGopher");
    			add_location(div75, file$a, 78, 0, 2298);
    			attr_dev(div76, "class", "companySide");
    			add_location(div76, file$a, 105, 8, 3107);
    			attr_dev(div77, "class", "avatar");
    			add_location(div77, file$a, 106, 8, 3143);
    			attr_dev(div78, "class", "jobStatusSide");
    			add_location(div78, file$a, 107, 8, 3174);
    			attr_dev(div79, "class", "leftSide");
    			add_location(div79, file$a, 104, 4, 3076);
    			attr_dev(div80, "class", "name");
    			add_location(div80, file$a, 111, 12, 3285);
    			attr_dev(div81, "class", "line");
    			add_location(div81, file$a, 113, 16, 3360);
    			attr_dev(div82, "class", "line");
    			add_location(div82, file$a, 114, 16, 3397);
    			attr_dev(div83, "class", "line");
    			add_location(div83, file$a, 115, 16, 3434);
    			attr_dev(div84, "class", "description");
    			add_location(div84, file$a, 112, 12, 3318);
    			attr_dev(div85, "class", "topSide");
    			add_location(div85, file$a, 110, 8, 3251);
    			attr_dev(div86, "class", "socialIcon");
    			add_location(div86, file$a, 119, 12, 3535);
    			attr_dev(div87, "class", "socialIcon");
    			add_location(div87, file$a, 120, 12, 3574);
    			attr_dev(div88, "class", "socialIcon");
    			add_location(div88, file$a, 121, 12, 3613);
    			attr_dev(div89, "class", "socialIcon");
    			add_location(div89, file$a, 122, 12, 3652);
    			attr_dev(div90, "class", "socialIcon");
    			add_location(div90, file$a, 123, 12, 3691);
    			attr_dev(div91, "class", "socialIcon");
    			add_location(div91, file$a, 124, 12, 3730);
    			attr_dev(div92, "class", "socialLinks");
    			add_location(div92, file$a, 118, 8, 3497);
    			attr_dev(div93, "class", "rightSide");
    			add_location(div93, file$a, 109, 4, 3219);
    			attr_dev(div94, "class", "loadingGopher");
    			add_location(div94, file$a, 103, 0, 3044);
    			attr_dev(div95, "class", "companySide");
    			add_location(div95, file$a, 130, 8, 3853);
    			attr_dev(div96, "class", "avatar");
    			add_location(div96, file$a, 131, 8, 3889);
    			attr_dev(div97, "class", "jobStatusSide");
    			add_location(div97, file$a, 132, 8, 3920);
    			attr_dev(div98, "class", "leftSide");
    			add_location(div98, file$a, 129, 4, 3822);
    			attr_dev(div99, "class", "name");
    			add_location(div99, file$a, 136, 12, 4031);
    			attr_dev(div100, "class", "line");
    			add_location(div100, file$a, 138, 16, 4106);
    			attr_dev(div101, "class", "line");
    			add_location(div101, file$a, 139, 16, 4143);
    			attr_dev(div102, "class", "line");
    			add_location(div102, file$a, 140, 16, 4180);
    			attr_dev(div103, "class", "description");
    			add_location(div103, file$a, 137, 12, 4064);
    			attr_dev(div104, "class", "topSide");
    			add_location(div104, file$a, 135, 8, 3997);
    			attr_dev(div105, "class", "socialIcon");
    			add_location(div105, file$a, 144, 12, 4281);
    			attr_dev(div106, "class", "socialIcon");
    			add_location(div106, file$a, 145, 12, 4320);
    			attr_dev(div107, "class", "socialIcon");
    			add_location(div107, file$a, 146, 12, 4359);
    			attr_dev(div108, "class", "socialIcon");
    			add_location(div108, file$a, 147, 12, 4398);
    			attr_dev(div109, "class", "socialIcon");
    			add_location(div109, file$a, 148, 12, 4437);
    			attr_dev(div110, "class", "socialIcon");
    			add_location(div110, file$a, 149, 12, 4476);
    			attr_dev(div111, "class", "socialLinks");
    			add_location(div111, file$a, 143, 8, 4243);
    			attr_dev(div112, "class", "rightSide");
    			add_location(div112, file$a, 134, 4, 3965);
    			attr_dev(div113, "class", "loadingGopher");
    			add_location(div113, file$a, 128, 0, 3790);
    			attr_dev(div114, "class", "companySide");
    			add_location(div114, file$a, 155, 8, 4599);
    			attr_dev(div115, "class", "avatar");
    			add_location(div115, file$a, 156, 8, 4635);
    			attr_dev(div116, "class", "jobStatusSide");
    			add_location(div116, file$a, 157, 8, 4666);
    			attr_dev(div117, "class", "leftSide");
    			add_location(div117, file$a, 154, 4, 4568);
    			attr_dev(div118, "class", "name");
    			add_location(div118, file$a, 161, 12, 4777);
    			attr_dev(div119, "class", "line");
    			add_location(div119, file$a, 163, 16, 4852);
    			attr_dev(div120, "class", "line");
    			add_location(div120, file$a, 164, 16, 4889);
    			attr_dev(div121, "class", "line");
    			add_location(div121, file$a, 165, 16, 4926);
    			attr_dev(div122, "class", "description");
    			add_location(div122, file$a, 162, 12, 4810);
    			attr_dev(div123, "class", "topSide");
    			add_location(div123, file$a, 160, 8, 4743);
    			attr_dev(div124, "class", "socialIcon");
    			add_location(div124, file$a, 169, 12, 5027);
    			attr_dev(div125, "class", "socialIcon");
    			add_location(div125, file$a, 170, 12, 5066);
    			attr_dev(div126, "class", "socialIcon");
    			add_location(div126, file$a, 171, 12, 5105);
    			attr_dev(div127, "class", "socialIcon");
    			add_location(div127, file$a, 172, 12, 5144);
    			attr_dev(div128, "class", "socialIcon");
    			add_location(div128, file$a, 173, 12, 5183);
    			attr_dev(div129, "class", "socialIcon");
    			add_location(div129, file$a, 174, 12, 5222);
    			attr_dev(div130, "class", "socialLinks");
    			add_location(div130, file$a, 168, 8, 4989);
    			attr_dev(div131, "class", "rightSide");
    			add_location(div131, file$a, 159, 4, 4711);
    			attr_dev(div132, "class", "loadingGopher");
    			add_location(div132, file$a, 153, 0, 4536);
    			attr_dev(div133, "class", "companySide");
    			add_location(div133, file$a, 180, 8, 5345);
    			attr_dev(div134, "class", "avatar");
    			add_location(div134, file$a, 181, 8, 5381);
    			attr_dev(div135, "class", "jobStatusSide");
    			add_location(div135, file$a, 182, 8, 5412);
    			attr_dev(div136, "class", "leftSide");
    			add_location(div136, file$a, 179, 4, 5314);
    			attr_dev(div137, "class", "name");
    			add_location(div137, file$a, 186, 12, 5523);
    			attr_dev(div138, "class", "line");
    			add_location(div138, file$a, 188, 16, 5598);
    			attr_dev(div139, "class", "line");
    			add_location(div139, file$a, 189, 16, 5635);
    			attr_dev(div140, "class", "line");
    			add_location(div140, file$a, 190, 16, 5672);
    			attr_dev(div141, "class", "description");
    			add_location(div141, file$a, 187, 12, 5556);
    			attr_dev(div142, "class", "topSide");
    			add_location(div142, file$a, 185, 8, 5489);
    			attr_dev(div143, "class", "socialIcon");
    			add_location(div143, file$a, 194, 12, 5773);
    			attr_dev(div144, "class", "socialIcon");
    			add_location(div144, file$a, 195, 12, 5812);
    			attr_dev(div145, "class", "socialIcon");
    			add_location(div145, file$a, 196, 12, 5851);
    			attr_dev(div146, "class", "socialIcon");
    			add_location(div146, file$a, 197, 12, 5890);
    			attr_dev(div147, "class", "socialIcon");
    			add_location(div147, file$a, 198, 12, 5929);
    			attr_dev(div148, "class", "socialIcon");
    			add_location(div148, file$a, 199, 12, 5968);
    			attr_dev(div149, "class", "socialLinks");
    			add_location(div149, file$a, 193, 8, 5735);
    			attr_dev(div150, "class", "rightSide");
    			add_location(div150, file$a, 184, 4, 5457);
    			attr_dev(div151, "class", "loadingGopher");
    			add_location(div151, file$a, 178, 0, 5282);
    			attr_dev(div152, "class", "companySide");
    			add_location(div152, file$a, 205, 8, 6091);
    			attr_dev(div153, "class", "avatar");
    			add_location(div153, file$a, 206, 8, 6127);
    			attr_dev(div154, "class", "jobStatusSide");
    			add_location(div154, file$a, 207, 8, 6158);
    			attr_dev(div155, "class", "leftSide");
    			add_location(div155, file$a, 204, 4, 6060);
    			attr_dev(div156, "class", "name");
    			add_location(div156, file$a, 211, 12, 6269);
    			attr_dev(div157, "class", "line");
    			add_location(div157, file$a, 213, 16, 6344);
    			attr_dev(div158, "class", "line");
    			add_location(div158, file$a, 214, 16, 6381);
    			attr_dev(div159, "class", "line");
    			add_location(div159, file$a, 215, 16, 6418);
    			attr_dev(div160, "class", "description");
    			add_location(div160, file$a, 212, 12, 6302);
    			attr_dev(div161, "class", "topSide");
    			add_location(div161, file$a, 210, 8, 6235);
    			attr_dev(div162, "class", "socialIcon");
    			add_location(div162, file$a, 219, 12, 6519);
    			attr_dev(div163, "class", "socialIcon");
    			add_location(div163, file$a, 220, 12, 6558);
    			attr_dev(div164, "class", "socialIcon");
    			add_location(div164, file$a, 221, 12, 6597);
    			attr_dev(div165, "class", "socialIcon");
    			add_location(div165, file$a, 222, 12, 6636);
    			attr_dev(div166, "class", "socialIcon");
    			add_location(div166, file$a, 223, 12, 6675);
    			attr_dev(div167, "class", "socialIcon");
    			add_location(div167, file$a, 224, 12, 6714);
    			attr_dev(div168, "class", "socialLinks");
    			add_location(div168, file$a, 218, 8, 6481);
    			attr_dev(div169, "class", "rightSide");
    			add_location(div169, file$a, 209, 4, 6203);
    			attr_dev(div170, "class", "loadingGopher");
    			add_location(div170, file$a, 203, 0, 6028);
    			attr_dev(div171, "class", "companySide");
    			add_location(div171, file$a, 230, 8, 6837);
    			attr_dev(div172, "class", "avatar");
    			add_location(div172, file$a, 231, 8, 6873);
    			attr_dev(div173, "class", "jobStatusSide");
    			add_location(div173, file$a, 232, 8, 6904);
    			attr_dev(div174, "class", "leftSide");
    			add_location(div174, file$a, 229, 4, 6806);
    			attr_dev(div175, "class", "name");
    			add_location(div175, file$a, 236, 12, 7015);
    			attr_dev(div176, "class", "line");
    			add_location(div176, file$a, 238, 16, 7090);
    			attr_dev(div177, "class", "line");
    			add_location(div177, file$a, 239, 16, 7127);
    			attr_dev(div178, "class", "line");
    			add_location(div178, file$a, 240, 16, 7164);
    			attr_dev(div179, "class", "description");
    			add_location(div179, file$a, 237, 12, 7048);
    			attr_dev(div180, "class", "topSide");
    			add_location(div180, file$a, 235, 8, 6981);
    			attr_dev(div181, "class", "socialIcon");
    			add_location(div181, file$a, 244, 12, 7265);
    			attr_dev(div182, "class", "socialIcon");
    			add_location(div182, file$a, 245, 12, 7304);
    			attr_dev(div183, "class", "socialIcon");
    			add_location(div183, file$a, 246, 12, 7343);
    			attr_dev(div184, "class", "socialIcon");
    			add_location(div184, file$a, 247, 12, 7382);
    			attr_dev(div185, "class", "socialIcon");
    			add_location(div185, file$a, 248, 12, 7421);
    			attr_dev(div186, "class", "socialIcon");
    			add_location(div186, file$a, 249, 12, 7460);
    			attr_dev(div187, "class", "socialLinks");
    			add_location(div187, file$a, 243, 8, 7227);
    			attr_dev(div188, "class", "rightSide");
    			add_location(div188, file$a, 234, 4, 6949);
    			attr_dev(div189, "class", "loadingGopher");
    			add_location(div189, file$a, 228, 0, 6774);
    			attr_dev(div190, "class", "companySide");
    			add_location(div190, file$a, 255, 8, 7583);
    			attr_dev(div191, "class", "avatar");
    			add_location(div191, file$a, 256, 8, 7619);
    			attr_dev(div192, "class", "jobStatusSide");
    			add_location(div192, file$a, 257, 8, 7650);
    			attr_dev(div193, "class", "leftSide");
    			add_location(div193, file$a, 254, 4, 7552);
    			attr_dev(div194, "class", "name");
    			add_location(div194, file$a, 261, 12, 7761);
    			attr_dev(div195, "class", "line");
    			add_location(div195, file$a, 263, 16, 7836);
    			attr_dev(div196, "class", "line");
    			add_location(div196, file$a, 264, 16, 7873);
    			attr_dev(div197, "class", "line");
    			add_location(div197, file$a, 265, 16, 7910);
    			attr_dev(div198, "class", "description");
    			add_location(div198, file$a, 262, 12, 7794);
    			attr_dev(div199, "class", "topSide");
    			add_location(div199, file$a, 260, 8, 7727);
    			attr_dev(div200, "class", "socialIcon");
    			add_location(div200, file$a, 269, 12, 8011);
    			attr_dev(div201, "class", "socialIcon");
    			add_location(div201, file$a, 270, 12, 8050);
    			attr_dev(div202, "class", "socialIcon");
    			add_location(div202, file$a, 271, 12, 8089);
    			attr_dev(div203, "class", "socialIcon");
    			add_location(div203, file$a, 272, 12, 8128);
    			attr_dev(div204, "class", "socialIcon");
    			add_location(div204, file$a, 273, 12, 8167);
    			attr_dev(div205, "class", "socialIcon");
    			add_location(div205, file$a, 274, 12, 8206);
    			attr_dev(div206, "class", "socialLinks");
    			add_location(div206, file$a, 268, 8, 7973);
    			attr_dev(div207, "class", "rightSide");
    			add_location(div207, file$a, 259, 4, 7695);
    			attr_dev(div208, "class", "loadingGopher");
    			add_location(div208, file$a, 253, 0, 7520);
    			attr_dev(div209, "class", "companySide");
    			add_location(div209, file$a, 280, 8, 8329);
    			attr_dev(div210, "class", "avatar");
    			add_location(div210, file$a, 281, 8, 8365);
    			attr_dev(div211, "class", "jobStatusSide");
    			add_location(div211, file$a, 282, 8, 8396);
    			attr_dev(div212, "class", "leftSide");
    			add_location(div212, file$a, 279, 4, 8298);
    			attr_dev(div213, "class", "name");
    			add_location(div213, file$a, 286, 12, 8507);
    			attr_dev(div214, "class", "line");
    			add_location(div214, file$a, 288, 16, 8582);
    			attr_dev(div215, "class", "line");
    			add_location(div215, file$a, 289, 16, 8619);
    			attr_dev(div216, "class", "line");
    			add_location(div216, file$a, 290, 16, 8656);
    			attr_dev(div217, "class", "description");
    			add_location(div217, file$a, 287, 12, 8540);
    			attr_dev(div218, "class", "topSide");
    			add_location(div218, file$a, 285, 8, 8473);
    			attr_dev(div219, "class", "socialIcon");
    			add_location(div219, file$a, 294, 12, 8757);
    			attr_dev(div220, "class", "socialIcon");
    			add_location(div220, file$a, 295, 12, 8796);
    			attr_dev(div221, "class", "socialIcon");
    			add_location(div221, file$a, 296, 12, 8835);
    			attr_dev(div222, "class", "socialIcon");
    			add_location(div222, file$a, 297, 12, 8874);
    			attr_dev(div223, "class", "socialIcon");
    			add_location(div223, file$a, 298, 12, 8913);
    			attr_dev(div224, "class", "socialIcon");
    			add_location(div224, file$a, 299, 12, 8952);
    			attr_dev(div225, "class", "socialLinks");
    			add_location(div225, file$a, 293, 8, 8719);
    			attr_dev(div226, "class", "rightSide");
    			add_location(div226, file$a, 284, 4, 8441);
    			attr_dev(div227, "class", "loadingGopher");
    			add_location(div227, file$a, 278, 0, 8266);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div18, anchor);
    			append_dev(div18, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div18, t2);
    			append_dev(div18, div17);
    			append_dev(div17, div9);
    			append_dev(div9, div4);
    			append_dev(div9, t3);
    			append_dev(div9, div8);
    			append_dev(div8, div5);
    			append_dev(div8, t4);
    			append_dev(div8, div6);
    			append_dev(div8, t5);
    			append_dev(div8, div7);
    			append_dev(div17, t6);
    			append_dev(div17, div16);
    			append_dev(div16, div10);
    			append_dev(div16, t7);
    			append_dev(div16, div11);
    			append_dev(div16, t8);
    			append_dev(div16, div12);
    			append_dev(div16, t9);
    			append_dev(div16, div13);
    			append_dev(div16, t10);
    			append_dev(div16, div14);
    			append_dev(div16, t11);
    			append_dev(div16, div15);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div37, anchor);
    			append_dev(div37, div22);
    			append_dev(div22, div19);
    			append_dev(div22, t13);
    			append_dev(div22, div20);
    			append_dev(div22, t14);
    			append_dev(div22, div21);
    			append_dev(div37, t15);
    			append_dev(div37, div36);
    			append_dev(div36, div28);
    			append_dev(div28, div23);
    			append_dev(div28, t16);
    			append_dev(div28, div27);
    			append_dev(div27, div24);
    			append_dev(div27, t17);
    			append_dev(div27, div25);
    			append_dev(div27, t18);
    			append_dev(div27, div26);
    			append_dev(div36, t19);
    			append_dev(div36, div35);
    			append_dev(div35, div29);
    			append_dev(div35, t20);
    			append_dev(div35, div30);
    			append_dev(div35, t21);
    			append_dev(div35, div31);
    			append_dev(div35, t22);
    			append_dev(div35, div32);
    			append_dev(div35, t23);
    			append_dev(div35, div33);
    			append_dev(div35, t24);
    			append_dev(div35, div34);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, div56, anchor);
    			append_dev(div56, div41);
    			append_dev(div41, div38);
    			append_dev(div41, t26);
    			append_dev(div41, div39);
    			append_dev(div41, t27);
    			append_dev(div41, div40);
    			append_dev(div56, t28);
    			append_dev(div56, div55);
    			append_dev(div55, div47);
    			append_dev(div47, div42);
    			append_dev(div47, t29);
    			append_dev(div47, div46);
    			append_dev(div46, div43);
    			append_dev(div46, t30);
    			append_dev(div46, div44);
    			append_dev(div46, t31);
    			append_dev(div46, div45);
    			append_dev(div55, t32);
    			append_dev(div55, div54);
    			append_dev(div54, div48);
    			append_dev(div54, t33);
    			append_dev(div54, div49);
    			append_dev(div54, t34);
    			append_dev(div54, div50);
    			append_dev(div54, t35);
    			append_dev(div54, div51);
    			append_dev(div54, t36);
    			append_dev(div54, div52);
    			append_dev(div54, t37);
    			append_dev(div54, div53);
    			insert_dev(target, t38, anchor);
    			insert_dev(target, div75, anchor);
    			append_dev(div75, div60);
    			append_dev(div60, div57);
    			append_dev(div60, t39);
    			append_dev(div60, div58);
    			append_dev(div60, t40);
    			append_dev(div60, div59);
    			append_dev(div75, t41);
    			append_dev(div75, div74);
    			append_dev(div74, div66);
    			append_dev(div66, div61);
    			append_dev(div66, t42);
    			append_dev(div66, div65);
    			append_dev(div65, div62);
    			append_dev(div65, t43);
    			append_dev(div65, div63);
    			append_dev(div65, t44);
    			append_dev(div65, div64);
    			append_dev(div74, t45);
    			append_dev(div74, div73);
    			append_dev(div73, div67);
    			append_dev(div73, t46);
    			append_dev(div73, div68);
    			append_dev(div73, t47);
    			append_dev(div73, div69);
    			append_dev(div73, t48);
    			append_dev(div73, div70);
    			append_dev(div73, t49);
    			append_dev(div73, div71);
    			append_dev(div73, t50);
    			append_dev(div73, div72);
    			insert_dev(target, t51, anchor);
    			insert_dev(target, div94, anchor);
    			append_dev(div94, div79);
    			append_dev(div79, div76);
    			append_dev(div79, t52);
    			append_dev(div79, div77);
    			append_dev(div79, t53);
    			append_dev(div79, div78);
    			append_dev(div94, t54);
    			append_dev(div94, div93);
    			append_dev(div93, div85);
    			append_dev(div85, div80);
    			append_dev(div85, t55);
    			append_dev(div85, div84);
    			append_dev(div84, div81);
    			append_dev(div84, t56);
    			append_dev(div84, div82);
    			append_dev(div84, t57);
    			append_dev(div84, div83);
    			append_dev(div93, t58);
    			append_dev(div93, div92);
    			append_dev(div92, div86);
    			append_dev(div92, t59);
    			append_dev(div92, div87);
    			append_dev(div92, t60);
    			append_dev(div92, div88);
    			append_dev(div92, t61);
    			append_dev(div92, div89);
    			append_dev(div92, t62);
    			append_dev(div92, div90);
    			append_dev(div92, t63);
    			append_dev(div92, div91);
    			insert_dev(target, t64, anchor);
    			insert_dev(target, div113, anchor);
    			append_dev(div113, div98);
    			append_dev(div98, div95);
    			append_dev(div98, t65);
    			append_dev(div98, div96);
    			append_dev(div98, t66);
    			append_dev(div98, div97);
    			append_dev(div113, t67);
    			append_dev(div113, div112);
    			append_dev(div112, div104);
    			append_dev(div104, div99);
    			append_dev(div104, t68);
    			append_dev(div104, div103);
    			append_dev(div103, div100);
    			append_dev(div103, t69);
    			append_dev(div103, div101);
    			append_dev(div103, t70);
    			append_dev(div103, div102);
    			append_dev(div112, t71);
    			append_dev(div112, div111);
    			append_dev(div111, div105);
    			append_dev(div111, t72);
    			append_dev(div111, div106);
    			append_dev(div111, t73);
    			append_dev(div111, div107);
    			append_dev(div111, t74);
    			append_dev(div111, div108);
    			append_dev(div111, t75);
    			append_dev(div111, div109);
    			append_dev(div111, t76);
    			append_dev(div111, div110);
    			insert_dev(target, t77, anchor);
    			insert_dev(target, div132, anchor);
    			append_dev(div132, div117);
    			append_dev(div117, div114);
    			append_dev(div117, t78);
    			append_dev(div117, div115);
    			append_dev(div117, t79);
    			append_dev(div117, div116);
    			append_dev(div132, t80);
    			append_dev(div132, div131);
    			append_dev(div131, div123);
    			append_dev(div123, div118);
    			append_dev(div123, t81);
    			append_dev(div123, div122);
    			append_dev(div122, div119);
    			append_dev(div122, t82);
    			append_dev(div122, div120);
    			append_dev(div122, t83);
    			append_dev(div122, div121);
    			append_dev(div131, t84);
    			append_dev(div131, div130);
    			append_dev(div130, div124);
    			append_dev(div130, t85);
    			append_dev(div130, div125);
    			append_dev(div130, t86);
    			append_dev(div130, div126);
    			append_dev(div130, t87);
    			append_dev(div130, div127);
    			append_dev(div130, t88);
    			append_dev(div130, div128);
    			append_dev(div130, t89);
    			append_dev(div130, div129);
    			insert_dev(target, t90, anchor);
    			insert_dev(target, div151, anchor);
    			append_dev(div151, div136);
    			append_dev(div136, div133);
    			append_dev(div136, t91);
    			append_dev(div136, div134);
    			append_dev(div136, t92);
    			append_dev(div136, div135);
    			append_dev(div151, t93);
    			append_dev(div151, div150);
    			append_dev(div150, div142);
    			append_dev(div142, div137);
    			append_dev(div142, t94);
    			append_dev(div142, div141);
    			append_dev(div141, div138);
    			append_dev(div141, t95);
    			append_dev(div141, div139);
    			append_dev(div141, t96);
    			append_dev(div141, div140);
    			append_dev(div150, t97);
    			append_dev(div150, div149);
    			append_dev(div149, div143);
    			append_dev(div149, t98);
    			append_dev(div149, div144);
    			append_dev(div149, t99);
    			append_dev(div149, div145);
    			append_dev(div149, t100);
    			append_dev(div149, div146);
    			append_dev(div149, t101);
    			append_dev(div149, div147);
    			append_dev(div149, t102);
    			append_dev(div149, div148);
    			insert_dev(target, t103, anchor);
    			insert_dev(target, div170, anchor);
    			append_dev(div170, div155);
    			append_dev(div155, div152);
    			append_dev(div155, t104);
    			append_dev(div155, div153);
    			append_dev(div155, t105);
    			append_dev(div155, div154);
    			append_dev(div170, t106);
    			append_dev(div170, div169);
    			append_dev(div169, div161);
    			append_dev(div161, div156);
    			append_dev(div161, t107);
    			append_dev(div161, div160);
    			append_dev(div160, div157);
    			append_dev(div160, t108);
    			append_dev(div160, div158);
    			append_dev(div160, t109);
    			append_dev(div160, div159);
    			append_dev(div169, t110);
    			append_dev(div169, div168);
    			append_dev(div168, div162);
    			append_dev(div168, t111);
    			append_dev(div168, div163);
    			append_dev(div168, t112);
    			append_dev(div168, div164);
    			append_dev(div168, t113);
    			append_dev(div168, div165);
    			append_dev(div168, t114);
    			append_dev(div168, div166);
    			append_dev(div168, t115);
    			append_dev(div168, div167);
    			insert_dev(target, t116, anchor);
    			insert_dev(target, div189, anchor);
    			append_dev(div189, div174);
    			append_dev(div174, div171);
    			append_dev(div174, t117);
    			append_dev(div174, div172);
    			append_dev(div174, t118);
    			append_dev(div174, div173);
    			append_dev(div189, t119);
    			append_dev(div189, div188);
    			append_dev(div188, div180);
    			append_dev(div180, div175);
    			append_dev(div180, t120);
    			append_dev(div180, div179);
    			append_dev(div179, div176);
    			append_dev(div179, t121);
    			append_dev(div179, div177);
    			append_dev(div179, t122);
    			append_dev(div179, div178);
    			append_dev(div188, t123);
    			append_dev(div188, div187);
    			append_dev(div187, div181);
    			append_dev(div187, t124);
    			append_dev(div187, div182);
    			append_dev(div187, t125);
    			append_dev(div187, div183);
    			append_dev(div187, t126);
    			append_dev(div187, div184);
    			append_dev(div187, t127);
    			append_dev(div187, div185);
    			append_dev(div187, t128);
    			append_dev(div187, div186);
    			insert_dev(target, t129, anchor);
    			insert_dev(target, div208, anchor);
    			append_dev(div208, div193);
    			append_dev(div193, div190);
    			append_dev(div193, t130);
    			append_dev(div193, div191);
    			append_dev(div193, t131);
    			append_dev(div193, div192);
    			append_dev(div208, t132);
    			append_dev(div208, div207);
    			append_dev(div207, div199);
    			append_dev(div199, div194);
    			append_dev(div199, t133);
    			append_dev(div199, div198);
    			append_dev(div198, div195);
    			append_dev(div198, t134);
    			append_dev(div198, div196);
    			append_dev(div198, t135);
    			append_dev(div198, div197);
    			append_dev(div207, t136);
    			append_dev(div207, div206);
    			append_dev(div206, div200);
    			append_dev(div206, t137);
    			append_dev(div206, div201);
    			append_dev(div206, t138);
    			append_dev(div206, div202);
    			append_dev(div206, t139);
    			append_dev(div206, div203);
    			append_dev(div206, t140);
    			append_dev(div206, div204);
    			append_dev(div206, t141);
    			append_dev(div206, div205);
    			insert_dev(target, t142, anchor);
    			insert_dev(target, div227, anchor);
    			append_dev(div227, div212);
    			append_dev(div212, div209);
    			append_dev(div212, t143);
    			append_dev(div212, div210);
    			append_dev(div212, t144);
    			append_dev(div212, div211);
    			append_dev(div227, t145);
    			append_dev(div227, div226);
    			append_dev(div226, div218);
    			append_dev(div218, div213);
    			append_dev(div218, t146);
    			append_dev(div218, div217);
    			append_dev(div217, div214);
    			append_dev(div217, t147);
    			append_dev(div217, div215);
    			append_dev(div217, t148);
    			append_dev(div217, div216);
    			append_dev(div226, t149);
    			append_dev(div226, div225);
    			append_dev(div225, div219);
    			append_dev(div225, t150);
    			append_dev(div225, div220);
    			append_dev(div225, t151);
    			append_dev(div225, div221);
    			append_dev(div225, t152);
    			append_dev(div225, div222);
    			append_dev(div225, t153);
    			append_dev(div225, div223);
    			append_dev(div225, t154);
    			append_dev(div225, div224);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div18);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div37);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(div56);
    			if (detaching) detach_dev(t38);
    			if (detaching) detach_dev(div75);
    			if (detaching) detach_dev(t51);
    			if (detaching) detach_dev(div94);
    			if (detaching) detach_dev(t64);
    			if (detaching) detach_dev(div113);
    			if (detaching) detach_dev(t77);
    			if (detaching) detach_dev(div132);
    			if (detaching) detach_dev(t90);
    			if (detaching) detach_dev(div151);
    			if (detaching) detach_dev(t103);
    			if (detaching) detach_dev(div170);
    			if (detaching) detach_dev(t116);
    			if (detaching) detach_dev(div189);
    			if (detaching) detach_dev(t129);
    			if (detaching) detach_dev(div208);
    			if (detaching) detach_dev(t142);
    			if (detaching) detach_dev(div227);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('loading-gophers', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<loading-gophers> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class LoadingGophers extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>@keyframes blink{from{background-position:0px}to{background-position:400px}}.loadingGopher{display:flex;border-radius:2px;background-color:#aaa9a9;background:url("/public/img/grbg.png");max-width:400px;flex:1;min-width:300px;height:200px;overflow:hidden;animation-name:blink;animation-duration:1s;animation-iteration-count:infinite;animation-delay:linear}.leftSide{width:100px;display:flex;flex-direction:column;justify-content:space-between;align-items:center;padding:15px 10px}.companySide{border-radius:2px;background-color:rgba(255, 255, 255, 0.1);display:inline;width:80px;height:20px}.avatar{width:80px;height:80px;background-color:rgba(255, 255, 255, 0.1);border-radius:2px}.jobStatusSide{background-color:rgba(255, 255, 255, 0.1);width:80px;height:20px}.rightSide{flex:1;background-color:rgba(255, 255, 255, 0.1);height:100%;padding:15px 10px;display:flex;flex-direction:column;justify-content:space-between}.topSide{flex:1}.name{background-color:rgba(255, 255, 255, 0.1);margin-bottom:10px;width:120px;height:30px}.description{width:100%;height:80px}.line{width:100%;height:16px;margin-bottom:10px;border-radius:2px;background-color:rgba(255, 255, 255, 0.1)}.socialLinks{height:100%;margin-top:10px;width:100%;display:flex;flex-wrap:wrap}.socialIcon{width:24px;height:24px;background-color:rgba(255, 255, 255, 0.1);border-radius:2px;margin-right:5px}</style>`;

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$a,
    			create_fragment$a,
    			safe_not_equal,
    			{},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("loading-gophers", LoadingGophers);

    /* src/GopherList.svelte generated by Svelte v3.44.2 */
    const file$9 = "src/GopherList.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (113:0) {:else}
    function create_else_block$5(ctx) {
    	let div0;
    	let input;
    	let t0;
    	let button0;
    	let t2;
    	let button1;
    	let t4;
    	let button2;
    	let t6;
    	let button3;
    	let t8;
    	let button4;
    	let div0_intro;
    	let t10;
    	let div1;
    	let div1_intro;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*filteredGophers*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			input = element("input");
    			t0 = space();
    			button0 = element("button");
    			button0.textContent = "Tümü";
    			t2 = space();
    			button1 = element("button");
    			button1.textContent = "İş Arayanlar";
    			t4 = space();
    			button2 = element("button");
    			button2.textContent = "İş Verenler";
    			t6 = space();
    			button3 = element("button");
    			button3.textContent = "Çalışanlar";
    			t8 = space();
    			button4 = element("button");
    			button4.textContent = "Çalışmayanlar";
    			t10 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "class", "searchInput");
    			attr_dev(input, "type", "text");
    			input.value = "";
    			attr_dev(input, "placeholder", "Gopher Ara...");
    			add_location(input, file$9, 114, 1, 2645);
    			attr_dev(button0, "class", "filterButton");
    			add_location(button0, file$9, 121, 1, 2760);
    			attr_dev(button1, "class", "filterButton lookingButton");
    			add_location(button1, file$9, 122, 1, 2830);
    			attr_dev(button2, "class", "filterButton hiringButton");
    			add_location(button2, file$9, 125, 1, 2928);
    			attr_dev(button3, "class", "filterButton");
    			add_location(button3, file$9, 128, 1, 3023);
    			attr_dev(button4, "class", "filterButton");
    			add_location(button4, file$9, 129, 1, 3100);
    			attr_dev(div0, "class", "filterZone");
    			add_location(div0, file$9, 113, 0, 2611);
    			attr_dev(div1, "class", "gophers");
    			add_location(div1, file$9, 133, 0, 3194);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, input);
    			append_dev(div0, t0);
    			append_dev(div0, button0);
    			append_dev(div0, t2);
    			append_dev(div0, button1);
    			append_dev(div0, t4);
    			append_dev(div0, button2);
    			append_dev(div0, t6);
    			append_dev(div0, button3);
    			append_dev(div0, t8);
    			append_dev(div0, button4);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "keyup", /*searchGopher*/ ctx[2], false, false, false),
    					listen_dev(button0, "click", /*showAllGophers*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*showOnlyLooking*/ ctx[4], false, false, false),
    					listen_dev(button2, "click", /*showOnlyHiring*/ ctx[5], false, false, false),
    					listen_dev(button3, "click", /*showOnlyWorking*/ ctx[6], false, false, false),
    					listen_dev(button4, "click", /*showOnlyNotWorking*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filteredGophers, editGopherBtn*/ 257) {
    				each_value = /*filteredGophers*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			if (!div0_intro) {
    				add_render_callback(() => {
    					div0_intro = create_in_transition(div0, fade, {});
    					div0_intro.start();
    				});
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			if (!div1_intro) {
    				add_render_callback(() => {
    					div1_intro = create_in_transition(div1, fade, {});
    					div1_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(113:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (111:0) {#if allGophers.length == 0}
    function create_if_block$7(ctx) {
    	let loading_gophers;

    	const block = {
    		c: function create() {
    			loading_gophers = element("loading-gophers");
    			add_location(loading_gophers, file$9, 111, 2, 2584);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, loading_gophers, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(loading_gophers);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(111:0) {#if allGophers.length == 0}",
    		ctx
    	});

    	return block;
    }

    // (146:37) 
    function create_if_block_15$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Çalışıyor");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15$4.name,
    		type: "if",
    		source: "(146:37) ",
    		ctx
    	});

    	return block;
    }

    // (145:90) 
    function create_if_block_14$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Çalışan\n\t\t\t\t\t\tArıyor");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14$4.name,
    		type: "if",
    		source: "(145:90) ",
    		ctx
    	});

    	return block;
    }

    // (145:5) {#if gopher.job_status == "looking"}
    function create_if_block_13$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("İş Arıyor");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13$4.name,
    		type: "if",
    		source: "(145:5) {#if gopher.job_status == \\\"looking\\\"}",
    		ctx
    	});

    	return block;
    }

    // (157:5) {#if gopher.social.github}
    function create_if_block_12$4(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "github");
    			add_location(i, file$9, 158, 23, 4142);
    			attr_dev(a, "href", a_href_value = "https://github.com/" + /*gopher*/ ctx[14].social.github);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$9, 156, 31, 4060);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filteredGophers*/ 1 && a_href_value !== (a_href_value = "https://github.com/" + /*gopher*/ ctx[14].social.github)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12$4.name,
    		type: "if",
    		source: "(157:5) {#if gopher.social.github}",
    		ctx
    	});

    	return block;
    }

    // (161:5) {#if gopher.social.gitlab}
    function create_if_block_11$4(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "gitlab");
    			add_location(i, file$9, 162, 23, 4292);
    			attr_dev(a, "href", a_href_value = "https://gitlab.com/" + /*gopher*/ ctx[14].social.gitlab);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$9, 160, 31, 4210);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filteredGophers*/ 1 && a_href_value !== (a_href_value = "https://gitlab.com/" + /*gopher*/ ctx[14].social.gitlab)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11$4.name,
    		type: "if",
    		source: "(161:5) {#if gopher.social.gitlab}",
    		ctx
    	});

    	return block;
    }

    // (165:5) {#if gopher.social.twitter}
    function create_if_block_10$4(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "twitter");
    			add_location(i, file$9, 166, 23, 4445);
    			attr_dev(a, "href", a_href_value = "https://twitter.com/" + /*gopher*/ ctx[14].social.twitter);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$9, 164, 32, 4361);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filteredGophers*/ 1 && a_href_value !== (a_href_value = "https://twitter.com/" + /*gopher*/ ctx[14].social.twitter)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$4.name,
    		type: "if",
    		source: "(165:5) {#if gopher.social.twitter}",
    		ctx
    	});

    	return block;
    }

    // (169:5) {#if gopher.social.facebook}
    function create_if_block_9$4(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "facebook");
    			add_location(i, file$9, 170, 23, 4602);
    			attr_dev(a, "href", a_href_value = "https://facebook.com/" + /*gopher*/ ctx[14].social.facebook);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$9, 168, 33, 4516);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filteredGophers*/ 1 && a_href_value !== (a_href_value = "https://facebook.com/" + /*gopher*/ ctx[14].social.facebook)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$4.name,
    		type: "if",
    		source: "(169:5) {#if gopher.social.facebook}",
    		ctx
    	});

    	return block;
    }

    // (173:5) {#if gopher.social.youtube}
    function create_if_block_8$4(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "youtube");
    			add_location(i, file$9, 174, 23, 4757);
    			attr_dev(a, "href", a_href_value = "https://youtube.com/" + /*gopher*/ ctx[14].social.youtube);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$9, 172, 32, 4673);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filteredGophers*/ 1 && a_href_value !== (a_href_value = "https://youtube.com/" + /*gopher*/ ctx[14].social.youtube)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$4.name,
    		type: "if",
    		source: "(173:5) {#if gopher.social.youtube}",
    		ctx
    	});

    	return block;
    }

    // (177:5) {#if gopher.social.instagram}
    function create_if_block_7$4(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "instagram");
    			add_location(i, file$9, 179, 23, 4926);
    			attr_dev(a, "href", a_href_value = "https://instagram.com/" + /*gopher*/ ctx[14].social.instagram);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$9, 176, 34, 4829);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filteredGophers*/ 1 && a_href_value !== (a_href_value = "https://instagram.com/" + /*gopher*/ ctx[14].social.instagram)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$4.name,
    		type: "if",
    		source: "(177:5) {#if gopher.social.instagram}",
    		ctx
    	});

    	return block;
    }

    // (182:5) {#if gopher.social.telegram}
    function create_if_block_6$4(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "telegram");
    			add_location(i, file$9, 183, 23, 5077);
    			attr_dev(a, "href", a_href_value = "https://t.me/" + /*gopher*/ ctx[14].social.telegram);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$9, 181, 33, 4999);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filteredGophers*/ 1 && a_href_value !== (a_href_value = "https://t.me/" + /*gopher*/ ctx[14].social.telegram)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$4.name,
    		type: "if",
    		source: "(182:5) {#if gopher.social.telegram}",
    		ctx
    	});

    	return block;
    }

    // (186:5) {#if gopher.social.linkedin}
    function create_if_block_5$4(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "linkedin");
    			add_location(i, file$9, 188, 23, 5247);
    			attr_dev(a, "href", a_href_value = "https://linkedin.com/in/" + /*gopher*/ ctx[14].social.linkedin);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$9, 185, 33, 5149);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filteredGophers*/ 1 && a_href_value !== (a_href_value = "https://linkedin.com/in/" + /*gopher*/ ctx[14].social.linkedin)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$4.name,
    		type: "if",
    		source: "(186:5) {#if gopher.social.linkedin}",
    		ctx
    	});

    	return block;
    }

    // (191:5) {#if gopher.social.reddit}
    function create_if_block_4$4(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "reddit");
    			add_location(i, file$9, 192, 23, 5401);
    			attr_dev(a, "href", a_href_value = "https://reddit.com/u/" + /*gopher*/ ctx[14].social.reddit);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$9, 190, 31, 5317);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filteredGophers*/ 1 && a_href_value !== (a_href_value = "https://reddit.com/u/" + /*gopher*/ ctx[14].social.reddit)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$4.name,
    		type: "if",
    		source: "(191:5) {#if gopher.social.reddit}",
    		ctx
    	});

    	return block;
    }

    // (195:5) {#if gopher.social.kommunity}
    function create_if_block_3$4(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "kommunity");
    			add_location(i, file$9, 197, 23, 5570);
    			attr_dev(a, "href", a_href_value = "https://kommunity.com/@" + /*gopher*/ ctx[14].social.kommunity);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$9, 194, 34, 5472);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filteredGophers*/ 1 && a_href_value !== (a_href_value = "https://kommunity.com/@" + /*gopher*/ ctx[14].social.kommunity)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$4.name,
    		type: "if",
    		source: "(195:5) {#if gopher.social.kommunity}",
    		ctx
    	});

    	return block;
    }

    // (200:5) {#if gopher.social.email}
    function create_if_block_2$4(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "email");
    			add_location(i, file$9, 201, 23, 5712);
    			attr_dev(a, "href", a_href_value = "mailto:" + /*gopher*/ ctx[14].social.email);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$9, 199, 30, 5640);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filteredGophers*/ 1 && a_href_value !== (a_href_value = "mailto:" + /*gopher*/ ctx[14].social.email)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(200:5) {#if gopher.social.email}",
    		ctx
    	});

    	return block;
    }

    // (204:5) {#if gopher.social.website}
    function create_if_block_1$7(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "website");
    			add_location(i, file$9, 205, 23, 5842);
    			attr_dev(a, "href", a_href_value = /*gopher*/ ctx[14].social.website);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$9, 203, 32, 5780);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filteredGophers*/ 1 && a_href_value !== (a_href_value = /*gopher*/ ctx[14].social.website)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(204:5) {#if gopher.social.website}",
    		ctx
    	});

    	return block;
    }

    // (135:1) {#each filteredGophers as gopher}
    function create_each_block$2(ctx) {
    	let div9;
    	let div3;
    	let div0;
    	let t0_value = (/*gopher*/ ctx[14].company || "Çalışmıyor") + "";
    	let t0;
    	let t1;
    	let div1;
    	let button;
    	let t3;
    	let div2;
    	let t4;
    	let div8;
    	let div6;
    	let div4;
    	let t5_value = /*gopher*/ ctx[14].name + "";
    	let t5;
    	let t6;
    	let div5;
    	let t7_value = (/*gopher*/ ctx[14].description || "Açıklama Bulunmuyor") + "";
    	let t7;
    	let t8;
    	let div7;
    	let t9;
    	let t10;
    	let t11;
    	let t12;
    	let t13;
    	let t14;
    	let t15;
    	let t16;
    	let t17;
    	let t18;
    	let t19;
    	let t20;
    	let div9_cardtype_value;
    	let div9_transition;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*gopher*/ ctx[14].job_status == "looking") return create_if_block_13$4;
    		if (/*gopher*/ ctx[14].job_status == "hiring") return create_if_block_14$4;
    		if (/*gopher*/ ctx[14].company) return create_if_block_15$4;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);
    	let if_block1 = /*gopher*/ ctx[14].social.github && create_if_block_12$4(ctx);
    	let if_block2 = /*gopher*/ ctx[14].social.gitlab && create_if_block_11$4(ctx);
    	let if_block3 = /*gopher*/ ctx[14].social.twitter && create_if_block_10$4(ctx);
    	let if_block4 = /*gopher*/ ctx[14].social.facebook && create_if_block_9$4(ctx);
    	let if_block5 = /*gopher*/ ctx[14].social.youtube && create_if_block_8$4(ctx);
    	let if_block6 = /*gopher*/ ctx[14].social.instagram && create_if_block_7$4(ctx);
    	let if_block7 = /*gopher*/ ctx[14].social.telegram && create_if_block_6$4(ctx);
    	let if_block8 = /*gopher*/ ctx[14].social.linkedin && create_if_block_5$4(ctx);
    	let if_block9 = /*gopher*/ ctx[14].social.reddit && create_if_block_4$4(ctx);
    	let if_block10 = /*gopher*/ ctx[14].social.kommunity && create_if_block_3$4(ctx);
    	let if_block11 = /*gopher*/ ctx[14].social.email && create_if_block_2$4(ctx);
    	let if_block12 = /*gopher*/ ctx[14].social.website && create_if_block_1$7(ctx);

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "🖉";
    			t3 = space();
    			div2 = element("div");
    			if (if_block0) if_block0.c();
    			t4 = space();
    			div8 = element("div");
    			div6 = element("div");
    			div4 = element("div");
    			t5 = text(t5_value);
    			t6 = space();
    			div5 = element("div");
    			t7 = text(t7_value);
    			t8 = space();
    			div7 = element("div");
    			if (if_block1) if_block1.c();
    			t9 = space();
    			if (if_block2) if_block2.c();
    			t10 = space();
    			if (if_block3) if_block3.c();
    			t11 = space();
    			if (if_block4) if_block4.c();
    			t12 = space();
    			if (if_block5) if_block5.c();
    			t13 = space();
    			if (if_block6) if_block6.c();
    			t14 = space();
    			if (if_block7) if_block7.c();
    			t15 = space();
    			if (if_block8) if_block8.c();
    			t16 = space();
    			if (if_block9) if_block9.c();
    			t17 = space();
    			if (if_block10) if_block10.c();
    			t18 = space();
    			if (if_block11) if_block11.c();
    			t19 = space();
    			if (if_block12) if_block12.c();
    			t20 = space();
    			attr_dev(div0, "class", "companySide");
    			add_location(div0, file$9, 137, 4, 3357);
    			attr_dev(button, "class", "editBtn");
    			add_location(button, file$9, 141, 5, 3511);
    			attr_dev(div1, "class", "avatar");
    			set_style(div1, "--avatar", "url(" + /*gopher*/ ctx[14].profile_img_url + ")");
    			add_location(div1, file$9, 140, 4, 3436);
    			attr_dev(div2, "class", "jobStatusSide");
    			add_location(div2, file$9, 143, 4, 3598);
    			attr_dev(div3, "class", "leftSide");
    			add_location(div3, file$9, 136, 3, 3330);
    			attr_dev(div4, "class", "name");
    			add_location(div4, file$9, 150, 5, 3855);
    			attr_dev(div5, "class", "description");
    			add_location(div5, file$9, 151, 5, 3898);
    			attr_dev(div6, "class", "topSide");
    			add_location(div6, file$9, 149, 4, 3828);
    			attr_dev(div7, "class", "socialLinks");
    			add_location(div7, file$9, 155, 4, 4003);
    			attr_dev(div8, "class", "rightSide");
    			add_location(div8, file$9, 148, 3, 3800);
    			attr_dev(div9, "class", "gopher");
    			attr_dev(div9, "cardtype", div9_cardtype_value = /*gopher*/ ctx[14].job_status);
    			add_location(div9, file$9, 135, 2, 3261);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div3);
    			append_dev(div3, div0);
    			append_dev(div0, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, button);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div9, t4);
    			append_dev(div9, div8);
    			append_dev(div8, div6);
    			append_dev(div6, div4);
    			append_dev(div4, t5);
    			append_dev(div6, t6);
    			append_dev(div6, div5);
    			append_dev(div5, t7);
    			append_dev(div8, t8);
    			append_dev(div8, div7);
    			if (if_block1) if_block1.m(div7, null);
    			append_dev(div7, t9);
    			if (if_block2) if_block2.m(div7, null);
    			append_dev(div7, t10);
    			if (if_block3) if_block3.m(div7, null);
    			append_dev(div7, t11);
    			if (if_block4) if_block4.m(div7, null);
    			append_dev(div7, t12);
    			if (if_block5) if_block5.m(div7, null);
    			append_dev(div7, t13);
    			if (if_block6) if_block6.m(div7, null);
    			append_dev(div7, t14);
    			if (if_block7) if_block7.m(div7, null);
    			append_dev(div7, t15);
    			if (if_block8) if_block8.m(div7, null);
    			append_dev(div7, t16);
    			if (if_block9) if_block9.m(div7, null);
    			append_dev(div7, t17);
    			if (if_block10) if_block10.m(div7, null);
    			append_dev(div7, t18);
    			if (if_block11) if_block11.m(div7, null);
    			append_dev(div7, t19);
    			if (if_block12) if_block12.m(div7, null);
    			append_dev(div9, t20);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*editGopherBtn*/ ctx[8](/*gopher*/ ctx[14].id))) /*editGopherBtn*/ ctx[8](/*gopher*/ ctx[14].id).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*filteredGophers*/ 1) && t0_value !== (t0_value = (/*gopher*/ ctx[14].company || "Çalışmıyor") + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*filteredGophers*/ 1) {
    				set_style(div1, "--avatar", "url(" + /*gopher*/ ctx[14].profile_img_url + ")");
    			}

    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if (if_block0) if_block0.d(1);
    				if_block0 = current_block_type && current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div2, null);
    				}
    			}

    			if ((!current || dirty & /*filteredGophers*/ 1) && t5_value !== (t5_value = /*gopher*/ ctx[14].name + "")) set_data_dev(t5, t5_value);
    			if ((!current || dirty & /*filteredGophers*/ 1) && t7_value !== (t7_value = (/*gopher*/ ctx[14].description || "Açıklama Bulunmuyor") + "")) set_data_dev(t7, t7_value);

    			if (/*gopher*/ ctx[14].social.github) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_12$4(ctx);
    					if_block1.c();
    					if_block1.m(div7, t9);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*gopher*/ ctx[14].social.gitlab) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_11$4(ctx);
    					if_block2.c();
    					if_block2.m(div7, t10);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*gopher*/ ctx[14].social.twitter) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_10$4(ctx);
    					if_block3.c();
    					if_block3.m(div7, t11);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*gopher*/ ctx[14].social.facebook) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_9$4(ctx);
    					if_block4.c();
    					if_block4.m(div7, t12);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*gopher*/ ctx[14].social.youtube) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_8$4(ctx);
    					if_block5.c();
    					if_block5.m(div7, t13);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*gopher*/ ctx[14].social.instagram) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_7$4(ctx);
    					if_block6.c();
    					if_block6.m(div7, t14);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*gopher*/ ctx[14].social.telegram) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_6$4(ctx);
    					if_block7.c();
    					if_block7.m(div7, t15);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (/*gopher*/ ctx[14].social.linkedin) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);
    				} else {
    					if_block8 = create_if_block_5$4(ctx);
    					if_block8.c();
    					if_block8.m(div7, t16);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (/*gopher*/ ctx[14].social.reddit) {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);
    				} else {
    					if_block9 = create_if_block_4$4(ctx);
    					if_block9.c();
    					if_block9.m(div7, t17);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}

    			if (/*gopher*/ ctx[14].social.kommunity) {
    				if (if_block10) {
    					if_block10.p(ctx, dirty);
    				} else {
    					if_block10 = create_if_block_3$4(ctx);
    					if_block10.c();
    					if_block10.m(div7, t18);
    				}
    			} else if (if_block10) {
    				if_block10.d(1);
    				if_block10 = null;
    			}

    			if (/*gopher*/ ctx[14].social.email) {
    				if (if_block11) {
    					if_block11.p(ctx, dirty);
    				} else {
    					if_block11 = create_if_block_2$4(ctx);
    					if_block11.c();
    					if_block11.m(div7, t19);
    				}
    			} else if (if_block11) {
    				if_block11.d(1);
    				if_block11 = null;
    			}

    			if (/*gopher*/ ctx[14].social.website) {
    				if (if_block12) {
    					if_block12.p(ctx, dirty);
    				} else {
    					if_block12 = create_if_block_1$7(ctx);
    					if_block12.c();
    					if_block12.m(div7, null);
    				}
    			} else if (if_block12) {
    				if_block12.d(1);
    				if_block12 = null;
    			}

    			if (!current || dirty & /*filteredGophers*/ 1 && div9_cardtype_value !== (div9_cardtype_value = /*gopher*/ ctx[14].job_status)) {
    				attr_dev(div9, "cardtype", div9_cardtype_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div9_transition) div9_transition = create_bidirectional_transition(div9, fade, {}, true);
    				div9_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div9_transition) div9_transition = create_bidirectional_transition(div9, fade, {}, false);
    			div9_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);

    			if (if_block0) {
    				if_block0.d();
    			}

    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			if (if_block8) if_block8.d();
    			if (if_block9) if_block9.d();
    			if (if_block10) if_block10.d();
    			if (if_block11) if_block11.d();
    			if (if_block12) if_block12.d();
    			if (detaching && div9_transition) div9_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(135:1) {#each filteredGophers as gopher}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let link;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$7, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*allGophers*/ ctx[1].length == 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			if_block.c();
    			if_block_anchor = empty();
    			this.c = noop;
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/public/global.css");
    			add_location(link, file$9, 109, 0, 2501);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('gopher-list', slots, []);
    	let filteredGophers = [];
    	let allGophers = [];
    	let isPageLoaded = false;

    	var gopherPictures = [
    		"/public/img/gophers/gopher1.png",
    		"/public/img/gophers/gopher2.png",
    		"/public/img/gophers/gopher3.png",
    		"/public/img/gophers/gopher4.png",
    		"/public/img/gophers/gopher5.png",
    		"/public/img/gophers/gopher6.png"
    	];

    	const genRandomGopherPP = () => {
    		return gopherPictures[Math.floor(Math.random() * gopherPictures.length)];
    	};

    	async function fetchAllGophers() {
    		var everyBody = document.querySelector("body");
    		everyBody.style.overflow = "hidden";
    		var req = new XMLHttpRequest();
    		req.open("GET", "/api/gophers/", true);

    		req.onload = () => {
    			if (req.status == 200) {
    				$$invalidate(0, filteredGophers = JSON.parse(req.responseText));

    				filteredGophers.forEach(gopher => {
    					if (gopher.profile_img_url == undefined) {
    						gopher.profile_img_url = genRandomGopherPP();
    					}
    				});

    				$$invalidate(1, allGophers = filteredGophers);
    				everyBody.style.overflow = "auto";
    			}
    		};

    		req.send(null);
    	}

    	fetchAllGophers();

    	const searchGopher = e => {
    		var gophers = [];

    		allGophers.forEach(gopher => {
    			var name = gopher.name.toLowerCase();

    			if (name.includes(e.currentTarget.value.toLowerCase())) {
    				gophers = [...gophers, gopher];
    			}
    		});

    		$$invalidate(0, filteredGophers = gophers);
    	};

    	const showAllGophers = () => {
    		$$invalidate(0, filteredGophers = allGophers);
    	};

    	const showOnlyLooking = () => {
    		let gophers = [];

    		allGophers.forEach(gopher => {
    			if (gopher.job_status == "looking") {
    				gophers = [...gophers, gopher];
    			}
    		});

    		$$invalidate(0, filteredGophers = gophers);
    	};

    	const showOnlyHiring = () => {
    		let gophers = [];

    		allGophers.forEach(gopher => {
    			if (gopher.job_status == "hiring") {
    				gophers = [...gophers, gopher];
    			}
    		});

    		$$invalidate(0, filteredGophers = gophers);
    	};

    	const showOnlyWorking = () => {
    		let gophers = [];

    		allGophers.forEach(gopher => {
    			if (gopher.company != undefined) {
    				gophers = [...gophers, gopher];
    			}
    		});

    		$$invalidate(0, filteredGophers = gophers);
    	};

    	const showOnlyNotWorking = () => {
    		let gophers = [];

    		allGophers.forEach(gopher => {
    			if (gopher.company == undefined) {
    				gophers = [...gophers, gopher];
    			}
    		});

    		$$invalidate(0, filteredGophers = gophers);
    	};

    	const editGopherBtn = id => {
    		location.href = "/edit-request/" + id;
    	};

    	const editGopherBtnAdmin = id => {
    		location.href = "/admin/edit/" + id;
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<gopher-list> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		fade,
    		LoadingGophers,
    		filteredGophers,
    		allGophers,
    		isPageLoaded,
    		gopherPictures,
    		genRandomGopherPP,
    		fetchAllGophers,
    		searchGopher,
    		showAllGophers,
    		showOnlyLooking,
    		showOnlyHiring,
    		showOnlyWorking,
    		showOnlyNotWorking,
    		editGopherBtn,
    		editGopherBtnAdmin
    	});

    	$$self.$inject_state = $$props => {
    		if ('filteredGophers' in $$props) $$invalidate(0, filteredGophers = $$props.filteredGophers);
    		if ('allGophers' in $$props) $$invalidate(1, allGophers = $$props.allGophers);
    		if ('isPageLoaded' in $$props) isPageLoaded = $$props.isPageLoaded;
    		if ('gopherPictures' in $$props) gopherPictures = $$props.gopherPictures;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		filteredGophers,
    		allGophers,
    		searchGopher,
    		showAllGophers,
    		showOnlyLooking,
    		showOnlyHiring,
    		showOnlyWorking,
    		showOnlyNotWorking,
    		editGopherBtn
    	];
    }

    class GopherList extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>.avatar{background:var(--avatar);display:flex;justify-content:center;align-items:center}.editBtn{opacity:0;border:0px;border-radius:2px;background-color:#1f0f40;color:white;width:40px;height:40px;transition:opacity .5s;cursor:pointer}[cardType="looking"] .editBtn{background-color:#0f610f}[cardType="hiring"] .editBtn{background-color:#8c4b00}.avatar:hover .editBtn{opacity:1}i{background-size:24px;background-repeat:no-repeat;width:24px;height:24px;display:inline-block;opacity:.7;transition:opacity .3s}i:hover{opacity:1}.github{background:url("/public/img/icons/github.png")}.gitlab{background:url("/public/img/icons/gitlab.png")}.twitter{background:url("/public/img/icons/twitter.png")}.facebook{background:url("/public/img/icons/facebook.png")}.youtube{background:url("/public/img/icons/youtube.png")}.telegram{background:url("/public/img/icons/telegram.png")}.linkedin{background:url("/public/img/icons/linkedin.png")}.reddit{background:url("/public/img/icons/reddit.png")}.instagram{background:url("/public/img/icons/instagram.png")}.email{background:url("/public/img/icons/email.png")}.website{background:url("/public/img/icons/website.png")}.kommunity{background:url("/public/img/icons/kommunity.png")}</style>`;

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$9,
    			create_fragment$9,
    			safe_not_equal,
    			{},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("gopher-list", GopherList);

    /* src/HeaderZone.svelte generated by Svelte v3.44.2 */
    const file$8 = "src/HeaderZone.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (45:8) {:else}
    function create_else_block$4(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "alt", "hamburger");
    			attr_dev(button, "class", "hamburger");
    			add_location(button, file$8, 45, 12, 1141);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleMenu*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(45:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (39:8) {#if screenWidth > 500}
    function create_if_block_1$6(ctx) {
    	let nav;
    	let each_value_1 = /*menuLinks*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(nav, file$8, 39, 12, 965);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(nav, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menuLinks*/ 4) {
    				each_value_1 = /*menuLinks*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(nav, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(39:8) {#if screenWidth > 500}",
    		ctx
    	});

    	return block;
    }

    // (41:16) {#each menuLinks as link}
    function create_each_block_1(ctx) {
    	let a;
    	let t_value = /*link*/ ctx[5].title + "";
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", /*link*/ ctx[5].path);
    			add_location(a, file$8, 41, 20, 1033);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(41:16) {#each menuLinks as link}",
    		ctx
    	});

    	return block;
    }

    // (50:0) {#if isMenuActive}
    function create_if_block$6(ctx) {
    	let div;
    	let button;
    	let t1;
    	let ul;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*menuLinks*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "X";
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(button, "class", "closeBtn");
    			add_location(button, file$8, 51, 8, 1326);
    			add_location(ul, file$8, 52, 8, 1394);
    			attr_dev(div, "class", "mobileMenu");
    			add_location(div, file$8, 50, 4, 1266);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t1);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleMenu*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menuLinks*/ 4) {
    				each_value = /*menuLinks*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
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

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { x: 50 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { x: 50 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(50:0) {#if isMenuActive}",
    		ctx
    	});

    	return block;
    }

    // (54:12) {#each menuLinks as link}
    function create_each_block$1(ctx) {
    	let li;
    	let a;
    	let t0_value = /*link*/ ctx[5].title + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", /*link*/ ctx[5].path);
    			add_location(a, file$8, 55, 20, 1478);
    			add_location(li, file$8, 54, 16, 1453);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(54:12) {#each menuLinks as link}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let link;
    	let t0;
    	let header;
    	let div1;
    	let div0;
    	let t1;
    	let t2;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*screenWidth*/ ctx[1] > 500) return create_if_block_1$6;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*isMenuActive*/ ctx[0] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			header = element("header");
    			div1 = element("div");
    			div0 = element("div");
    			t1 = space();
    			if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			this.c = noop;
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/public/global.css");
    			add_location(link, file$8, 33, 0, 783);
    			attr_dev(div0, "class", "logo");
    			add_location(div0, file$8, 37, 8, 878);
    			attr_dev(div1, "class", "topBar");
    			add_location(div1, file$8, 36, 4, 849);
    			add_location(header, file$8, 35, 0, 836);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, header, anchor);
    			append_dev(header, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			if_block0.m(div1, null);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*homeButton*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if_block0.p(ctx, dirty);

    			if (/*isMenuActive*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*isMenuActive*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$6(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(header);
    			if_block0.d();
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('header-zone', slots, []);
    	let screenWidth = window.innerWidth;
    	let isMenuActive = false;
    	let menuLinks = [{ title: "Gopher Ekle", path: "/add" }, { title: "Beni Oku", path: "/readme" }];

    	const toggleMenu = () => {
    		$$invalidate(0, isMenuActive = !isMenuActive);

    		if (isMenuActive) {
    			document.querySelector("body").style.overflow = "hidden";
    		} else {
    			document.querySelector("body").style.overflow = "visible";
    		}
    	};

    	const homeButton = () => {
    		let dir = location.pathname;
    		dir == "/" ? location.href = "#" : location.href = "/";
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<header-zone> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		fly,
    		screenWidth,
    		isMenuActive,
    		menuLinks,
    		toggleMenu,
    		homeButton
    	});

    	$$self.$inject_state = $$props => {
    		if ('screenWidth' in $$props) $$invalidate(1, screenWidth = $$props.screenWidth);
    		if ('isMenuActive' in $$props) $$invalidate(0, isMenuActive = $$props.isMenuActive);
    		if ('menuLinks' in $$props) $$invalidate(2, menuLinks = $$props.menuLinks);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isMenuActive, screenWidth, menuLinks, toggleMenu, homeButton];
    }

    class HeaderZone extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>header{position:fixed;top:0px;height:78px;width:100%;background-color:#2c165c;border-bottom:8px solid #411f89;z-index:10}header .topBar{display:flex;position:absolute;padding:0px 10px;left:50%;transform:translateX(-50%);width:90%;height:100%;color:rgb(241, 239, 239);justify-content:space-between;align-items:center}.topBar .logo{height:50px;width:43px;background:url(/public/img/sitelogo.png);background-position:center;background-repeat:no-repeat;background-size:contain;cursor:pointer}.topBar nav{display:flex;flex-wrap:wrap;gap:15px}nav a{position:relative;color:rgb(241, 239, 239)}nav a::after{content:"";position:absolute;bottom:2px;left:0px;border-bottom:2px solid rgb(241, 239, 239);width:0%;transform-origin:center;transition:width 0.3s ease-in-out}nav a:hover::after{width:100%}.mobileMenu{position:fixed;top:0px;right:0px;width:100vw;height:100vh;background-color:#2c165c;color:rgb(241, 239, 239);z-index:12;padding:50px}.mobileMenu .closeBtn{position:absolute;top:20px;right:20px;background:transparent;border:0;color:rgb(241, 239, 239);font-weight:bold;font-size:20px;cursor:pointer}.mobileMenu ul li{list-style:none;margin-bottom:20px}.hamburger{display:inline-block;background:url("/public/img/hamburger.png");width:50px;height:50px;border:0;background-size:50px;background-position:center;background-repeat:no-repeat;cursor:pointer}</style>`;

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$8,
    			create_fragment$8,
    			safe_not_equal,
    			{},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("header-zone", HeaderZone);

    /* src/Info.svelte generated by Svelte v3.44.2 */
    const file$7 = "src/Info.svelte";

    // (14:0) {#if isActive}
    function create_if_block$5(ctx) {
    	let div1;
    	let div0;
    	let slot;
    	let t;
    	let div1_outro;
    	let current;
    	let if_block = /*close*/ ctx[0] && create_if_block_1$5(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			slot = element("slot");
    			t = space();
    			if (if_block) if_block.c();
    			add_location(slot, file$7, 16, 8, 289);
    			attr_dev(div0, "class", "text");
    			add_location(div0, file$7, 15, 4, 262);
    			attr_dev(div1, "class", "info");
    			add_location(div1, file$7, 14, 0, 230);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, slot);
    			append_dev(div1, t);
    			if (if_block) if_block.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*close*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$5(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (div1_outro) div1_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			div1_outro = create_out_transition(div1, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			if (detaching && div1_outro) div1_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(14:0) {#if isActive}",
    		ctx
    	});

    	return block;
    }

    // (19:4) {#if close}
    function create_if_block_1$5(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "closeBtn");
    			add_location(button, file$7, 19, 4, 334);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*closeInfo*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(19:4) {#if close}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*isActive*/ ctx[1] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.c = noop;
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isActive*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isActive*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
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
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('show-info', slots, []);
    	let { close = false } = $$props;
    	let isActive = true;

    	const closeInfo = () => {
    		$$invalidate(1, isActive = false);
    	};

    	const writable_props = ['close'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<show-info> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('close' in $$props) $$invalidate(0, close = $$props.close);
    	};

    	$$self.$capture_state = () => ({ fade, close, isActive, closeInfo });

    	$$self.$inject_state = $$props => {
    		if ('close' in $$props) $$invalidate(0, close = $$props.close);
    		if ('isActive' in $$props) $$invalidate(1, isActive = $$props.isActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [close, isActive, closeInfo];
    }

    class Info extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>.info{display:flex;align-items:flex-start;padding:10px 20px;border-left:8px solid #411f89;border-radius:2px;background-color:rgb(245, 245, 245);color:rgb(53, 53, 53);box-shadow:0px 3px 10px rgba(0,0,0,0.3);margin-bottom:30px}.text{flex:1}.closeBtn{background-size:24px;background:url("/public/img/icons/close.png");width:24px;height:24px;border:0;cursor:pointer}</style>`;

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$7,
    			create_fragment$7,
    			safe_not_equal,
    			{ close: 0 },
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["close"];
    	}

    	get close() {
    		return this.$$.ctx[0];
    	}

    	set close(close) {
    		this.$$set({ close });
    		flush();
    	}
    }

    customElements.define("show-info", Info);

    /* src/AddGopher.svelte generated by Svelte v3.44.2 */
    const file$6 = "src/AddGopher.svelte";

    // (112:16) {#if insertCompany}
    function create_if_block_20$3(ctx) {
    	let input;
    	let input_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Şirket İsmi");
    			add_location(input, file$6, 112, 20, 3375);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*preview*/ ctx[0].company);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[12]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*preview*/ 1 && input.value !== /*preview*/ ctx[0].company) {
    				set_input_value(input, /*preview*/ ctx[0].company);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!input_transition) input_transition = create_bidirectional_transition(input, fade, {}, true);
    				input_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!input_transition) input_transition = create_bidirectional_transition(input, fade, {}, false);
    			input_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching && input_transition) input_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20$3.name,
    		type: "if",
    		source: "(112:16) {#if insertCompany}",
    		ctx
    	});

    	return block;
    }

    // (259:24) {:else}
    function create_else_block$3(ctx) {
    	let t_value = (/*preview*/ ctx[0].company || "Çalışmıyor") + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*preview*/ 1 && t_value !== (t_value = (/*preview*/ ctx[0].company || "Çalışmıyor") + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(259:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (257:24) {#if preview.company == "freelancer"}
    function create_if_block_19$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Serbest Çalışıyor");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19$3.name,
    		type: "if",
    		source: "(257:24) {#if preview.company == \\\"freelancer\\\"}",
    		ctx
    	});

    	return block;
    }

    // (270:60) 
    function create_if_block_18$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Çalışıyor");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18$3.name,
    		type: "if",
    		source: "(270:60) ",
    		ctx
    	});

    	return block;
    }

    // (269:111) 
    function create_if_block_17$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Çalışan\n                            Arıyor");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17$3.name,
    		type: "if",
    		source: "(269:111) ",
    		ctx
    	});

    	return block;
    }

    // (269:24) {#if preview.job_status == "looking"}
    function create_if_block_16$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("İş Arıyor");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16$3.name,
    		type: "if",
    		source: "(269:24) {#if preview.job_status == \\\"looking\\\"}",
    		ctx
    	});

    	return block;
    }

    // (281:24) {#if preview.social.github}
    function create_if_block_15$3(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "github");
    			add_location(i, file$6, 283, 48, 10048);
    			attr_dev(a, "href", a_href_value = "https://github.com/" + /*preview*/ ctx[0].social.github);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$6, 280, 51, 9878);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*preview*/ 1 && a_href_value !== (a_href_value = "https://github.com/" + /*preview*/ ctx[0].social.github)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15$3.name,
    		type: "if",
    		source: "(281:24) {#if preview.social.github}",
    		ctx
    	});

    	return block;
    }

    // (286:24) {#if preview.social.gitlab}
    function create_if_block_14$3(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "gitlab");
    			add_location(i, file$6, 288, 48, 10328);
    			attr_dev(a, "href", a_href_value = "https://gitlab.com/" + /*preview*/ ctx[0].social.gitlab);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$6, 285, 51, 10158);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*preview*/ 1 && a_href_value !== (a_href_value = "https://gitlab.com/" + /*preview*/ ctx[0].social.gitlab)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14$3.name,
    		type: "if",
    		source: "(286:24) {#if preview.social.gitlab}",
    		ctx
    	});

    	return block;
    }

    // (291:24) {#if preview.social.twitter}
    function create_if_block_13$3(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "twitter");
    			add_location(i, file$6, 293, 48, 10611);
    			attr_dev(a, "href", a_href_value = "https://twitter.com/" + /*preview*/ ctx[0].social.twitter);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$6, 290, 52, 10439);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*preview*/ 1 && a_href_value !== (a_href_value = "https://twitter.com/" + /*preview*/ ctx[0].social.twitter)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13$3.name,
    		type: "if",
    		source: "(291:24) {#if preview.social.twitter}",
    		ctx
    	});

    	return block;
    }

    // (296:24) {#if preview.social.facebook}
    function create_if_block_12$3(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "facebook");
    			add_location(i, file$6, 298, 48, 10898);
    			attr_dev(a, "href", a_href_value = "https://facebook.com/" + /*preview*/ ctx[0].social.facebook);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$6, 295, 53, 10724);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*preview*/ 1 && a_href_value !== (a_href_value = "https://facebook.com/" + /*preview*/ ctx[0].social.facebook)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12$3.name,
    		type: "if",
    		source: "(296:24) {#if preview.social.facebook}",
    		ctx
    	});

    	return block;
    }

    // (301:24) {#if preview.social.youtube}
    function create_if_block_11$3(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "youtube");
    			add_location(i, file$6, 303, 48, 11183);
    			attr_dev(a, "href", a_href_value = "https://youtube.com/" + /*preview*/ ctx[0].social.youtube);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$6, 300, 52, 11011);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*preview*/ 1 && a_href_value !== (a_href_value = "https://youtube.com/" + /*preview*/ ctx[0].social.youtube)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11$3.name,
    		type: "if",
    		source: "(301:24) {#if preview.social.youtube}",
    		ctx
    	});

    	return block;
    }

    // (306:24) {#if preview.social.instagram}
    function create_if_block_10$3(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "instagram");
    			add_location(i, file$6, 308, 48, 11473);
    			attr_dev(a, "href", a_href_value = "https://instagram.com/" + /*preview*/ ctx[0].social.instagram);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$6, 305, 54, 11297);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*preview*/ 1 && a_href_value !== (a_href_value = "https://instagram.com/" + /*preview*/ ctx[0].social.instagram)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$3.name,
    		type: "if",
    		source: "(306:24) {#if preview.social.instagram}",
    		ctx
    	});

    	return block;
    }

    // (311:24) {#if preview.social.telegram}
    function create_if_block_9$3(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "telegram");
    			add_location(i, file$6, 312, 48, 11717);
    			attr_dev(a, "href", a_href_value = "https://t.me/" + /*preview*/ ctx[0].social.telegram);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$6, 310, 53, 11588);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*preview*/ 1 && a_href_value !== (a_href_value = "https://t.me/" + /*preview*/ ctx[0].social.telegram)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$3.name,
    		type: "if",
    		source: "(311:24) {#if preview.social.telegram}",
    		ctx
    	});

    	return block;
    }

    // (315:24) {#if preview.social.linkedin}
    function create_if_block_8$3(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "linkedin");
    			add_location(i, file$6, 317, 48, 12008);
    			attr_dev(a, "href", a_href_value = "https://linkedin.com/in/" + /*preview*/ ctx[0].social.linkedin);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$6, 314, 53, 11831);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*preview*/ 1 && a_href_value !== (a_href_value = "https://linkedin.com/in/" + /*preview*/ ctx[0].social.linkedin)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$3.name,
    		type: "if",
    		source: "(315:24) {#if preview.social.linkedin}",
    		ctx
    	});

    	return block;
    }

    // (320:24) {#if preview.social.reddit}
    function create_if_block_7$3(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "reddit");
    			add_location(i, file$6, 322, 48, 12292);
    			attr_dev(a, "href", a_href_value = "https://reddit.com/u/" + /*preview*/ ctx[0].social.reddit);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$6, 319, 51, 12120);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*preview*/ 1 && a_href_value !== (a_href_value = "https://reddit.com/u/" + /*preview*/ ctx[0].social.reddit)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$3.name,
    		type: "if",
    		source: "(320:24) {#if preview.social.reddit}",
    		ctx
    	});

    	return block;
    }

    // (325:24) {#if preview.social.kommunity}
    function create_if_block_6$3(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "kommunity");
    			add_location(i, file$6, 327, 48, 12582);
    			attr_dev(a, "href", a_href_value = "https://kommunity.com/@" + /*preview*/ ctx[0].social.kommunity);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$6, 324, 54, 12405);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*preview*/ 1 && a_href_value !== (a_href_value = "https://kommunity.com/@" + /*preview*/ ctx[0].social.kommunity)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$3.name,
    		type: "if",
    		source: "(325:24) {#if preview.social.kommunity}",
    		ctx
    	});

    	return block;
    }

    // (330:24) {#if preview.social.email}
    function create_if_block_5$3(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "email");
    			add_location(i, file$6, 331, 48, 12817);
    			attr_dev(a, "href", a_href_value = "mailto:" + /*preview*/ ctx[0].social.email);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$6, 329, 50, 12694);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*preview*/ 1 && a_href_value !== (a_href_value = "mailto:" + /*preview*/ ctx[0].social.email)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$3.name,
    		type: "if",
    		source: "(330:24) {#if preview.social.email}",
    		ctx
    	});

    	return block;
    }

    // (334:24) {#if preview.social.website}
    function create_if_block_4$3(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "website");
    			add_location(i, file$6, 335, 48, 13040);
    			attr_dev(a, "href", a_href_value = /*preview*/ ctx[0].social.website);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$6, 333, 52, 12927);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*preview*/ 1 && a_href_value !== (a_href_value = /*preview*/ ctx[0].social.website)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$3.name,
    		type: "if",
    		source: "(334:24) {#if preview.social.website}",
    		ctx
    	});

    	return block;
    }

    // (349:12) {#if showInfo}
    function create_if_block_3$3(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*processMessage*/ ctx[6]);
    			attr_dev(div, "class", "processInfo");
    			add_location(div, file$6, 349, 12, 13552);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*processMessage*/ 64) set_data_dev(t, /*processMessage*/ ctx[6]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(349:12) {#if showInfo}",
    		ctx
    	});

    	return block;
    }

    // (354:12) {#if showError}
    function create_if_block_2$3(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*processMessage*/ ctx[6]);
    			attr_dev(div, "class", "error");
    			add_location(div, file$6, 354, 12, 13688);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*processMessage*/ 64) set_data_dev(t, /*processMessage*/ ctx[6]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(354:12) {#if showError}",
    		ctx
    	});

    	return block;
    }

    // (359:12) {#if preview.name == "" || preview.name==undefined}
    function create_if_block_1$4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Lütfen isim alanını doldurunuz!";
    			attr_dev(div, "class", "error");
    			add_location(div, file$6, 359, 12, 13854);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(359:12) {#if preview.name == \\\"\\\" || preview.name==undefined}",
    		ctx
    	});

    	return block;
    }

    // (364:12) {#if preferAvatar=="twitter" && (preview.social.twitter == undefined || preview.social.twitter == "")}
    function create_if_block$4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Lütfen Twitter kullanıcı adını giriniz!";
    			attr_dev(div, "class", "error");
    			add_location(div, file$6, 364, 12, 14086);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(364:12) {#if preferAvatar==\\\"twitter\\\" && (preview.social.twitter == undefined || preview.social.twitter == \\\"\\\")}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let link;
    	let t0;
    	let show_info;
    	let h3;
    	let t2;
    	let p0;
    	let t4;
    	let p1;
    	let t6;
    	let div32;
    	let div19;
    	let section0;
    	let div0;
    	let t8;
    	let div1;
    	let b0;
    	let t10;
    	let input0;
    	let t11;
    	let div2;
    	let b1;
    	let t13;
    	let select0;
    	let option0;
    	let option1;
    	let option2;
    	let t17;
    	let t18;
    	let div3;
    	let b2;
    	let t20;
    	let select1;
    	let option3;
    	let option4;
    	let option5;
    	let t24;
    	let div4;
    	let b3;
    	let t26;
    	let textarea;
    	let t27;
    	let section1;
    	let div5;
    	let t29;
    	let div6;
    	let b4;
    	let i0;
    	let t30;
    	let t31;
    	let input1;
    	let t32;
    	let div7;
    	let b5;
    	let i1;
    	let t33;
    	let t34;
    	let input2;
    	let t35;
    	let div8;
    	let b6;
    	let i2;
    	let t36;
    	let t37;
    	let input3;
    	let t38;
    	let div9;
    	let b7;
    	let i3;
    	let t39;
    	let t40;
    	let input4;
    	let t41;
    	let div10;
    	let b8;
    	let i4;
    	let t42;
    	let t43;
    	let input5;
    	let t44;
    	let div11;
    	let b9;
    	let i5;
    	let t45;
    	let t46;
    	let input6;
    	let t47;
    	let div12;
    	let b10;
    	let i6;
    	let t48;
    	let t49;
    	let input7;
    	let t50;
    	let div13;
    	let b11;
    	let i7;
    	let t51;
    	let t52;
    	let input8;
    	let t53;
    	let div14;
    	let b12;
    	let i8;
    	let t54;
    	let t55;
    	let input9;
    	let t56;
    	let div15;
    	let b13;
    	let i9;
    	let t57;
    	let t58;
    	let input10;
    	let t59;
    	let div16;
    	let b14;
    	let i10;
    	let t60;
    	let t61;
    	let input11;
    	let t62;
    	let div17;
    	let b15;
    	let i11;
    	let t63;
    	let t64;
    	let input12;
    	let t65;
    	let section2;
    	let div18;
    	let t67;
    	let p2;
    	let t69;
    	let p3;
    	let input13;
    	let t70;
    	let label0;
    	let t72;
    	let p4;
    	let input14;
    	let t73;
    	let label1;
    	let t75;
    	let section3;
    	let div31;
    	let div20;
    	let t77;
    	let div29;
    	let div23;
    	let div21;
    	let t78;
    	let img;
    	let img_src_value;
    	let t79;
    	let div22;
    	let t80;
    	let div28;
    	let div26;
    	let div24;
    	let t81_value = (/*preview*/ ctx[0].name || "John Doe") + "";
    	let t81;
    	let t82;
    	let div25;
    	let t83_value = (/*preview*/ ctx[0].description || "Açıklama Bulunmuyor") + "";
    	let t83;
    	let t84;
    	let div27;
    	let t85;
    	let t86;
    	let t87;
    	let t88;
    	let t89;
    	let t90;
    	let t91;
    	let t92;
    	let t93;
    	let t94;
    	let t95;
    	let div29_cardtype_value;
    	let div29_transition;
    	let t96;
    	let div30;
    	let button0;
    	let t98;
    	let button1;
    	let t99;
    	let t100;
    	let t101;
    	let t102;
    	let t103;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*insertCompany*/ ctx[2] && create_if_block_20$3(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*preview*/ ctx[0].company == "freelancer") return create_if_block_19$3;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*preview*/ ctx[0].job_status == "looking") return create_if_block_16$3;
    		if (/*preview*/ ctx[0].job_status == "hiring") return create_if_block_17$3;
    		if (/*preview*/ ctx[0].company) return create_if_block_18$3;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block2 = current_block_type_1 && current_block_type_1(ctx);
    	let if_block3 = /*preview*/ ctx[0].social.github && create_if_block_15$3(ctx);
    	let if_block4 = /*preview*/ ctx[0].social.gitlab && create_if_block_14$3(ctx);
    	let if_block5 = /*preview*/ ctx[0].social.twitter && create_if_block_13$3(ctx);
    	let if_block6 = /*preview*/ ctx[0].social.facebook && create_if_block_12$3(ctx);
    	let if_block7 = /*preview*/ ctx[0].social.youtube && create_if_block_11$3(ctx);
    	let if_block8 = /*preview*/ ctx[0].social.instagram && create_if_block_10$3(ctx);
    	let if_block9 = /*preview*/ ctx[0].social.telegram && create_if_block_9$3(ctx);
    	let if_block10 = /*preview*/ ctx[0].social.linkedin && create_if_block_8$3(ctx);
    	let if_block11 = /*preview*/ ctx[0].social.reddit && create_if_block_7$3(ctx);
    	let if_block12 = /*preview*/ ctx[0].social.kommunity && create_if_block_6$3(ctx);
    	let if_block13 = /*preview*/ ctx[0].social.email && create_if_block_5$3(ctx);
    	let if_block14 = /*preview*/ ctx[0].social.website && create_if_block_4$3(ctx);
    	let if_block15 = /*showInfo*/ ctx[4] && create_if_block_3$3(ctx);
    	let if_block16 = /*showError*/ ctx[5] && create_if_block_2$3(ctx);
    	let if_block17 = (/*preview*/ ctx[0].name == "" || /*preview*/ ctx[0].name == undefined) && create_if_block_1$4(ctx);
    	let if_block18 = /*preferAvatar*/ ctx[1] == "twitter" && (/*preview*/ ctx[0].social.twitter == undefined || /*preview*/ ctx[0].social.twitter == "") && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			show_info = element("show-info");
    			h3 = element("h3");
    			h3.textContent = "Lütfen Okuyun!";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "→ Gopher kartı için profil fotoğrafı, Twitter profilinden\n        çekilir. Profil fotoğrafı için, Twitter kullanıcı adını eklemeyi\n        unutmayın...";
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "→ Buraya girmiş olunan bilgiler herkes tarafından\n        görülebilecektir.";
    			t6 = space();
    			div32 = element("div");
    			div19 = element("div");
    			section0 = element("section");
    			div0 = element("div");
    			div0.textContent = "Temel Bilgiler";
    			t8 = space();
    			div1 = element("div");
    			b0 = element("b");
    			b0.textContent = "Ad ve Soyad:";
    			t10 = space();
    			input0 = element("input");
    			t11 = space();
    			div2 = element("div");
    			b1 = element("b");
    			b1.textContent = "Çalışma Durumu:";
    			t13 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Serbest Çalışıyor";
    			option1 = element("option");
    			option1.textContent = "Şirkette Çalışıyor";
    			option2 = element("option");
    			option2.textContent = "Çalışmıyor";
    			t17 = space();
    			if (if_block0) if_block0.c();
    			t18 = space();
    			div3 = element("div");
    			b2 = element("b");
    			b2.textContent = "Arayış Durumu:";
    			t20 = space();
    			select1 = element("select");
    			option3 = element("option");
    			option3.textContent = "İş Arıyor";
    			option4 = element("option");
    			option4.textContent = "Çalışan Arıyor";
    			option5 = element("option");
    			option5.textContent = "Belirtilmemiş";
    			t24 = space();
    			div4 = element("div");
    			b3 = element("b");
    			b3.textContent = "Açıklama:";
    			t26 = space();
    			textarea = element("textarea");
    			t27 = space();
    			section1 = element("section");
    			div5 = element("div");
    			div5.textContent = "İletişim";
    			t29 = space();
    			div6 = element("div");
    			b4 = element("b");
    			i0 = element("i");
    			t30 = text(" GitHub:");
    			t31 = space();
    			input1 = element("input");
    			t32 = space();
    			div7 = element("div");
    			b5 = element("b");
    			i1 = element("i");
    			t33 = text(" GitLab:");
    			t34 = space();
    			input2 = element("input");
    			t35 = space();
    			div8 = element("div");
    			b6 = element("b");
    			i2 = element("i");
    			t36 = text(" Twitter:");
    			t37 = space();
    			input3 = element("input");
    			t38 = space();
    			div9 = element("div");
    			b7 = element("b");
    			i3 = element("i");
    			t39 = text(" Facebook:");
    			t40 = space();
    			input4 = element("input");
    			t41 = space();
    			div10 = element("div");
    			b8 = element("b");
    			i4 = element("i");
    			t42 = text(" YouTube:");
    			t43 = space();
    			input5 = element("input");
    			t44 = space();
    			div11 = element("div");
    			b9 = element("b");
    			i5 = element("i");
    			t45 = text(" Instagram:");
    			t46 = space();
    			input6 = element("input");
    			t47 = space();
    			div12 = element("div");
    			b10 = element("b");
    			i6 = element("i");
    			t48 = text(" Telegram:");
    			t49 = space();
    			input7 = element("input");
    			t50 = space();
    			div13 = element("div");
    			b11 = element("b");
    			i7 = element("i");
    			t51 = text(" LinkedIn:");
    			t52 = space();
    			input8 = element("input");
    			t53 = space();
    			div14 = element("div");
    			b12 = element("b");
    			i8 = element("i");
    			t54 = text(" Reddit:");
    			t55 = space();
    			input9 = element("input");
    			t56 = space();
    			div15 = element("div");
    			b13 = element("b");
    			i9 = element("i");
    			t57 = text(" Kommunity:");
    			t58 = space();
    			input10 = element("input");
    			t59 = space();
    			div16 = element("div");
    			b14 = element("b");
    			i10 = element("i");
    			t60 = text(" E-Mail:");
    			t61 = space();
    			input11 = element("input");
    			t62 = space();
    			div17 = element("div");
    			b15 = element("b");
    			i11 = element("i");
    			t63 = text(" Website:");
    			t64 = space();
    			input12 = element("input");
    			t65 = space();
    			section2 = element("section");
    			div18 = element("div");
    			div18.textContent = "Gopher Avatar";
    			t67 = space();
    			p2 = element("p");
    			p2.textContent = "Profil resmini kullanma tercihini yapın";
    			t69 = space();
    			p3 = element("p");
    			input13 = element("input");
    			t70 = space();
    			label0 = element("label");
    			label0.textContent = "Rastgele Gopher resmi kullan";
    			t72 = space();
    			p4 = element("p");
    			input14 = element("input");
    			t73 = space();
    			label1 = element("label");
    			label1.textContent = "Twitter profil resmini kullan";
    			t75 = space();
    			section3 = element("section");
    			div31 = element("div");
    			div20 = element("div");
    			div20.textContent = "Ön izleme";
    			t77 = space();
    			div29 = element("div");
    			div23 = element("div");
    			div21 = element("div");
    			if_block1.c();
    			t78 = space();
    			img = element("img");
    			t79 = space();
    			div22 = element("div");
    			if (if_block2) if_block2.c();
    			t80 = space();
    			div28 = element("div");
    			div26 = element("div");
    			div24 = element("div");
    			t81 = text(t81_value);
    			t82 = space();
    			div25 = element("div");
    			t83 = text(t83_value);
    			t84 = space();
    			div27 = element("div");
    			if (if_block3) if_block3.c();
    			t85 = space();
    			if (if_block4) if_block4.c();
    			t86 = space();
    			if (if_block5) if_block5.c();
    			t87 = space();
    			if (if_block6) if_block6.c();
    			t88 = space();
    			if (if_block7) if_block7.c();
    			t89 = space();
    			if (if_block8) if_block8.c();
    			t90 = space();
    			if (if_block9) if_block9.c();
    			t91 = space();
    			if (if_block10) if_block10.c();
    			t92 = space();
    			if (if_block11) if_block11.c();
    			t93 = space();
    			if (if_block12) if_block12.c();
    			t94 = space();
    			if (if_block13) if_block13.c();
    			t95 = space();
    			if (if_block14) if_block14.c();
    			t96 = space();
    			div30 = element("div");
    			button0 = element("button");
    			button0.textContent = "← Anasayfaya Dön";
    			t98 = space();
    			button1 = element("button");
    			t99 = text("Onayla");
    			t100 = space();
    			if (if_block15) if_block15.c();
    			t101 = space();
    			if (if_block16) if_block16.c();
    			t102 = space();
    			if (if_block17) if_block17.c();
    			t103 = space();
    			if (if_block18) if_block18.c();
    			this.c = noop;
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/public/global.css");
    			add_location(link, file$6, 79, 0, 2169);
    			add_location(h3, file$6, 81, 4, 2250);
    			add_location(p0, file$6, 82, 4, 2278);
    			add_location(p1, file$6, 87, 4, 2466);
    			set_custom_element_data(show_info, "close", true);
    			add_location(show_info, file$6, 80, 0, 2221);
    			attr_dev(div0, "class", "title");
    			add_location(div0, file$6, 95, 12, 2669);
    			add_location(b0, file$6, 97, 16, 2758);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "John Doe");
    			add_location(input0, file$6, 98, 16, 2794);
    			attr_dev(div1, "class", "column");
    			add_location(div1, file$6, 96, 12, 2721);
    			add_location(b1, file$6, 105, 16, 3009);
    			option0.__value = "freelancer";
    			option0.value = option0.__value;
    			add_location(option0, file$6, 107, 20, 3101);
    			option1.__value = "company";
    			option1.value = option1.__value;
    			add_location(option1, file$6, 108, 20, 3175);
    			option2.__value = "";
    			option2.value = option2.__value;
    			option2.selected = true;
    			add_location(option2, file$6, 109, 20, 3247);
    			add_location(select0, file$6, 106, 16, 3048);
    			attr_dev(div2, "class", "column");
    			add_location(div2, file$6, 104, 12, 2972);
    			add_location(b2, file$6, 121, 16, 3674);
    			option3.__value = "looking";
    			option3.value = option3.__value;
    			add_location(option3, file$6, 123, 20, 3779);
    			option4.__value = "hiring";
    			option4.value = option4.__value;
    			add_location(option4, file$6, 124, 20, 3842);
    			option5.__value = "";
    			option5.value = option5.__value;
    			option5.selected = true;
    			add_location(option5, file$6, 125, 20, 3909);
    			attr_dev(select1, "place", "");
    			if (/*preview*/ ctx[0].job_status === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[13].call(select1));
    			add_location(select1, file$6, 122, 16, 3712);
    			attr_dev(div3, "class", "column");
    			add_location(div3, file$6, 120, 12, 3637);
    			add_location(b3, file$6, 129, 16, 4055);
    			attr_dev(textarea, "placeholder", "Buraya açıklama girebilirsiniz...");
    			add_location(textarea, file$6, 130, 16, 4088);
    			attr_dev(div4, "class", "descolumn");
    			add_location(div4, file$6, 128, 12, 4015);
    			add_location(section0, file$6, 94, 8, 2647);
    			attr_dev(div5, "class", "title");
    			add_location(div5, file$6, 138, 12, 4307);
    			attr_dev(i0, "class", "github");
    			add_location(i0, file$6, 140, 19, 4393);
    			add_location(b4, file$6, 140, 16, 4390);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "kullanıcı adı");
    			add_location(input1, file$6, 141, 16, 4442);
    			attr_dev(div6, "class", "column");
    			add_location(div6, file$6, 139, 12, 4353);
    			attr_dev(i1, "class", "gitlab");
    			add_location(i1, file$6, 148, 19, 4674);
    			add_location(b5, file$6, 148, 16, 4671);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "placeholder", "kullanıcı adı");
    			add_location(input2, file$6, 149, 16, 4723);
    			attr_dev(div7, "class", "column");
    			add_location(div7, file$6, 147, 12, 4634);
    			attr_dev(i2, "class", "twitter");
    			add_location(i2, file$6, 156, 19, 4955);
    			add_location(b6, file$6, 156, 16, 4952);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "placeholder", "kullanıcı adı");
    			add_location(input3, file$6, 157, 16, 5006);
    			attr_dev(div8, "class", "column");
    			add_location(div8, file$6, 155, 12, 4915);
    			attr_dev(i3, "class", "facebook");
    			add_location(i3, file$6, 164, 19, 5239);
    			add_location(b7, file$6, 164, 16, 5236);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "placeholder", "kullanıcı adı");
    			add_location(input4, file$6, 165, 16, 5292);
    			attr_dev(div9, "class", "column");
    			add_location(div9, file$6, 163, 12, 5199);
    			attr_dev(i4, "class", "youtube");
    			add_location(i4, file$6, 172, 19, 5526);
    			add_location(b8, file$6, 172, 16, 5523);
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "placeholder", "/u/kanallinki");
    			add_location(input5, file$6, 173, 16, 5577);
    			attr_dev(div10, "class", "column");
    			add_location(div10, file$6, 171, 12, 5486);
    			attr_dev(i5, "class", "instagram");
    			add_location(i5, file$6, 180, 19, 5810);
    			add_location(b9, file$6, 180, 16, 5807);
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "placeholder", "kullanıcı adı");
    			add_location(input6, file$6, 181, 16, 5865);
    			attr_dev(div11, "class", "column");
    			add_location(div11, file$6, 179, 12, 5770);
    			attr_dev(i6, "class", "telegram");
    			add_location(i6, file$6, 188, 19, 6100);
    			add_location(b10, file$6, 188, 16, 6097);
    			attr_dev(input7, "type", "text");
    			attr_dev(input7, "placeholder", "kullanıcı adı");
    			add_location(input7, file$6, 189, 16, 6153);
    			attr_dev(div12, "class", "column");
    			add_location(div12, file$6, 187, 12, 6060);
    			attr_dev(i7, "class", "linkedin");
    			add_location(i7, file$6, 196, 19, 6387);
    			add_location(b11, file$6, 196, 16, 6384);
    			attr_dev(input8, "type", "text");
    			attr_dev(input8, "placeholder", "kullanıcı adı");
    			add_location(input8, file$6, 197, 16, 6440);
    			attr_dev(div13, "class", "column");
    			add_location(div13, file$6, 195, 12, 6347);
    			attr_dev(i8, "class", "reddit");
    			add_location(i8, file$6, 204, 19, 6674);
    			add_location(b12, file$6, 204, 16, 6671);
    			attr_dev(input9, "type", "text");
    			attr_dev(input9, "placeholder", "kullanıcı adı");
    			add_location(input9, file$6, 205, 16, 6723);
    			attr_dev(div14, "class", "column");
    			add_location(div14, file$6, 203, 12, 6634);
    			attr_dev(i9, "class", "kommunity");
    			add_location(i9, file$6, 212, 19, 6955);
    			add_location(b13, file$6, 212, 16, 6952);
    			attr_dev(input10, "type", "text");
    			attr_dev(input10, "placeholder", "kullanıcı adı");
    			add_location(input10, file$6, 213, 16, 7010);
    			attr_dev(div15, "class", "column");
    			add_location(div15, file$6, 211, 12, 6915);
    			attr_dev(i10, "class", "email");
    			add_location(i10, file$6, 220, 19, 7245);
    			add_location(b14, file$6, 220, 16, 7242);
    			attr_dev(input11, "type", "text");
    			attr_dev(input11, "placeholder", "me@example.com");
    			add_location(input11, file$6, 221, 16, 7293);
    			attr_dev(div16, "class", "column");
    			add_location(div16, file$6, 219, 12, 7205);
    			attr_dev(i11, "class", "website");
    			add_location(i11, file$6, 228, 19, 7525);
    			add_location(b15, file$6, 228, 16, 7522);
    			attr_dev(input12, "type", "text");
    			attr_dev(input12, "placeholder", "https://example.com");
    			add_location(input12, file$6, 229, 16, 7576);
    			attr_dev(div17, "class", "column");
    			add_location(div17, file$6, 227, 12, 7485);
    			add_location(section1, file$6, 137, 8, 4285);
    			attr_dev(div18, "class", "title");
    			add_location(div18, file$6, 237, 12, 7812);
    			add_location(p2, file$6, 238, 12, 7863);
    			attr_dev(input13, "type", "radio");
    			attr_dev(input13, "name", "from");
    			attr_dev(input13, "id", "randomGopher");
    			input13.__value = "randomGopher";
    			input13.value = input13.__value;
    			/*$$binding_groups*/ ctx[28][0].push(input13);
    			add_location(input13, file$6, 240, 16, 7942);
    			attr_dev(label0, "for", "randomGopher");
    			add_location(label0, file$6, 241, 16, 8056);
    			add_location(p3, file$6, 239, 12, 7922);
    			attr_dev(input14, "type", "radio");
    			attr_dev(input14, "name", "from");
    			attr_dev(input14, "id", "fetchfromtw");
    			input14.__value = "twitter";
    			input14.value = input14.__value;
    			/*$$binding_groups*/ ctx[28][0].push(input14);
    			add_location(input14, file$6, 244, 16, 8168);
    			attr_dev(label1, "for", "fetchfromtw");
    			add_location(label1, file$6, 245, 16, 8276);
    			add_location(p4, file$6, 243, 12, 8148);
    			add_location(section2, file$6, 236, 8, 7790);
    			attr_dev(div19, "class", "editor");
    			add_location(div19, file$6, 93, 4, 2618);
    			attr_dev(div20, "class", "title");
    			add_location(div20, file$6, 252, 12, 8502);
    			attr_dev(div21, "class", "companySide");
    			add_location(div21, file$6, 255, 20, 8675);
    			attr_dev(img, "class", "avatar");
    			if (!src_url_equal(img.src, img_src_value = "/public/img/gophers/gopher1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "ppimage");
    			add_location(img, file$6, 262, 20, 8980);
    			attr_dev(div22, "class", "jobStatusSide");
    			add_location(div22, file$6, 267, 20, 9167);
    			attr_dev(div23, "class", "leftSide");
    			add_location(div23, file$6, 254, 16, 8632);
    			attr_dev(div24, "class", "name");
    			add_location(div24, file$6, 274, 24, 9545);
    			attr_dev(div25, "class", "description");
    			add_location(div25, file$6, 275, 24, 9622);
    			attr_dev(div26, "class", "topSide");
    			add_location(div26, file$6, 273, 20, 9499);
    			attr_dev(div27, "class", "socialLinks");
    			add_location(div27, file$6, 279, 20, 9801);
    			attr_dev(div28, "class", "rightSide");
    			add_location(div28, file$6, 272, 16, 9455);
    			attr_dev(div29, "class", "gopher");
    			attr_dev(div29, "cardtype", div29_cardtype_value = /*preview*/ ctx[0].job_status);
    			add_location(div29, file$6, 253, 12, 8549);
    			attr_dev(button0, "class", "cancel");
    			add_location(button0, file$6, 341, 16, 13225);
    			attr_dev(button1, "class", "confirm");
    			button1.disabled = /*isSubmitButtonDisabled*/ ctx[7];
    			add_location(button1, file$6, 344, 16, 13356);
    			attr_dev(div30, "class", "actionButtons");
    			add_location(div30, file$6, 340, 12, 13181);
    			attr_dev(div31, "class", "previewSticky");
    			add_location(div31, file$6, 251, 8, 8462);
    			attr_dev(section3, "class", "preview");
    			add_location(section3, file$6, 250, 4, 8428);
    			attr_dev(div32, "class", "gopherEditor");
    			add_location(div32, file$6, 92, 0, 2587);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, show_info, anchor);
    			append_dev(show_info, h3);
    			append_dev(show_info, t2);
    			append_dev(show_info, p0);
    			append_dev(show_info, t4);
    			append_dev(show_info, p1);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div32, anchor);
    			append_dev(div32, div19);
    			append_dev(div19, section0);
    			append_dev(section0, div0);
    			append_dev(section0, t8);
    			append_dev(section0, div1);
    			append_dev(div1, b0);
    			append_dev(div1, t10);
    			append_dev(div1, input0);
    			set_input_value(input0, /*preview*/ ctx[0].name);
    			append_dev(section0, t11);
    			append_dev(section0, div2);
    			append_dev(div2, b1);
    			append_dev(div2, t13);
    			append_dev(div2, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(select0, option2);
    			/*select0_binding*/ ctx[11](select0);
    			append_dev(div2, t17);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(section0, t18);
    			append_dev(section0, div3);
    			append_dev(div3, b2);
    			append_dev(div3, t20);
    			append_dev(div3, select1);
    			append_dev(select1, option3);
    			append_dev(select1, option4);
    			append_dev(select1, option5);
    			select_option(select1, /*preview*/ ctx[0].job_status);
    			append_dev(section0, t24);
    			append_dev(section0, div4);
    			append_dev(div4, b3);
    			append_dev(div4, t26);
    			append_dev(div4, textarea);
    			set_input_value(textarea, /*preview*/ ctx[0].description);
    			append_dev(div19, t27);
    			append_dev(div19, section1);
    			append_dev(section1, div5);
    			append_dev(section1, t29);
    			append_dev(section1, div6);
    			append_dev(div6, b4);
    			append_dev(b4, i0);
    			append_dev(b4, t30);
    			append_dev(div6, t31);
    			append_dev(div6, input1);
    			set_input_value(input1, /*preview*/ ctx[0].social.github);
    			append_dev(section1, t32);
    			append_dev(section1, div7);
    			append_dev(div7, b5);
    			append_dev(b5, i1);
    			append_dev(b5, t33);
    			append_dev(div7, t34);
    			append_dev(div7, input2);
    			set_input_value(input2, /*preview*/ ctx[0].social.gitlab);
    			append_dev(section1, t35);
    			append_dev(section1, div8);
    			append_dev(div8, b6);
    			append_dev(b6, i2);
    			append_dev(b6, t36);
    			append_dev(div8, t37);
    			append_dev(div8, input3);
    			set_input_value(input3, /*preview*/ ctx[0].social.twitter);
    			append_dev(section1, t38);
    			append_dev(section1, div9);
    			append_dev(div9, b7);
    			append_dev(b7, i3);
    			append_dev(b7, t39);
    			append_dev(div9, t40);
    			append_dev(div9, input4);
    			set_input_value(input4, /*preview*/ ctx[0].social.facebook);
    			append_dev(section1, t41);
    			append_dev(section1, div10);
    			append_dev(div10, b8);
    			append_dev(b8, i4);
    			append_dev(b8, t42);
    			append_dev(div10, t43);
    			append_dev(div10, input5);
    			set_input_value(input5, /*preview*/ ctx[0].social.youtube);
    			append_dev(section1, t44);
    			append_dev(section1, div11);
    			append_dev(div11, b9);
    			append_dev(b9, i5);
    			append_dev(b9, t45);
    			append_dev(div11, t46);
    			append_dev(div11, input6);
    			set_input_value(input6, /*preview*/ ctx[0].social.instagram);
    			append_dev(section1, t47);
    			append_dev(section1, div12);
    			append_dev(div12, b10);
    			append_dev(b10, i6);
    			append_dev(b10, t48);
    			append_dev(div12, t49);
    			append_dev(div12, input7);
    			set_input_value(input7, /*preview*/ ctx[0].social.telegram);
    			append_dev(section1, t50);
    			append_dev(section1, div13);
    			append_dev(div13, b11);
    			append_dev(b11, i7);
    			append_dev(b11, t51);
    			append_dev(div13, t52);
    			append_dev(div13, input8);
    			set_input_value(input8, /*preview*/ ctx[0].social.linkedin);
    			append_dev(section1, t53);
    			append_dev(section1, div14);
    			append_dev(div14, b12);
    			append_dev(b12, i8);
    			append_dev(b12, t54);
    			append_dev(div14, t55);
    			append_dev(div14, input9);
    			set_input_value(input9, /*preview*/ ctx[0].social.reddit);
    			append_dev(section1, t56);
    			append_dev(section1, div15);
    			append_dev(div15, b13);
    			append_dev(b13, i9);
    			append_dev(b13, t57);
    			append_dev(div15, t58);
    			append_dev(div15, input10);
    			set_input_value(input10, /*preview*/ ctx[0].social.kommunity);
    			append_dev(section1, t59);
    			append_dev(section1, div16);
    			append_dev(div16, b14);
    			append_dev(b14, i10);
    			append_dev(b14, t60);
    			append_dev(div16, t61);
    			append_dev(div16, input11);
    			set_input_value(input11, /*preview*/ ctx[0].social.email);
    			append_dev(section1, t62);
    			append_dev(section1, div17);
    			append_dev(div17, b15);
    			append_dev(b15, i11);
    			append_dev(b15, t63);
    			append_dev(div17, t64);
    			append_dev(div17, input12);
    			set_input_value(input12, /*preview*/ ctx[0].social.website);
    			append_dev(div19, t65);
    			append_dev(div19, section2);
    			append_dev(section2, div18);
    			append_dev(section2, t67);
    			append_dev(section2, p2);
    			append_dev(section2, t69);
    			append_dev(section2, p3);
    			append_dev(p3, input13);
    			input13.checked = input13.__value === /*preferAvatar*/ ctx[1];
    			append_dev(p3, t70);
    			append_dev(p3, label0);
    			append_dev(section2, t72);
    			append_dev(section2, p4);
    			append_dev(p4, input14);
    			input14.checked = input14.__value === /*preferAvatar*/ ctx[1];
    			append_dev(p4, t73);
    			append_dev(p4, label1);
    			append_dev(div32, t75);
    			append_dev(div32, section3);
    			append_dev(section3, div31);
    			append_dev(div31, div20);
    			append_dev(div31, t77);
    			append_dev(div31, div29);
    			append_dev(div29, div23);
    			append_dev(div23, div21);
    			if_block1.m(div21, null);
    			append_dev(div23, t78);
    			append_dev(div23, img);
    			append_dev(div23, t79);
    			append_dev(div23, div22);
    			if (if_block2) if_block2.m(div22, null);
    			append_dev(div29, t80);
    			append_dev(div29, div28);
    			append_dev(div28, div26);
    			append_dev(div26, div24);
    			append_dev(div24, t81);
    			append_dev(div26, t82);
    			append_dev(div26, div25);
    			append_dev(div25, t83);
    			append_dev(div28, t84);
    			append_dev(div28, div27);
    			if (if_block3) if_block3.m(div27, null);
    			append_dev(div27, t85);
    			if (if_block4) if_block4.m(div27, null);
    			append_dev(div27, t86);
    			if (if_block5) if_block5.m(div27, null);
    			append_dev(div27, t87);
    			if (if_block6) if_block6.m(div27, null);
    			append_dev(div27, t88);
    			if (if_block7) if_block7.m(div27, null);
    			append_dev(div27, t89);
    			if (if_block8) if_block8.m(div27, null);
    			append_dev(div27, t90);
    			if (if_block9) if_block9.m(div27, null);
    			append_dev(div27, t91);
    			if (if_block10) if_block10.m(div27, null);
    			append_dev(div27, t92);
    			if (if_block11) if_block11.m(div27, null);
    			append_dev(div27, t93);
    			if (if_block12) if_block12.m(div27, null);
    			append_dev(div27, t94);
    			if (if_block13) if_block13.m(div27, null);
    			append_dev(div27, t95);
    			if (if_block14) if_block14.m(div27, null);
    			append_dev(div31, t96);
    			append_dev(div31, div30);
    			append_dev(div30, button0);
    			append_dev(div30, t98);
    			append_dev(div30, button1);
    			append_dev(button1, t99);
    			append_dev(div31, t100);
    			if (if_block15) if_block15.m(div31, null);
    			append_dev(div31, t101);
    			if (if_block16) if_block16.m(div31, null);
    			append_dev(div31, t102);
    			if (if_block17) if_block17.m(div31, null);
    			append_dev(div31, t103);
    			if (if_block18) if_block18.m(div31, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[10]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[13]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[14]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[15]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[16]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[17]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[18]),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[19]),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[20]),
    					listen_dev(input7, "input", /*input7_input_handler*/ ctx[21]),
    					listen_dev(input8, "input", /*input8_input_handler*/ ctx[22]),
    					listen_dev(input9, "input", /*input9_input_handler*/ ctx[23]),
    					listen_dev(input10, "input", /*input10_input_handler*/ ctx[24]),
    					listen_dev(input11, "input", /*input11_input_handler*/ ctx[25]),
    					listen_dev(input12, "input", /*input12_input_handler*/ ctx[26]),
    					listen_dev(input13, "change", /*input13_change_handler*/ ctx[27]),
    					listen_dev(input14, "change", /*input14_change_handler*/ ctx[29]),
    					listen_dev(button0, "click", /*goHome*/ ctx[9], false, false, false),
    					listen_dev(button1, "click", /*sendGopherData*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*preview*/ 1 && input0.value !== /*preview*/ ctx[0].name) {
    				set_input_value(input0, /*preview*/ ctx[0].name);
    			}

    			if (/*insertCompany*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*insertCompany*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_20$3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div2, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*preview*/ 1) {
    				select_option(select1, /*preview*/ ctx[0].job_status);
    			}

    			if (dirty & /*preview*/ 1) {
    				set_input_value(textarea, /*preview*/ ctx[0].description);
    			}

    			if (dirty & /*preview*/ 1 && input1.value !== /*preview*/ ctx[0].social.github) {
    				set_input_value(input1, /*preview*/ ctx[0].social.github);
    			}

    			if (dirty & /*preview*/ 1 && input2.value !== /*preview*/ ctx[0].social.gitlab) {
    				set_input_value(input2, /*preview*/ ctx[0].social.gitlab);
    			}

    			if (dirty & /*preview*/ 1 && input3.value !== /*preview*/ ctx[0].social.twitter) {
    				set_input_value(input3, /*preview*/ ctx[0].social.twitter);
    			}

    			if (dirty & /*preview*/ 1 && input4.value !== /*preview*/ ctx[0].social.facebook) {
    				set_input_value(input4, /*preview*/ ctx[0].social.facebook);
    			}

    			if (dirty & /*preview*/ 1 && input5.value !== /*preview*/ ctx[0].social.youtube) {
    				set_input_value(input5, /*preview*/ ctx[0].social.youtube);
    			}

    			if (dirty & /*preview*/ 1 && input6.value !== /*preview*/ ctx[0].social.instagram) {
    				set_input_value(input6, /*preview*/ ctx[0].social.instagram);
    			}

    			if (dirty & /*preview*/ 1 && input7.value !== /*preview*/ ctx[0].social.telegram) {
    				set_input_value(input7, /*preview*/ ctx[0].social.telegram);
    			}

    			if (dirty & /*preview*/ 1 && input8.value !== /*preview*/ ctx[0].social.linkedin) {
    				set_input_value(input8, /*preview*/ ctx[0].social.linkedin);
    			}

    			if (dirty & /*preview*/ 1 && input9.value !== /*preview*/ ctx[0].social.reddit) {
    				set_input_value(input9, /*preview*/ ctx[0].social.reddit);
    			}

    			if (dirty & /*preview*/ 1 && input10.value !== /*preview*/ ctx[0].social.kommunity) {
    				set_input_value(input10, /*preview*/ ctx[0].social.kommunity);
    			}

    			if (dirty & /*preview*/ 1 && input11.value !== /*preview*/ ctx[0].social.email) {
    				set_input_value(input11, /*preview*/ ctx[0].social.email);
    			}

    			if (dirty & /*preview*/ 1 && input12.value !== /*preview*/ ctx[0].social.website) {
    				set_input_value(input12, /*preview*/ ctx[0].social.website);
    			}

    			if (dirty & /*preferAvatar*/ 2) {
    				input13.checked = input13.__value === /*preferAvatar*/ ctx[1];
    			}

    			if (dirty & /*preferAvatar*/ 2) {
    				input14.checked = input14.__value === /*preferAvatar*/ ctx[1];
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div21, null);
    				}
    			}

    			if (current_block_type_1 !== (current_block_type_1 = select_block_type_1(ctx))) {
    				if (if_block2) if_block2.d(1);
    				if_block2 = current_block_type_1 && current_block_type_1(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div22, null);
    				}
    			}

    			if ((!current || dirty & /*preview*/ 1) && t81_value !== (t81_value = (/*preview*/ ctx[0].name || "John Doe") + "")) set_data_dev(t81, t81_value);
    			if ((!current || dirty & /*preview*/ 1) && t83_value !== (t83_value = (/*preview*/ ctx[0].description || "Açıklama Bulunmuyor") + "")) set_data_dev(t83, t83_value);

    			if (/*preview*/ ctx[0].social.github) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_15$3(ctx);
    					if_block3.c();
    					if_block3.m(div27, t85);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*preview*/ ctx[0].social.gitlab) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_14$3(ctx);
    					if_block4.c();
    					if_block4.m(div27, t86);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*preview*/ ctx[0].social.twitter) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_13$3(ctx);
    					if_block5.c();
    					if_block5.m(div27, t87);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*preview*/ ctx[0].social.facebook) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_12$3(ctx);
    					if_block6.c();
    					if_block6.m(div27, t88);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*preview*/ ctx[0].social.youtube) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_11$3(ctx);
    					if_block7.c();
    					if_block7.m(div27, t89);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (/*preview*/ ctx[0].social.instagram) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);
    				} else {
    					if_block8 = create_if_block_10$3(ctx);
    					if_block8.c();
    					if_block8.m(div27, t90);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (/*preview*/ ctx[0].social.telegram) {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);
    				} else {
    					if_block9 = create_if_block_9$3(ctx);
    					if_block9.c();
    					if_block9.m(div27, t91);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}

    			if (/*preview*/ ctx[0].social.linkedin) {
    				if (if_block10) {
    					if_block10.p(ctx, dirty);
    				} else {
    					if_block10 = create_if_block_8$3(ctx);
    					if_block10.c();
    					if_block10.m(div27, t92);
    				}
    			} else if (if_block10) {
    				if_block10.d(1);
    				if_block10 = null;
    			}

    			if (/*preview*/ ctx[0].social.reddit) {
    				if (if_block11) {
    					if_block11.p(ctx, dirty);
    				} else {
    					if_block11 = create_if_block_7$3(ctx);
    					if_block11.c();
    					if_block11.m(div27, t93);
    				}
    			} else if (if_block11) {
    				if_block11.d(1);
    				if_block11 = null;
    			}

    			if (/*preview*/ ctx[0].social.kommunity) {
    				if (if_block12) {
    					if_block12.p(ctx, dirty);
    				} else {
    					if_block12 = create_if_block_6$3(ctx);
    					if_block12.c();
    					if_block12.m(div27, t94);
    				}
    			} else if (if_block12) {
    				if_block12.d(1);
    				if_block12 = null;
    			}

    			if (/*preview*/ ctx[0].social.email) {
    				if (if_block13) {
    					if_block13.p(ctx, dirty);
    				} else {
    					if_block13 = create_if_block_5$3(ctx);
    					if_block13.c();
    					if_block13.m(div27, t95);
    				}
    			} else if (if_block13) {
    				if_block13.d(1);
    				if_block13 = null;
    			}

    			if (/*preview*/ ctx[0].social.website) {
    				if (if_block14) {
    					if_block14.p(ctx, dirty);
    				} else {
    					if_block14 = create_if_block_4$3(ctx);
    					if_block14.c();
    					if_block14.m(div27, null);
    				}
    			} else if (if_block14) {
    				if_block14.d(1);
    				if_block14 = null;
    			}

    			if (!current || dirty & /*preview*/ 1 && div29_cardtype_value !== (div29_cardtype_value = /*preview*/ ctx[0].job_status)) {
    				attr_dev(div29, "cardtype", div29_cardtype_value);
    			}

    			if (!current || dirty & /*isSubmitButtonDisabled*/ 128) {
    				prop_dev(button1, "disabled", /*isSubmitButtonDisabled*/ ctx[7]);
    			}

    			if (/*showInfo*/ ctx[4]) {
    				if (if_block15) {
    					if_block15.p(ctx, dirty);
    				} else {
    					if_block15 = create_if_block_3$3(ctx);
    					if_block15.c();
    					if_block15.m(div31, t101);
    				}
    			} else if (if_block15) {
    				if_block15.d(1);
    				if_block15 = null;
    			}

    			if (/*showError*/ ctx[5]) {
    				if (if_block16) {
    					if_block16.p(ctx, dirty);
    				} else {
    					if_block16 = create_if_block_2$3(ctx);
    					if_block16.c();
    					if_block16.m(div31, t102);
    				}
    			} else if (if_block16) {
    				if_block16.d(1);
    				if_block16 = null;
    			}

    			if (/*preview*/ ctx[0].name == "" || /*preview*/ ctx[0].name == undefined) {
    				if (if_block17) ; else {
    					if_block17 = create_if_block_1$4(ctx);
    					if_block17.c();
    					if_block17.m(div31, t103);
    				}
    			} else if (if_block17) {
    				if_block17.d(1);
    				if_block17 = null;
    			}

    			if (/*preferAvatar*/ ctx[1] == "twitter" && (/*preview*/ ctx[0].social.twitter == undefined || /*preview*/ ctx[0].social.twitter == "")) {
    				if (if_block18) ; else {
    					if_block18 = create_if_block$4(ctx);
    					if_block18.c();
    					if_block18.m(div31, null);
    				}
    			} else if (if_block18) {
    				if_block18.d(1);
    				if_block18 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);

    			add_render_callback(() => {
    				if (!div29_transition) div29_transition = create_bidirectional_transition(div29, fade, {}, true);
    				div29_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			if (!div29_transition) div29_transition = create_bidirectional_transition(div29, fade, {}, false);
    			div29_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(show_info);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div32);
    			/*select0_binding*/ ctx[11](null);
    			if (if_block0) if_block0.d();
    			/*$$binding_groups*/ ctx[28][0].splice(/*$$binding_groups*/ ctx[28][0].indexOf(input13), 1);
    			/*$$binding_groups*/ ctx[28][0].splice(/*$$binding_groups*/ ctx[28][0].indexOf(input14), 1);
    			if_block1.d();

    			if (if_block2) {
    				if_block2.d();
    			}

    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			if (if_block8) if_block8.d();
    			if (if_block9) if_block9.d();
    			if (if_block10) if_block10.d();
    			if (if_block11) if_block11.d();
    			if (if_block12) if_block12.d();
    			if (if_block13) if_block13.d();
    			if (if_block14) if_block14.d();
    			if (detaching && div29_transition) div29_transition.end();
    			if (if_block15) if_block15.d();
    			if (if_block16) if_block16.d();
    			if (if_block17) if_block17.d();
    			if (if_block18) if_block18.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let isSubmitButtonDisabled;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('add-gopher', slots, []);
    	let gopherData = null;
    	let insertCompany = false;
    	let jobSelector;

    	onMount(() => {
    		$$invalidate(
    			3,
    			jobSelector.onchange = e => {
    				let jobValue = e.target.value;

    				if (jobValue == "company") {
    					$$invalidate(0, preview.company = "", preview);
    					$$invalidate(2, insertCompany = true);
    				} else if (jobValue == "freelancer") {
    					$$invalidate(0, preview.company = "freelancer", preview);
    					$$invalidate(2, insertCompany = false);
    				} else {
    					$$invalidate(0, preview.company = null, preview);
    					$$invalidate(2, insertCompany = false);
    				}
    			},
    			jobSelector
    		);
    	});

    	let preview = {
    		name: null,
    		company: null,
    		job_status: "",
    		description: null,
    		profile_img_url: null,
    		social: { twitter: null, github: null }
    	};

    	let preferAvatar = "randomGopher";
    	let showInfo = false;
    	let showError = false;
    	let processMessage = "";

    	const sendGopherData = () => {
    		let req = new XMLHttpRequest();
    		req.open("POST", "/api/gopher/add", true);
    		req.setRequestHeader('Content-Type', 'application/json');

    		req.onload = () => {
    			if (req.status == 200) {
    				let resp = JSON.parse(req.responseText);
    				$$invalidate(4, showInfo = true);
    				$$invalidate(5, showError = false);
    				$$invalidate(6, processMessage = resp.message);

    				setTimeout(
    					() => {
    						location.href = "/";
    					},
    					3000
    				);
    			} else if (req.status != 200) {
    				let resp = JSON.parse(req.responseText);
    				$$invalidate(4, showInfo = false);
    				$$invalidate(5, showError = true);
    				$$invalidate(6, processMessage = resp.message);
    			}
    		};

    		req.send(JSON.stringify({
    			"gopher": preview,
    			"avatar_method": preferAvatar
    		}));
    	};

    	const goHome = () => {
    		location.href = "/";
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<add-gopher> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input0_input_handler() {
    		preview.name = this.value;
    		$$invalidate(0, preview);
    	}

    	function select0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			jobSelector = $$value;
    			$$invalidate(3, jobSelector);
    		});
    	}

    	function input_input_handler() {
    		preview.company = this.value;
    		$$invalidate(0, preview);
    	}

    	function select1_change_handler() {
    		preview.job_status = select_value(this);
    		$$invalidate(0, preview);
    	}

    	function textarea_input_handler() {
    		preview.description = this.value;
    		$$invalidate(0, preview);
    	}

    	function input1_input_handler() {
    		preview.social.github = this.value;
    		$$invalidate(0, preview);
    	}

    	function input2_input_handler() {
    		preview.social.gitlab = this.value;
    		$$invalidate(0, preview);
    	}

    	function input3_input_handler() {
    		preview.social.twitter = this.value;
    		$$invalidate(0, preview);
    	}

    	function input4_input_handler() {
    		preview.social.facebook = this.value;
    		$$invalidate(0, preview);
    	}

    	function input5_input_handler() {
    		preview.social.youtube = this.value;
    		$$invalidate(0, preview);
    	}

    	function input6_input_handler() {
    		preview.social.instagram = this.value;
    		$$invalidate(0, preview);
    	}

    	function input7_input_handler() {
    		preview.social.telegram = this.value;
    		$$invalidate(0, preview);
    	}

    	function input8_input_handler() {
    		preview.social.linkedin = this.value;
    		$$invalidate(0, preview);
    	}

    	function input9_input_handler() {
    		preview.social.reddit = this.value;
    		$$invalidate(0, preview);
    	}

    	function input10_input_handler() {
    		preview.social.kommunity = this.value;
    		$$invalidate(0, preview);
    	}

    	function input11_input_handler() {
    		preview.social.email = this.value;
    		$$invalidate(0, preview);
    	}

    	function input12_input_handler() {
    		preview.social.website = this.value;
    		$$invalidate(0, preview);
    	}

    	function input13_change_handler() {
    		preferAvatar = this.__value;
    		$$invalidate(1, preferAvatar);
    	}

    	function input14_change_handler() {
    		preferAvatar = this.__value;
    		$$invalidate(1, preferAvatar);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		fade,
    		ShowInfo: Info,
    		gopherData,
    		insertCompany,
    		jobSelector,
    		preview,
    		preferAvatar,
    		showInfo,
    		showError,
    		processMessage,
    		sendGopherData,
    		goHome,
    		isSubmitButtonDisabled
    	});

    	$$self.$inject_state = $$props => {
    		if ('gopherData' in $$props) gopherData = $$props.gopherData;
    		if ('insertCompany' in $$props) $$invalidate(2, insertCompany = $$props.insertCompany);
    		if ('jobSelector' in $$props) $$invalidate(3, jobSelector = $$props.jobSelector);
    		if ('preview' in $$props) $$invalidate(0, preview = $$props.preview);
    		if ('preferAvatar' in $$props) $$invalidate(1, preferAvatar = $$props.preferAvatar);
    		if ('showInfo' in $$props) $$invalidate(4, showInfo = $$props.showInfo);
    		if ('showError' in $$props) $$invalidate(5, showError = $$props.showError);
    		if ('processMessage' in $$props) $$invalidate(6, processMessage = $$props.processMessage);
    		if ('isSubmitButtonDisabled' in $$props) $$invalidate(7, isSubmitButtonDisabled = $$props.isSubmitButtonDisabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*preview, preferAvatar*/ 3) {
    			$$invalidate(7, isSubmitButtonDisabled = !preview.name || preferAvatar == "twitter" && !preview.social.twitter);
    		}
    	};

    	return [
    		preview,
    		preferAvatar,
    		insertCompany,
    		jobSelector,
    		showInfo,
    		showError,
    		processMessage,
    		isSubmitButtonDisabled,
    		sendGopherData,
    		goHome,
    		input0_input_handler,
    		select0_binding,
    		input_input_handler,
    		select1_change_handler,
    		textarea_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input7_input_handler,
    		input8_input_handler,
    		input9_input_handler,
    		input10_input_handler,
    		input11_input_handler,
    		input12_input_handler,
    		input13_change_handler,
    		$$binding_groups,
    		input14_change_handler
    	];
    }

    class AddGopher extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>.processInfo{color:white;background-color:green;padding:10px;margin-top:20px;box-shadow:0px 3px 10px rgba(0, 0, 0, 0.3);border-radius:2px}.error{color:white;background-color:darkred;padding:10px;border-radius:2px;box-shadow:0px 3px 10px rgba(0, 0, 0, 0.3);margin-top:20px}.gopherEditor{display:flex;gap:20px;flex-wrap:wrap}.editor{position:relative;min-width:300px;flex:1;padding:20px;background-color:rgb(245, 245, 245);box-shadow:0px 3px 10px rgba(0, 0, 0, 0.3);color:rgb(73, 73, 73);border-radius:2px}.editor .title{font-size:25px;font-weight:bold;color:rgb(20, 20, 20)}.column{display:flex;justify-content:space-between;align-items:center;gap:10px}.column b{flex:1;display:flex;flex-direction:row;align-items:center}b>i{filter:invert(1);margin-right:10px}.descolumn{display:flex;flex-direction:column;gap:10px}.descolumn textarea{color:rgb(73, 73, 73);border-radius:2px;border:none;padding:10px;font-size:16px;width:100%;height:100px;resize:none;margin-bottom:30px;background-color:rgb(240, 240, 240);box-shadow:0px 3px 5px rgba(0, 0, 0, 0.3)}textarea:focus{outline-color:#411f89}textarea::placeholder{color:rgb(104, 102, 102)}.editor input[type="text"]{padding:10px 20px;font-size:16px;border-radius:2px;border:0px;background-color:rgb(240, 240, 240);color:rgb(73, 73, 73);width:200px;margin-bottom:10px;float:right;flex:1;box-shadow:0px 3px 5px rgba(0, 0, 0, 0.3)}input[type="text"]::placeholder{color:rgb(165, 165, 165)}.editor input[type="text"]:focus{outline-color:#411f89}.editor select{font-size:16px;padding:10px 20px;border-radius:2px;border:0px;background-color:rgb(240, 240, 240);color:rgb(73, 73, 73);width:200px;margin-bottom:10px;float:right;flex:1;box-shadow:0px 3px 5px rgba(0, 0, 0, 0.3)}.editor select:focus{outline-color:#411f89}.preview{position:relative;width:100%;max-width:400px;height:1000px}.previewSticky{position:sticky;top:90px}.preview .title{font-size:25px;font-weight:bold;color:rgb(26, 26, 26)}.actionButtons{width:100%;display:flex;margin-top:30px}.cancel{flex:1;background-color:transparent;color:rgb(124, 123, 123);font-size:16px;border:0;padding:10px 20px;cursor:pointer;opacity:0.8}.cancel:hover{opacity:1}.confirm{flex:1;background-color:#53309e;color:white;font-size:16px;padding:10px 20px;border:0px;cursor:pointer;border-radius:2px;box-shadow:0px 3px 5px rgba(0, 0, 0, 0.3);transition:background-color 0.5s}.confirm:disabled{cursor:not-allowed;opacity:.5}.confirm:hover{background-color:#411f89}i{background-size:24px;background-repeat:no-repeat;width:24px;height:24px;display:inline-block;opacity:0.7;transition:opacity 0.3s}i:hover{opacity:1}.github{background:url("/public/img/icons/github.png")}.gitlab{background:url("/public/img/icons/gitlab.png")}.twitter{background:url("/public/img/icons/twitter.png")}.facebook{background:url("/public/img/icons/facebook.png")}.youtube{background:url("/public/img/icons/youtube.png")}.telegram{background:url("/public/img/icons/telegram.png")}.linkedin{background:url("/public/img/icons/linkedin.png")}.reddit{background:url("/public/img/icons/reddit.png")}.instagram{background:url("/public/img/icons/instagram.png")}.email{background:url("/public/img/icons/email.png")}.website{background:url("/public/img/icons/website.png")}.kommunity{background:url("/public/img/icons/kommunity.png")}</style>`;

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$6,
    			create_fragment$6,
    			safe_not_equal,
    			{},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("add-gopher", AddGopher);

    /* src/ReadMe.svelte generated by Svelte v3.44.2 */

    const file$5 = "src/ReadMe.svelte";

    function create_fragment$5(ctx) {
    	let div5;
    	let div0;
    	let t1;
    	let p0;
    	let t3;
    	let div1;
    	let t5;
    	let p1;
    	let t6;
    	let b0;
    	let t8;
    	let t9;
    	let p2;
    	let t10;
    	let b1;
    	let t12;
    	let t13;
    	let p3;
    	let t15;
    	let p4;
    	let t17;
    	let div2;
    	let t19;
    	let ul;
    	let li0;
    	let t20;
    	let a0;
    	let t22;
    	let li1;
    	let t23;
    	let a1;
    	let t25;
    	let li2;
    	let t26;
    	let a2;
    	let t28;
    	let li3;
    	let t29;
    	let a3;
    	let t31;
    	let li4;
    	let t32;
    	let a4;
    	let t34;
    	let li5;
    	let t35;
    	let a5;
    	let t37;
    	let div3;
    	let t39;
    	let p5;
    	let t40;
    	let a6;
    	let t42;
    	let t43;
    	let div4;
    	let t45;
    	let p6;
    	let t46;
    	let a7;
    	let t48;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			div0.textContent = "Amaç";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Bu uygulamanın amacı Go programlama dili ile ilgilenelerin (Gopher'ların) birbirleri ile irtibatta bulunabilmelerini kolaylaştırmak, iş arayan ve işçi arayan şahıs veya şirketlere kolaylık sağlamaktır.";
    			t3 = space();
    			div1 = element("div");
    			div1.textContent = "Nasıl Düzenleme Yapılır?";
    			t5 = space();
    			p1 = element("p");
    			t6 = text("Bir Gopher'ı düzenlemek için profil resminin üzerinde gelip ");
    			b0 = element("b");
    			b0.textContent = "kalem ikonuna";
    			t8 = text(" tıklayın.\n        Ardından düzenlemek istediğiniz kısımlarda değişiklik yapın.");
    			t9 = space();
    			p2 = element("p");
    			t10 = text("Daha sonra ");
    			b1 = element("b");
    			b1.textContent = "Düzenleme isteğinde Bulun";
    			t12 = text(" butonuna basabilirsiniz.");
    			t13 = space();
    			p3 = element("p");
    			p3.textContent = "Yönetici onayından sonra değişiklikler görüntülenebilecektir.";
    			t15 = space();
    			p4 = element("p");
    			p4.textContent = "Silme isteğini de düzenleme sayfasından gönderebilirsiniz.";
    			t17 = space();
    			div2 = element("div");
    			div2.textContent = "Kullanılan Teknolojiler";
    			t19 = space();
    			ul = element("ul");
    			li0 = element("li");
    			t20 = text("Go → ");
    			a0 = element("a");
    			a0.textContent = "Website";
    			t22 = space();
    			li1 = element("li");
    			t23 = text("Gofiber → ");
    			a1 = element("a");
    			a1.textContent = "Website";
    			t25 = space();
    			li2 = element("li");
    			t26 = text("Svelte.js → ");
    			a2 = element("a");
    			a2.textContent = "Website";
    			t28 = space();
    			li3 = element("li");
    			t29 = text("MongoDB → ");
    			a3 = element("a");
    			a3.textContent = "Website";
    			t31 = space();
    			li4 = element("li");
    			t32 = text("go-twitter → ");
    			a4 = element("a");
    			a4.textContent = "GitHub";
    			t34 = space();
    			li5 = element("li");
    			t35 = text("Heroku → ");
    			a5 = element("a");
    			a5.textContent = "Website";
    			t37 = space();
    			div3 = element("div");
    			div3.textContent = "İletişim";
    			t39 = space();
    			p5 = element("p");
    			t40 = text("Uygulama hakkında görüş veya şikayet bildirmek için Twitter üzerinden Kaan Kuscu(");
    			a6 = element("a");
    			a6.textContent = "@ksckaan1";
    			t42 = text(") kullanıcısına DM yoluyla iletişim kurabilirsiniz.");
    			t43 = space();
    			div4 = element("div");
    			div4.textContent = "Katkıda Bulunun";
    			t45 = space();
    			p6 = element("p");
    			t46 = text("Katkıda bulunmak için ");
    			a7 = element("a");
    			a7.textContent = "GitHub reposu";
    			t48 = text("'na PR'da bulunabilirsiniz.");
    			this.c = noop;
    			attr_dev(div0, "class", "title");
    			add_location(div0, file$5, 5, 4, 79);
    			add_location(p0, file$5, 6, 4, 113);
    			attr_dev(div1, "class", "title");
    			add_location(div1, file$5, 8, 4, 327);
    			add_location(b0, file$5, 9, 67, 444);
    			add_location(p1, file$5, 9, 4, 381);
    			add_location(b1, file$5, 13, 19, 580);
    			add_location(p2, file$5, 12, 4, 557);
    			add_location(p3, file$5, 15, 4, 651);
    			add_location(p4, file$5, 18, 4, 738);
    			attr_dev(div2, "class", "title");
    			add_location(div2, file$5, 22, 4, 823);
    			attr_dev(a0, "href", "https://golang.org");
    			add_location(a0, file$5, 24, 28, 909);
    			add_location(li0, file$5, 24, 8, 889);
    			attr_dev(a1, "href", "https://gofiber.io");
    			add_location(a1, file$5, 25, 33, 988);
    			add_location(li1, file$5, 25, 8, 963);
    			attr_dev(a2, "href", "https://svelte.dev");
    			add_location(a2, file$5, 26, 35, 1069);
    			add_location(li2, file$5, 26, 8, 1042);
    			attr_dev(a3, "href", "https://www.mongodb.com");
    			add_location(a3, file$5, 27, 33, 1148);
    			add_location(li3, file$5, 27, 8, 1123);
    			attr_dev(a4, "href", "https://github.com/dghubble/go-twitter");
    			add_location(a4, file$5, 28, 36, 1235);
    			add_location(li4, file$5, 28, 8, 1207);
    			attr_dev(a5, "href", "https://heroku.com");
    			add_location(a5, file$5, 29, 32, 1332);
    			add_location(li5, file$5, 29, 8, 1308);
    			add_location(ul, file$5, 23, 4, 876);
    			attr_dev(div3, "class", "title");
    			add_location(div3, file$5, 31, 4, 1392);
    			attr_dev(a6, "href", "https://twitter.com/ksckaan1");
    			add_location(a6, file$5, 32, 88, 1514);
    			add_location(p5, file$5, 32, 4, 1430);
    			attr_dev(div4, "class", "title");
    			add_location(div4, file$5, 33, 4, 1626);
    			attr_dev(a7, "href", "https://github.com/ksckaan1/gophertr");
    			add_location(a7, file$5, 34, 29, 1696);
    			add_location(p6, file$5, 34, 4, 1671);
    			attr_dev(div5, "class", "content");
    			add_location(div5, file$5, 4, 0, 53);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div5, t1);
    			append_dev(div5, p0);
    			append_dev(div5, t3);
    			append_dev(div5, div1);
    			append_dev(div5, t5);
    			append_dev(div5, p1);
    			append_dev(p1, t6);
    			append_dev(p1, b0);
    			append_dev(p1, t8);
    			append_dev(div5, t9);
    			append_dev(div5, p2);
    			append_dev(p2, t10);
    			append_dev(p2, b1);
    			append_dev(p2, t12);
    			append_dev(div5, t13);
    			append_dev(div5, p3);
    			append_dev(div5, t15);
    			append_dev(div5, p4);
    			append_dev(div5, t17);
    			append_dev(div5, div2);
    			append_dev(div5, t19);
    			append_dev(div5, ul);
    			append_dev(ul, li0);
    			append_dev(li0, t20);
    			append_dev(li0, a0);
    			append_dev(ul, t22);
    			append_dev(ul, li1);
    			append_dev(li1, t23);
    			append_dev(li1, a1);
    			append_dev(ul, t25);
    			append_dev(ul, li2);
    			append_dev(li2, t26);
    			append_dev(li2, a2);
    			append_dev(ul, t28);
    			append_dev(ul, li3);
    			append_dev(li3, t29);
    			append_dev(li3, a3);
    			append_dev(ul, t31);
    			append_dev(ul, li4);
    			append_dev(li4, t32);
    			append_dev(li4, a4);
    			append_dev(ul, t34);
    			append_dev(ul, li5);
    			append_dev(li5, t35);
    			append_dev(li5, a5);
    			append_dev(div5, t37);
    			append_dev(div5, div3);
    			append_dev(div5, t39);
    			append_dev(div5, p5);
    			append_dev(p5, t40);
    			append_dev(p5, a6);
    			append_dev(p5, t42);
    			append_dev(div5, t43);
    			append_dev(div5, div4);
    			append_dev(div5, t45);
    			append_dev(div5, p6);
    			append_dev(p6, t46);
    			append_dev(p6, a7);
    			append_dev(p6, t48);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('read-me', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<read-me> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class ReadMe extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>a{color:black}.content{padding:20px;background-color:rgb(245, 245, 245);box-shadow:0px 3px 10px rgba(0, 0, 0, 0.3);color:rgb(73, 73, 73);border-radius:2px}.title{font-size:25px;font-weight:bold}</style>`;

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$5,
    			create_fragment$5,
    			safe_not_equal,
    			{},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("read-me", ReadMe);

    /* src/FooterZone.svelte generated by Svelte v3.44.2 */

    const file$4 = "src/FooterZone.svelte";

    function create_fragment$4(ctx) {
    	let footer;
    	let span;
    	let t0;
    	let a0;
    	let t2;
    	let a1;
    	let t4;
    	let a2;
    	let t6;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			span = element("span");
    			t0 = text("Created by ");
    			a0 = element("a");
    			a0.textContent = "©Kaan Kuscu";
    			t2 = text(" with ");
    			a1 = element("a");
    			a1.textContent = "Gofiber";
    			t4 = text(" and ");
    			a2 = element("a");
    			a2.textContent = "Svelte.js";
    			t6 = text(".");
    			this.c = noop;
    			attr_dev(a0, "href", "https://kaanksc.com");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$4, 5, 21, 86);
    			attr_dev(a1, "href", "https://gofiber.io");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$4, 5, 93, 158);
    			attr_dev(a2, "href", "https://svelte.dev");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$4, 5, 154, 219);
    			add_location(span, file$4, 5, 4, 69);
    			add_location(footer, file$4, 4, 0, 56);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, span);
    			append_dev(span, t0);
    			append_dev(span, a0);
    			append_dev(span, t2);
    			append_dev(span, a1);
    			append_dev(span, t4);
    			append_dev(span, a2);
    			append_dev(span, t6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('footer-zone', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<footer-zone> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class FooterZone extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>footer{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:10px;width:90%;height:100px;color:rgb(95, 94, 94);margin:auto}footer a{text-decoration:none;font-weight:500;color:rgb(75, 75, 75)}footer span{text-align:center}</style>`;

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$4,
    			create_fragment$4,
    			safe_not_equal,
    			{},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("footer-zone", FooterZone);

    /* src/EditGopher.svelte generated by Svelte v3.44.2 */
    const file$3 = "src/EditGopher.svelte";

    // (423:0) {:else}
    function create_else_block_1$1(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			div0.textContent = "Gopher hazırlanıyor...";
    			if (!src_url_equal(img.src, img_src_value = "/public/img/loading.gif")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "gopher");
    			add_location(img, file$3, 424, 4, 15859);
    			attr_dev(div0, "class", "loadingText");
    			add_location(div0, file$3, 425, 4, 15912);
    			attr_dev(div1, "class", "loader");
    			add_location(div1, file$3, 423, 0, 15834);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(423:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (142:0) {#if isGopherLoaded}
    function create_if_block$3(ctx) {
    	let div32;
    	let div19;
    	let section0;
    	let div0;
    	let t1;
    	let div1;
    	let b0;
    	let t3;
    	let input0;
    	let t4;
    	let div2;
    	let b1;
    	let t6;
    	let select0;
    	let option0;
    	let option1;
    	let option2;
    	let t10;
    	let t11;
    	let div3;
    	let b2;
    	let t13;
    	let select1;
    	let option3;
    	let option4;
    	let option5;
    	let t17;
    	let div4;
    	let b3;
    	let t19;
    	let textarea;
    	let t20;
    	let section1;
    	let div5;
    	let t22;
    	let div6;
    	let b4;
    	let i0;
    	let t23;
    	let t24;
    	let input1;
    	let t25;
    	let div7;
    	let b5;
    	let i1;
    	let t26;
    	let t27;
    	let input2;
    	let t28;
    	let div8;
    	let b6;
    	let i2;
    	let t29;
    	let t30;
    	let input3;
    	let t31;
    	let div9;
    	let b7;
    	let i3;
    	let t32;
    	let t33;
    	let input4;
    	let t34;
    	let div10;
    	let b8;
    	let i4;
    	let t35;
    	let t36;
    	let input5;
    	let t37;
    	let div11;
    	let b9;
    	let i5;
    	let t38;
    	let t39;
    	let input6;
    	let t40;
    	let div12;
    	let b10;
    	let i6;
    	let t41;
    	let t42;
    	let input7;
    	let t43;
    	let div13;
    	let b11;
    	let i7;
    	let t44;
    	let t45;
    	let input8;
    	let t46;
    	let div14;
    	let b12;
    	let i8;
    	let t47;
    	let t48;
    	let input9;
    	let t49;
    	let div15;
    	let b13;
    	let i9;
    	let t50;
    	let t51;
    	let input10;
    	let t52;
    	let div16;
    	let b14;
    	let i10;
    	let t53;
    	let t54;
    	let input11;
    	let t55;
    	let div17;
    	let b15;
    	let i11;
    	let t56;
    	let t57;
    	let input12;
    	let t58;
    	let section2;
    	let div18;
    	let t60;
    	let p0;
    	let t62;
    	let p1;
    	let input13;
    	let t63;
    	let label0;
    	let t65;
    	let p2;
    	let input14;
    	let t66;
    	let label1;
    	let t68;
    	let section3;
    	let div31;
    	let div20;
    	let t70;
    	let div29;
    	let div23;
    	let div21;
    	let t71;
    	let img;
    	let img_src_value;
    	let t72;
    	let div22;
    	let t73;
    	let div28;
    	let div26;
    	let div24;
    	let t74_value = (/*preview*/ ctx[0].name || "John Doe") + "";
    	let t74;
    	let t75;
    	let div25;
    	let t76_value = (/*preview*/ ctx[0].description || "Açıklama Bulunmuyor") + "";
    	let t76;
    	let t77;
    	let div27;
    	let t78;
    	let t79;
    	let t80;
    	let t81;
    	let t82;
    	let t83;
    	let t84;
    	let t85;
    	let t86;
    	let t87;
    	let t88;
    	let div29_cardtype_value;
    	let div29_transition;
    	let t89;
    	let div30;
    	let button0;
    	let t91;
    	let button1;
    	let t93;
    	let button2;
    	let t94;
    	let t95;
    	let t96;
    	let t97;
    	let t98;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*insertCompany*/ ctx[2] && create_if_block_21$1(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*preview*/ ctx[0].company == "freelancer") return create_if_block_20$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block1 = current_block_type(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*preview*/ ctx[0].job_status == "looking") return create_if_block_17$2;
    		if (/*preview*/ ctx[0].job_status == "hiring") return create_if_block_18$2;
    		if (/*preview*/ ctx[0].company) return create_if_block_19$2;
    	}

    	let current_block_type_1 = select_block_type_2(ctx);
    	let if_block2 = current_block_type_1 && current_block_type_1(ctx);
    	let if_block3 = /*preview*/ ctx[0].social.github && create_if_block_16$2(ctx);
    	let if_block4 = /*preview*/ ctx[0].social.gitlab && create_if_block_15$2(ctx);
    	let if_block5 = /*preview*/ ctx[0].social.twitter && create_if_block_14$2(ctx);
    	let if_block6 = /*preview*/ ctx[0].social.facebook && create_if_block_13$2(ctx);
    	let if_block7 = /*preview*/ ctx[0].social.youtube && create_if_block_12$2(ctx);
    	let if_block8 = /*preview*/ ctx[0].social.instagram && create_if_block_11$2(ctx);
    	let if_block9 = /*preview*/ ctx[0].social.telegram && create_if_block_10$2(ctx);
    	let if_block10 = /*preview*/ ctx[0].social.linkedin && create_if_block_9$2(ctx);
    	let if_block11 = /*preview*/ ctx[0].social.reddit && create_if_block_8$2(ctx);
    	let if_block12 = /*preview*/ ctx[0].social.kommunity && create_if_block_7$2(ctx);
    	let if_block13 = /*preview*/ ctx[0].social.email && create_if_block_6$2(ctx);
    	let if_block14 = /*preview*/ ctx[0].social.website && create_if_block_5$2(ctx);
    	let if_block15 = /*showInfo*/ ctx[4] && create_if_block_4$2(ctx);
    	let if_block16 = /*showError*/ ctx[5] && create_if_block_3$2(ctx);
    	let if_block17 = (/*preview*/ ctx[0].name == "" || /*preview*/ ctx[0].name == undefined) && create_if_block_2$2(ctx);
    	let if_block18 = /*preferAvatar*/ ctx[1] == "twitter" && (/*preview*/ ctx[0].social.twitter == undefined || /*preview*/ ctx[0].social.twitter == "") && create_if_block_1$3(ctx);

    	const block = {
    		c: function create() {
    			div32 = element("div");
    			div19 = element("div");
    			section0 = element("section");
    			div0 = element("div");
    			div0.textContent = "Temel Bilgiler";
    			t1 = space();
    			div1 = element("div");
    			b0 = element("b");
    			b0.textContent = "Ad ve Soyad:";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div2 = element("div");
    			b1 = element("b");
    			b1.textContent = "Çalışma Durumu:";
    			t6 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Serbest Çalışıyor";
    			option1 = element("option");
    			option1.textContent = "Şirkette Çalışıyor";
    			option2 = element("option");
    			option2.textContent = "Çalışmıyor";
    			t10 = space();
    			if (if_block0) if_block0.c();
    			t11 = space();
    			div3 = element("div");
    			b2 = element("b");
    			b2.textContent = "Arayış Durumu:";
    			t13 = space();
    			select1 = element("select");
    			option3 = element("option");
    			option3.textContent = "İş Arıyor";
    			option4 = element("option");
    			option4.textContent = "Çalışan Arıyor";
    			option5 = element("option");
    			option5.textContent = "Belirtilmemiş";
    			t17 = space();
    			div4 = element("div");
    			b3 = element("b");
    			b3.textContent = "Açıklama:";
    			t19 = space();
    			textarea = element("textarea");
    			t20 = space();
    			section1 = element("section");
    			div5 = element("div");
    			div5.textContent = "İletişim";
    			t22 = space();
    			div6 = element("div");
    			b4 = element("b");
    			i0 = element("i");
    			t23 = text(" GitHub:");
    			t24 = space();
    			input1 = element("input");
    			t25 = space();
    			div7 = element("div");
    			b5 = element("b");
    			i1 = element("i");
    			t26 = text(" GitLab:");
    			t27 = space();
    			input2 = element("input");
    			t28 = space();
    			div8 = element("div");
    			b6 = element("b");
    			i2 = element("i");
    			t29 = text(" Twitter:");
    			t30 = space();
    			input3 = element("input");
    			t31 = space();
    			div9 = element("div");
    			b7 = element("b");
    			i3 = element("i");
    			t32 = text(" Facebook:");
    			t33 = space();
    			input4 = element("input");
    			t34 = space();
    			div10 = element("div");
    			b8 = element("b");
    			i4 = element("i");
    			t35 = text(" YouTube:");
    			t36 = space();
    			input5 = element("input");
    			t37 = space();
    			div11 = element("div");
    			b9 = element("b");
    			i5 = element("i");
    			t38 = text(" Instagram:");
    			t39 = space();
    			input6 = element("input");
    			t40 = space();
    			div12 = element("div");
    			b10 = element("b");
    			i6 = element("i");
    			t41 = text(" Telegram:");
    			t42 = space();
    			input7 = element("input");
    			t43 = space();
    			div13 = element("div");
    			b11 = element("b");
    			i7 = element("i");
    			t44 = text(" LinkedIn:");
    			t45 = space();
    			input8 = element("input");
    			t46 = space();
    			div14 = element("div");
    			b12 = element("b");
    			i8 = element("i");
    			t47 = text(" Reddit:");
    			t48 = space();
    			input9 = element("input");
    			t49 = space();
    			div15 = element("div");
    			b13 = element("b");
    			i9 = element("i");
    			t50 = text(" Kommunity:");
    			t51 = space();
    			input10 = element("input");
    			t52 = space();
    			div16 = element("div");
    			b14 = element("b");
    			i10 = element("i");
    			t53 = text(" E-Mail:");
    			t54 = space();
    			input11 = element("input");
    			t55 = space();
    			div17 = element("div");
    			b15 = element("b");
    			i11 = element("i");
    			t56 = text(" Website:");
    			t57 = space();
    			input12 = element("input");
    			t58 = space();
    			section2 = element("section");
    			div18 = element("div");
    			div18.textContent = "Gopher Avatar";
    			t60 = space();
    			p0 = element("p");
    			p0.textContent = "Profil resmini kullanma tercihini yapın";
    			t62 = space();
    			p1 = element("p");
    			input13 = element("input");
    			t63 = space();
    			label0 = element("label");
    			label0.textContent = "Rastgele Gopher resmi kullan";
    			t65 = space();
    			p2 = element("p");
    			input14 = element("input");
    			t66 = space();
    			label1 = element("label");
    			label1.textContent = "Twitter profil resmini kullan";
    			t68 = space();
    			section3 = element("section");
    			div31 = element("div");
    			div20 = element("div");
    			div20.textContent = "Ön izleme";
    			t70 = space();
    			div29 = element("div");
    			div23 = element("div");
    			div21 = element("div");
    			if_block1.c();
    			t71 = space();
    			img = element("img");
    			t72 = space();
    			div22 = element("div");
    			if (if_block2) if_block2.c();
    			t73 = space();
    			div28 = element("div");
    			div26 = element("div");
    			div24 = element("div");
    			t74 = text(t74_value);
    			t75 = space();
    			div25 = element("div");
    			t76 = text(t76_value);
    			t77 = space();
    			div27 = element("div");
    			if (if_block3) if_block3.c();
    			t78 = space();
    			if (if_block4) if_block4.c();
    			t79 = space();
    			if (if_block5) if_block5.c();
    			t80 = space();
    			if (if_block6) if_block6.c();
    			t81 = space();
    			if (if_block7) if_block7.c();
    			t82 = space();
    			if (if_block8) if_block8.c();
    			t83 = space();
    			if (if_block9) if_block9.c();
    			t84 = space();
    			if (if_block10) if_block10.c();
    			t85 = space();
    			if (if_block11) if_block11.c();
    			t86 = space();
    			if (if_block12) if_block12.c();
    			t87 = space();
    			if (if_block13) if_block13.c();
    			t88 = space();
    			if (if_block14) if_block14.c();
    			t89 = space();
    			div30 = element("div");
    			button0 = element("button");
    			button0.textContent = "← İptal";
    			t91 = space();
    			button1 = element("button");
    			button1.textContent = "Sil";
    			t93 = space();
    			button2 = element("button");
    			t94 = text("Onayla");
    			t95 = space();
    			if (if_block15) if_block15.c();
    			t96 = space();
    			if (if_block16) if_block16.c();
    			t97 = space();
    			if (if_block17) if_block17.c();
    			t98 = space();
    			if (if_block18) if_block18.c();
    			attr_dev(div0, "class", "title");
    			add_location(div0, file$3, 145, 12, 4187);
    			add_location(b0, file$3, 147, 16, 4276);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "John Doe");
    			add_location(input0, file$3, 148, 16, 4312);
    			attr_dev(div1, "class", "column");
    			add_location(div1, file$3, 146, 12, 4239);
    			add_location(b1, file$3, 155, 16, 4527);
    			option0.__value = "freelancer";
    			option0.value = option0.__value;
    			add_location(option0, file$3, 157, 20, 4619);
    			option1.__value = "company";
    			option1.value = option1.__value;
    			add_location(option1, file$3, 158, 20, 4693);
    			option2.__value = "";
    			option2.value = option2.__value;
    			option2.selected = true;
    			add_location(option2, file$3, 159, 20, 4765);
    			add_location(select0, file$3, 156, 16, 4566);
    			attr_dev(div2, "class", "column");
    			add_location(div2, file$3, 154, 12, 4490);
    			add_location(b2, file$3, 171, 16, 5192);
    			option3.__value = "looking";
    			option3.value = option3.__value;
    			add_location(option3, file$3, 173, 20, 5297);
    			option4.__value = "hiring";
    			option4.value = option4.__value;
    			add_location(option4, file$3, 174, 20, 5360);
    			option5.__value = "";
    			option5.value = option5.__value;
    			option5.selected = true;
    			add_location(option5, file$3, 175, 20, 5427);
    			attr_dev(select1, "place", "");
    			if (/*preview*/ ctx[0].job_status === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[16].call(select1));
    			add_location(select1, file$3, 172, 16, 5230);
    			attr_dev(div3, "class", "column");
    			add_location(div3, file$3, 170, 12, 5155);
    			add_location(b3, file$3, 179, 16, 5573);
    			attr_dev(textarea, "placeholder", "Buraya açıklama girebilirsiniz...");
    			add_location(textarea, file$3, 180, 16, 5606);
    			attr_dev(div4, "class", "descolumn");
    			add_location(div4, file$3, 178, 12, 5533);
    			add_location(section0, file$3, 144, 8, 4165);
    			attr_dev(div5, "class", "title");
    			add_location(div5, file$3, 188, 12, 5825);
    			attr_dev(i0, "class", "github");
    			add_location(i0, file$3, 190, 19, 5911);
    			add_location(b4, file$3, 190, 16, 5908);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "kullanıcı adı");
    			add_location(input1, file$3, 191, 16, 5960);
    			attr_dev(div6, "class", "column");
    			add_location(div6, file$3, 189, 12, 5871);
    			attr_dev(i1, "class", "gitlab");
    			add_location(i1, file$3, 198, 19, 6192);
    			add_location(b5, file$3, 198, 16, 6189);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "placeholder", "kullanıcı adı");
    			add_location(input2, file$3, 199, 16, 6241);
    			attr_dev(div7, "class", "column");
    			add_location(div7, file$3, 197, 12, 6152);
    			attr_dev(i2, "class", "twitter");
    			add_location(i2, file$3, 206, 19, 6473);
    			add_location(b6, file$3, 206, 16, 6470);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "placeholder", "kullanıcı adı");
    			add_location(input3, file$3, 207, 16, 6524);
    			attr_dev(div8, "class", "column");
    			add_location(div8, file$3, 205, 12, 6433);
    			attr_dev(i3, "class", "facebook");
    			add_location(i3, file$3, 214, 19, 6757);
    			add_location(b7, file$3, 214, 16, 6754);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "placeholder", "kullanıcı adı");
    			add_location(input4, file$3, 215, 16, 6810);
    			attr_dev(div9, "class", "column");
    			add_location(div9, file$3, 213, 12, 6717);
    			attr_dev(i4, "class", "youtube");
    			add_location(i4, file$3, 222, 19, 7044);
    			add_location(b8, file$3, 222, 16, 7041);
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "placeholder", "/u/kanallinki");
    			add_location(input5, file$3, 223, 16, 7095);
    			attr_dev(div10, "class", "column");
    			add_location(div10, file$3, 221, 12, 7004);
    			attr_dev(i5, "class", "instagram");
    			add_location(i5, file$3, 230, 19, 7328);
    			add_location(b9, file$3, 230, 16, 7325);
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "placeholder", "kullanıcı adı");
    			add_location(input6, file$3, 231, 16, 7383);
    			attr_dev(div11, "class", "column");
    			add_location(div11, file$3, 229, 12, 7288);
    			attr_dev(i6, "class", "telegram");
    			add_location(i6, file$3, 238, 19, 7618);
    			add_location(b10, file$3, 238, 16, 7615);
    			attr_dev(input7, "type", "text");
    			attr_dev(input7, "placeholder", "kullanıcı adı");
    			add_location(input7, file$3, 239, 16, 7671);
    			attr_dev(div12, "class", "column");
    			add_location(div12, file$3, 237, 12, 7578);
    			attr_dev(i7, "class", "linkedin");
    			add_location(i7, file$3, 246, 19, 7905);
    			add_location(b11, file$3, 246, 16, 7902);
    			attr_dev(input8, "type", "text");
    			attr_dev(input8, "placeholder", "kullanıcı adı");
    			add_location(input8, file$3, 247, 16, 7958);
    			attr_dev(div13, "class", "column");
    			add_location(div13, file$3, 245, 12, 7865);
    			attr_dev(i8, "class", "reddit");
    			add_location(i8, file$3, 254, 19, 8192);
    			add_location(b12, file$3, 254, 16, 8189);
    			attr_dev(input9, "type", "text");
    			attr_dev(input9, "placeholder", "kullanıcı adı");
    			add_location(input9, file$3, 255, 16, 8241);
    			attr_dev(div14, "class", "column");
    			add_location(div14, file$3, 253, 12, 8152);
    			attr_dev(i9, "class", "kommunity");
    			add_location(i9, file$3, 262, 19, 8473);
    			add_location(b13, file$3, 262, 16, 8470);
    			attr_dev(input10, "type", "text");
    			attr_dev(input10, "placeholder", "kullanıcı adı");
    			add_location(input10, file$3, 263, 16, 8528);
    			attr_dev(div15, "class", "column");
    			add_location(div15, file$3, 261, 12, 8433);
    			attr_dev(i10, "class", "email");
    			add_location(i10, file$3, 270, 19, 8763);
    			add_location(b14, file$3, 270, 16, 8760);
    			attr_dev(input11, "type", "text");
    			attr_dev(input11, "placeholder", "me@example.com");
    			add_location(input11, file$3, 271, 16, 8811);
    			attr_dev(div16, "class", "column");
    			add_location(div16, file$3, 269, 12, 8723);
    			attr_dev(i11, "class", "website");
    			add_location(i11, file$3, 278, 19, 9043);
    			add_location(b15, file$3, 278, 16, 9040);
    			attr_dev(input12, "type", "text");
    			attr_dev(input12, "placeholder", "https://example.com");
    			add_location(input12, file$3, 279, 16, 9094);
    			attr_dev(div17, "class", "column");
    			add_location(div17, file$3, 277, 12, 9003);
    			add_location(section1, file$3, 187, 8, 5803);
    			attr_dev(div18, "class", "title");
    			add_location(div18, file$3, 287, 12, 9330);
    			add_location(p0, file$3, 288, 12, 9381);
    			attr_dev(input13, "type", "radio");
    			attr_dev(input13, "name", "from");
    			attr_dev(input13, "id", "randomGopher");
    			input13.__value = "randomGopher";
    			input13.value = input13.__value;
    			/*$$binding_groups*/ ctx[31][0].push(input13);
    			add_location(input13, file$3, 290, 16, 9460);
    			attr_dev(label0, "for", "randomGopher");
    			add_location(label0, file$3, 291, 16, 9574);
    			add_location(p1, file$3, 289, 12, 9440);
    			attr_dev(input14, "type", "radio");
    			attr_dev(input14, "name", "from");
    			attr_dev(input14, "id", "fetchfromtw");
    			input14.__value = "twitter";
    			input14.value = input14.__value;
    			/*$$binding_groups*/ ctx[31][0].push(input14);
    			add_location(input14, file$3, 294, 16, 9686);
    			attr_dev(label1, "for", "fetchfromtw");
    			add_location(label1, file$3, 295, 16, 9794);
    			add_location(p2, file$3, 293, 12, 9666);
    			add_location(section2, file$3, 286, 8, 9308);
    			attr_dev(div19, "class", "editor");
    			add_location(div19, file$3, 143, 4, 4136);
    			attr_dev(div20, "class", "title");
    			add_location(div20, file$3, 302, 12, 10020);
    			attr_dev(div21, "class", "companySide");
    			add_location(div21, file$3, 305, 20, 10193);
    			attr_dev(img, "class", "avatar");
    			if (!src_url_equal(img.src, img_src_value = /*preview*/ ctx[0].profile_img_url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "ppimage");
    			add_location(img, file$3, 312, 20, 10498);
    			attr_dev(div22, "class", "jobStatusSide");
    			add_location(div22, file$3, 317, 20, 10677);
    			attr_dev(div23, "class", "leftSide");
    			add_location(div23, file$3, 304, 16, 10150);
    			attr_dev(div24, "class", "name");
    			add_location(div24, file$3, 324, 24, 11055);
    			attr_dev(div25, "class", "description");
    			add_location(div25, file$3, 325, 24, 11132);
    			attr_dev(div26, "class", "topSide");
    			add_location(div26, file$3, 323, 20, 11009);
    			attr_dev(div27, "class", "socialLinks");
    			add_location(div27, file$3, 329, 20, 11311);
    			attr_dev(div28, "class", "rightSide");
    			add_location(div28, file$3, 322, 16, 10965);
    			attr_dev(div29, "class", "gopher");
    			attr_dev(div29, "cardtype", div29_cardtype_value = /*preview*/ ctx[0].job_status);
    			add_location(div29, file$3, 303, 12, 10067);
    			attr_dev(button0, "class", "cancel");
    			add_location(button0, file$3, 391, 16, 14735);
    			attr_dev(button1, "class", "delete");
    			add_location(button1, file$3, 394, 16, 14857);
    			attr_dev(button2, "class", "confirm");
    			button2.disabled = /*isSubmitButtonDisabled*/ ctx[8];
    			add_location(button2, file$3, 395, 16, 14946);
    			attr_dev(div30, "class", "actionButtons");
    			add_location(div30, file$3, 390, 12, 14691);
    			attr_dev(div31, "class", "previewSticky");
    			add_location(div31, file$3, 301, 8, 9980);
    			attr_dev(section3, "class", "preview");
    			add_location(section3, file$3, 300, 4, 9946);
    			attr_dev(div32, "class", "gopherEditor");
    			add_location(div32, file$3, 142, 0, 4105);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div32, anchor);
    			append_dev(div32, div19);
    			append_dev(div19, section0);
    			append_dev(section0, div0);
    			append_dev(section0, t1);
    			append_dev(section0, div1);
    			append_dev(div1, b0);
    			append_dev(div1, t3);
    			append_dev(div1, input0);
    			set_input_value(input0, /*preview*/ ctx[0].name);
    			append_dev(section0, t4);
    			append_dev(section0, div2);
    			append_dev(div2, b1);
    			append_dev(div2, t6);
    			append_dev(div2, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(select0, option2);
    			/*select0_binding*/ ctx[14](select0);
    			append_dev(div2, t10);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(section0, t11);
    			append_dev(section0, div3);
    			append_dev(div3, b2);
    			append_dev(div3, t13);
    			append_dev(div3, select1);
    			append_dev(select1, option3);
    			append_dev(select1, option4);
    			append_dev(select1, option5);
    			select_option(select1, /*preview*/ ctx[0].job_status);
    			append_dev(section0, t17);
    			append_dev(section0, div4);
    			append_dev(div4, b3);
    			append_dev(div4, t19);
    			append_dev(div4, textarea);
    			set_input_value(textarea, /*preview*/ ctx[0].description);
    			append_dev(div19, t20);
    			append_dev(div19, section1);
    			append_dev(section1, div5);
    			append_dev(section1, t22);
    			append_dev(section1, div6);
    			append_dev(div6, b4);
    			append_dev(b4, i0);
    			append_dev(b4, t23);
    			append_dev(div6, t24);
    			append_dev(div6, input1);
    			set_input_value(input1, /*preview*/ ctx[0].social.github);
    			append_dev(section1, t25);
    			append_dev(section1, div7);
    			append_dev(div7, b5);
    			append_dev(b5, i1);
    			append_dev(b5, t26);
    			append_dev(div7, t27);
    			append_dev(div7, input2);
    			set_input_value(input2, /*preview*/ ctx[0].social.gitlab);
    			append_dev(section1, t28);
    			append_dev(section1, div8);
    			append_dev(div8, b6);
    			append_dev(b6, i2);
    			append_dev(b6, t29);
    			append_dev(div8, t30);
    			append_dev(div8, input3);
    			set_input_value(input3, /*preview*/ ctx[0].social.twitter);
    			append_dev(section1, t31);
    			append_dev(section1, div9);
    			append_dev(div9, b7);
    			append_dev(b7, i3);
    			append_dev(b7, t32);
    			append_dev(div9, t33);
    			append_dev(div9, input4);
    			set_input_value(input4, /*preview*/ ctx[0].social.facebook);
    			append_dev(section1, t34);
    			append_dev(section1, div10);
    			append_dev(div10, b8);
    			append_dev(b8, i4);
    			append_dev(b8, t35);
    			append_dev(div10, t36);
    			append_dev(div10, input5);
    			set_input_value(input5, /*preview*/ ctx[0].social.youtube);
    			append_dev(section1, t37);
    			append_dev(section1, div11);
    			append_dev(div11, b9);
    			append_dev(b9, i5);
    			append_dev(b9, t38);
    			append_dev(div11, t39);
    			append_dev(div11, input6);
    			set_input_value(input6, /*preview*/ ctx[0].social.instagram);
    			append_dev(section1, t40);
    			append_dev(section1, div12);
    			append_dev(div12, b10);
    			append_dev(b10, i6);
    			append_dev(b10, t41);
    			append_dev(div12, t42);
    			append_dev(div12, input7);
    			set_input_value(input7, /*preview*/ ctx[0].social.telegram);
    			append_dev(section1, t43);
    			append_dev(section1, div13);
    			append_dev(div13, b11);
    			append_dev(b11, i7);
    			append_dev(b11, t44);
    			append_dev(div13, t45);
    			append_dev(div13, input8);
    			set_input_value(input8, /*preview*/ ctx[0].social.linkedin);
    			append_dev(section1, t46);
    			append_dev(section1, div14);
    			append_dev(div14, b12);
    			append_dev(b12, i8);
    			append_dev(b12, t47);
    			append_dev(div14, t48);
    			append_dev(div14, input9);
    			set_input_value(input9, /*preview*/ ctx[0].social.reddit);
    			append_dev(section1, t49);
    			append_dev(section1, div15);
    			append_dev(div15, b13);
    			append_dev(b13, i9);
    			append_dev(b13, t50);
    			append_dev(div15, t51);
    			append_dev(div15, input10);
    			set_input_value(input10, /*preview*/ ctx[0].social.kommunity);
    			append_dev(section1, t52);
    			append_dev(section1, div16);
    			append_dev(div16, b14);
    			append_dev(b14, i10);
    			append_dev(b14, t53);
    			append_dev(div16, t54);
    			append_dev(div16, input11);
    			set_input_value(input11, /*preview*/ ctx[0].social.email);
    			append_dev(section1, t55);
    			append_dev(section1, div17);
    			append_dev(div17, b15);
    			append_dev(b15, i11);
    			append_dev(b15, t56);
    			append_dev(div17, t57);
    			append_dev(div17, input12);
    			set_input_value(input12, /*preview*/ ctx[0].social.website);
    			append_dev(div19, t58);
    			append_dev(div19, section2);
    			append_dev(section2, div18);
    			append_dev(section2, t60);
    			append_dev(section2, p0);
    			append_dev(section2, t62);
    			append_dev(section2, p1);
    			append_dev(p1, input13);
    			input13.checked = input13.__value === /*preferAvatar*/ ctx[1];
    			append_dev(p1, t63);
    			append_dev(p1, label0);
    			append_dev(section2, t65);
    			append_dev(section2, p2);
    			append_dev(p2, input14);
    			input14.checked = input14.__value === /*preferAvatar*/ ctx[1];
    			append_dev(p2, t66);
    			append_dev(p2, label1);
    			append_dev(div32, t68);
    			append_dev(div32, section3);
    			append_dev(section3, div31);
    			append_dev(div31, div20);
    			append_dev(div31, t70);
    			append_dev(div31, div29);
    			append_dev(div29, div23);
    			append_dev(div23, div21);
    			if_block1.m(div21, null);
    			append_dev(div23, t71);
    			append_dev(div23, img);
    			append_dev(div23, t72);
    			append_dev(div23, div22);
    			if (if_block2) if_block2.m(div22, null);
    			append_dev(div29, t73);
    			append_dev(div29, div28);
    			append_dev(div28, div26);
    			append_dev(div26, div24);
    			append_dev(div24, t74);
    			append_dev(div26, t75);
    			append_dev(div26, div25);
    			append_dev(div25, t76);
    			append_dev(div28, t77);
    			append_dev(div28, div27);
    			if (if_block3) if_block3.m(div27, null);
    			append_dev(div27, t78);
    			if (if_block4) if_block4.m(div27, null);
    			append_dev(div27, t79);
    			if (if_block5) if_block5.m(div27, null);
    			append_dev(div27, t80);
    			if (if_block6) if_block6.m(div27, null);
    			append_dev(div27, t81);
    			if (if_block7) if_block7.m(div27, null);
    			append_dev(div27, t82);
    			if (if_block8) if_block8.m(div27, null);
    			append_dev(div27, t83);
    			if (if_block9) if_block9.m(div27, null);
    			append_dev(div27, t84);
    			if (if_block10) if_block10.m(div27, null);
    			append_dev(div27, t85);
    			if (if_block11) if_block11.m(div27, null);
    			append_dev(div27, t86);
    			if (if_block12) if_block12.m(div27, null);
    			append_dev(div27, t87);
    			if (if_block13) if_block13.m(div27, null);
    			append_dev(div27, t88);
    			if (if_block14) if_block14.m(div27, null);
    			append_dev(div31, t89);
    			append_dev(div31, div30);
    			append_dev(div30, button0);
    			append_dev(div30, t91);
    			append_dev(div30, button1);
    			append_dev(div30, t93);
    			append_dev(div30, button2);
    			append_dev(button2, t94);
    			append_dev(div31, t95);
    			if (if_block15) if_block15.m(div31, null);
    			append_dev(div31, t96);
    			if (if_block16) if_block16.m(div31, null);
    			append_dev(div31, t97);
    			if (if_block17) if_block17.m(div31, null);
    			append_dev(div31, t98);
    			if (if_block18) if_block18.m(div31, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[13]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[16]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[17]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[18]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[19]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[20]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[21]),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[22]),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[23]),
    					listen_dev(input7, "input", /*input7_input_handler*/ ctx[24]),
    					listen_dev(input8, "input", /*input8_input_handler*/ ctx[25]),
    					listen_dev(input9, "input", /*input9_input_handler*/ ctx[26]),
    					listen_dev(input10, "input", /*input10_input_handler*/ ctx[27]),
    					listen_dev(input11, "input", /*input11_input_handler*/ ctx[28]),
    					listen_dev(input12, "input", /*input12_input_handler*/ ctx[29]),
    					listen_dev(input13, "change", /*input13_change_handler*/ ctx[30]),
    					listen_dev(input14, "change", /*input14_change_handler*/ ctx[32]),
    					listen_dev(button0, "click", /*goHome*/ ctx[10], false, false, false),
    					listen_dev(
    						button1,
    						"click",
    						function () {
    							if (is_function(/*deleteGopher*/ ctx[11](/*preview*/ ctx[0].id))) /*deleteGopher*/ ctx[11](/*preview*/ ctx[0].id).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(button2, "click", /*sendGopherData*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*preview*/ 1 && input0.value !== /*preview*/ ctx[0].name) {
    				set_input_value(input0, /*preview*/ ctx[0].name);
    			}

    			if (/*insertCompany*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*insertCompany*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_21$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div2, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*preview*/ 1) {
    				select_option(select1, /*preview*/ ctx[0].job_status);
    			}

    			if (dirty[0] & /*preview*/ 1) {
    				set_input_value(textarea, /*preview*/ ctx[0].description);
    			}

    			if (dirty[0] & /*preview*/ 1 && input1.value !== /*preview*/ ctx[0].social.github) {
    				set_input_value(input1, /*preview*/ ctx[0].social.github);
    			}

    			if (dirty[0] & /*preview*/ 1 && input2.value !== /*preview*/ ctx[0].social.gitlab) {
    				set_input_value(input2, /*preview*/ ctx[0].social.gitlab);
    			}

    			if (dirty[0] & /*preview*/ 1 && input3.value !== /*preview*/ ctx[0].social.twitter) {
    				set_input_value(input3, /*preview*/ ctx[0].social.twitter);
    			}

    			if (dirty[0] & /*preview*/ 1 && input4.value !== /*preview*/ ctx[0].social.facebook) {
    				set_input_value(input4, /*preview*/ ctx[0].social.facebook);
    			}

    			if (dirty[0] & /*preview*/ 1 && input5.value !== /*preview*/ ctx[0].social.youtube) {
    				set_input_value(input5, /*preview*/ ctx[0].social.youtube);
    			}

    			if (dirty[0] & /*preview*/ 1 && input6.value !== /*preview*/ ctx[0].social.instagram) {
    				set_input_value(input6, /*preview*/ ctx[0].social.instagram);
    			}

    			if (dirty[0] & /*preview*/ 1 && input7.value !== /*preview*/ ctx[0].social.telegram) {
    				set_input_value(input7, /*preview*/ ctx[0].social.telegram);
    			}

    			if (dirty[0] & /*preview*/ 1 && input8.value !== /*preview*/ ctx[0].social.linkedin) {
    				set_input_value(input8, /*preview*/ ctx[0].social.linkedin);
    			}

    			if (dirty[0] & /*preview*/ 1 && input9.value !== /*preview*/ ctx[0].social.reddit) {
    				set_input_value(input9, /*preview*/ ctx[0].social.reddit);
    			}

    			if (dirty[0] & /*preview*/ 1 && input10.value !== /*preview*/ ctx[0].social.kommunity) {
    				set_input_value(input10, /*preview*/ ctx[0].social.kommunity);
    			}

    			if (dirty[0] & /*preview*/ 1 && input11.value !== /*preview*/ ctx[0].social.email) {
    				set_input_value(input11, /*preview*/ ctx[0].social.email);
    			}

    			if (dirty[0] & /*preview*/ 1 && input12.value !== /*preview*/ ctx[0].social.website) {
    				set_input_value(input12, /*preview*/ ctx[0].social.website);
    			}

    			if (dirty[0] & /*preferAvatar*/ 2) {
    				input13.checked = input13.__value === /*preferAvatar*/ ctx[1];
    			}

    			if (dirty[0] & /*preferAvatar*/ 2) {
    				input14.checked = input14.__value === /*preferAvatar*/ ctx[1];
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div21, null);
    				}
    			}

    			if (!current || dirty[0] & /*preview*/ 1 && !src_url_equal(img.src, img_src_value = /*preview*/ ctx[0].profile_img_url)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (current_block_type_1 !== (current_block_type_1 = select_block_type_2(ctx))) {
    				if (if_block2) if_block2.d(1);
    				if_block2 = current_block_type_1 && current_block_type_1(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div22, null);
    				}
    			}

    			if ((!current || dirty[0] & /*preview*/ 1) && t74_value !== (t74_value = (/*preview*/ ctx[0].name || "John Doe") + "")) set_data_dev(t74, t74_value);
    			if ((!current || dirty[0] & /*preview*/ 1) && t76_value !== (t76_value = (/*preview*/ ctx[0].description || "Açıklama Bulunmuyor") + "")) set_data_dev(t76, t76_value);

    			if (/*preview*/ ctx[0].social.github) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_16$2(ctx);
    					if_block3.c();
    					if_block3.m(div27, t78);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*preview*/ ctx[0].social.gitlab) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_15$2(ctx);
    					if_block4.c();
    					if_block4.m(div27, t79);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*preview*/ ctx[0].social.twitter) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_14$2(ctx);
    					if_block5.c();
    					if_block5.m(div27, t80);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*preview*/ ctx[0].social.facebook) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_13$2(ctx);
    					if_block6.c();
    					if_block6.m(div27, t81);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*preview*/ ctx[0].social.youtube) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_12$2(ctx);
    					if_block7.c();
    					if_block7.m(div27, t82);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (/*preview*/ ctx[0].social.instagram) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);
    				} else {
    					if_block8 = create_if_block_11$2(ctx);
    					if_block8.c();
    					if_block8.m(div27, t83);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (/*preview*/ ctx[0].social.telegram) {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);
    				} else {
    					if_block9 = create_if_block_10$2(ctx);
    					if_block9.c();
    					if_block9.m(div27, t84);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}

    			if (/*preview*/ ctx[0].social.linkedin) {
    				if (if_block10) {
    					if_block10.p(ctx, dirty);
    				} else {
    					if_block10 = create_if_block_9$2(ctx);
    					if_block10.c();
    					if_block10.m(div27, t85);
    				}
    			} else if (if_block10) {
    				if_block10.d(1);
    				if_block10 = null;
    			}

    			if (/*preview*/ ctx[0].social.reddit) {
    				if (if_block11) {
    					if_block11.p(ctx, dirty);
    				} else {
    					if_block11 = create_if_block_8$2(ctx);
    					if_block11.c();
    					if_block11.m(div27, t86);
    				}
    			} else if (if_block11) {
    				if_block11.d(1);
    				if_block11 = null;
    			}

    			if (/*preview*/ ctx[0].social.kommunity) {
    				if (if_block12) {
    					if_block12.p(ctx, dirty);
    				} else {
    					if_block12 = create_if_block_7$2(ctx);
    					if_block12.c();
    					if_block12.m(div27, t87);
    				}
    			} else if (if_block12) {
    				if_block12.d(1);
    				if_block12 = null;
    			}

    			if (/*preview*/ ctx[0].social.email) {
    				if (if_block13) {
    					if_block13.p(ctx, dirty);
    				} else {
    					if_block13 = create_if_block_6$2(ctx);
    					if_block13.c();
    					if_block13.m(div27, t88);
    				}
    			} else if (if_block13) {
    				if_block13.d(1);
    				if_block13 = null;
    			}

    			if (/*preview*/ ctx[0].social.website) {
    				if (if_block14) {
    					if_block14.p(ctx, dirty);
    				} else {
    					if_block14 = create_if_block_5$2(ctx);
    					if_block14.c();
    					if_block14.m(div27, null);
    				}
    			} else if (if_block14) {
    				if_block14.d(1);
    				if_block14 = null;
    			}

    			if (!current || dirty[0] & /*preview*/ 1 && div29_cardtype_value !== (div29_cardtype_value = /*preview*/ ctx[0].job_status)) {
    				attr_dev(div29, "cardtype", div29_cardtype_value);
    			}

    			if (!current || dirty[0] & /*isSubmitButtonDisabled*/ 256) {
    				prop_dev(button2, "disabled", /*isSubmitButtonDisabled*/ ctx[8]);
    			}

    			if (/*showInfo*/ ctx[4]) {
    				if (if_block15) {
    					if_block15.p(ctx, dirty);
    				} else {
    					if_block15 = create_if_block_4$2(ctx);
    					if_block15.c();
    					if_block15.m(div31, t96);
    				}
    			} else if (if_block15) {
    				if_block15.d(1);
    				if_block15 = null;
    			}

    			if (/*showError*/ ctx[5]) {
    				if (if_block16) {
    					if_block16.p(ctx, dirty);
    				} else {
    					if_block16 = create_if_block_3$2(ctx);
    					if_block16.c();
    					if_block16.m(div31, t97);
    				}
    			} else if (if_block16) {
    				if_block16.d(1);
    				if_block16 = null;
    			}

    			if (/*preview*/ ctx[0].name == "" || /*preview*/ ctx[0].name == undefined) {
    				if (if_block17) ; else {
    					if_block17 = create_if_block_2$2(ctx);
    					if_block17.c();
    					if_block17.m(div31, t98);
    				}
    			} else if (if_block17) {
    				if_block17.d(1);
    				if_block17 = null;
    			}

    			if (/*preferAvatar*/ ctx[1] == "twitter" && (/*preview*/ ctx[0].social.twitter == undefined || /*preview*/ ctx[0].social.twitter == "")) {
    				if (if_block18) ; else {
    					if_block18 = create_if_block_1$3(ctx);
    					if_block18.c();
    					if_block18.m(div31, null);
    				}
    			} else if (if_block18) {
    				if_block18.d(1);
    				if_block18 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);

    			add_render_callback(() => {
    				if (!div29_transition) div29_transition = create_bidirectional_transition(div29, fade, {}, true);
    				div29_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			if (!div29_transition) div29_transition = create_bidirectional_transition(div29, fade, {}, false);
    			div29_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div32);
    			/*select0_binding*/ ctx[14](null);
    			if (if_block0) if_block0.d();
    			/*$$binding_groups*/ ctx[31][0].splice(/*$$binding_groups*/ ctx[31][0].indexOf(input13), 1);
    			/*$$binding_groups*/ ctx[31][0].splice(/*$$binding_groups*/ ctx[31][0].indexOf(input14), 1);
    			if_block1.d();

    			if (if_block2) {
    				if_block2.d();
    			}

    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			if (if_block8) if_block8.d();
    			if (if_block9) if_block9.d();
    			if (if_block10) if_block10.d();
    			if (if_block11) if_block11.d();
    			if (if_block12) if_block12.d();
    			if (if_block13) if_block13.d();
    			if (if_block14) if_block14.d();
    			if (detaching && div29_transition) div29_transition.end();
    			if (if_block15) if_block15.d();
    			if (if_block16) if_block16.d();
    			if (if_block17) if_block17.d();
    			if (if_block18) if_block18.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(142:0) {#if isGopherLoaded}",
    		ctx
    	});

    	return block;
    }

    // (162:16) {#if insertCompany}
    function create_if_block_21$1(ctx) {
    	let input;
    	let input_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Şirket İsmi");
    			add_location(input, file$3, 162, 20, 4893);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*preview*/ ctx[0].company);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[15]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && input.value !== /*preview*/ ctx[0].company) {
    				set_input_value(input, /*preview*/ ctx[0].company);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!input_transition) input_transition = create_bidirectional_transition(input, fade, {}, true);
    				input_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!input_transition) input_transition = create_bidirectional_transition(input, fade, {}, false);
    			input_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching && input_transition) input_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_21$1.name,
    		type: "if",
    		source: "(162:16) {#if insertCompany}",
    		ctx
    	});

    	return block;
    }

    // (309:24) {:else}
    function create_else_block$2(ctx) {
    	let t_value = (/*preview*/ ctx[0].company || "Çalışmıyor") + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && t_value !== (t_value = (/*preview*/ ctx[0].company || "Çalışmıyor") + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(309:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (307:24) {#if preview.company == "freelancer"}
    function create_if_block_20$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Serbest Çalışıyor");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20$2.name,
    		type: "if",
    		source: "(307:24) {#if preview.company == \\\"freelancer\\\"}",
    		ctx
    	});

    	return block;
    }

    // (320:60) 
    function create_if_block_19$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Çalışıyor");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19$2.name,
    		type: "if",
    		source: "(320:60) ",
    		ctx
    	});

    	return block;
    }

    // (319:111) 
    function create_if_block_18$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Çalışan\n                            Arıyor");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18$2.name,
    		type: "if",
    		source: "(319:111) ",
    		ctx
    	});

    	return block;
    }

    // (319:24) {#if preview.job_status == "looking"}
    function create_if_block_17$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("İş Arıyor");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17$2.name,
    		type: "if",
    		source: "(319:24) {#if preview.job_status == \\\"looking\\\"}",
    		ctx
    	});

    	return block;
    }

    // (331:24) {#if preview.social.github}
    function create_if_block_16$2(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "github");
    			add_location(i, file$3, 333, 48, 11558);
    			attr_dev(a, "href", a_href_value = "https://github.com/" + /*preview*/ ctx[0].social.github);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$3, 330, 51, 11388);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://github.com/" + /*preview*/ ctx[0].social.github)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16$2.name,
    		type: "if",
    		source: "(331:24) {#if preview.social.github}",
    		ctx
    	});

    	return block;
    }

    // (336:24) {#if preview.social.gitlab}
    function create_if_block_15$2(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "gitlab");
    			add_location(i, file$3, 338, 48, 11838);
    			attr_dev(a, "href", a_href_value = "https://gitlab.com/" + /*preview*/ ctx[0].social.gitlab);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$3, 335, 51, 11668);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://gitlab.com/" + /*preview*/ ctx[0].social.gitlab)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15$2.name,
    		type: "if",
    		source: "(336:24) {#if preview.social.gitlab}",
    		ctx
    	});

    	return block;
    }

    // (341:24) {#if preview.social.twitter}
    function create_if_block_14$2(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "twitter");
    			add_location(i, file$3, 343, 48, 12121);
    			attr_dev(a, "href", a_href_value = "https://twitter.com/" + /*preview*/ ctx[0].social.twitter);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$3, 340, 52, 11949);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://twitter.com/" + /*preview*/ ctx[0].social.twitter)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14$2.name,
    		type: "if",
    		source: "(341:24) {#if preview.social.twitter}",
    		ctx
    	});

    	return block;
    }

    // (346:24) {#if preview.social.facebook}
    function create_if_block_13$2(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "facebook");
    			add_location(i, file$3, 348, 48, 12408);
    			attr_dev(a, "href", a_href_value = "https://facebook.com/" + /*preview*/ ctx[0].social.facebook);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$3, 345, 53, 12234);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://facebook.com/" + /*preview*/ ctx[0].social.facebook)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13$2.name,
    		type: "if",
    		source: "(346:24) {#if preview.social.facebook}",
    		ctx
    	});

    	return block;
    }

    // (351:24) {#if preview.social.youtube}
    function create_if_block_12$2(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "youtube");
    			add_location(i, file$3, 353, 48, 12693);
    			attr_dev(a, "href", a_href_value = "https://youtube.com/" + /*preview*/ ctx[0].social.youtube);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$3, 350, 52, 12521);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://youtube.com/" + /*preview*/ ctx[0].social.youtube)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12$2.name,
    		type: "if",
    		source: "(351:24) {#if preview.social.youtube}",
    		ctx
    	});

    	return block;
    }

    // (356:24) {#if preview.social.instagram}
    function create_if_block_11$2(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "instagram");
    			add_location(i, file$3, 358, 48, 12983);
    			attr_dev(a, "href", a_href_value = "https://instagram.com/" + /*preview*/ ctx[0].social.instagram);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$3, 355, 54, 12807);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://instagram.com/" + /*preview*/ ctx[0].social.instagram)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11$2.name,
    		type: "if",
    		source: "(356:24) {#if preview.social.instagram}",
    		ctx
    	});

    	return block;
    }

    // (361:24) {#if preview.social.telegram}
    function create_if_block_10$2(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "telegram");
    			add_location(i, file$3, 362, 48, 13227);
    			attr_dev(a, "href", a_href_value = "https://t.me/" + /*preview*/ ctx[0].social.telegram);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$3, 360, 53, 13098);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://t.me/" + /*preview*/ ctx[0].social.telegram)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$2.name,
    		type: "if",
    		source: "(361:24) {#if preview.social.telegram}",
    		ctx
    	});

    	return block;
    }

    // (365:24) {#if preview.social.linkedin}
    function create_if_block_9$2(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "linkedin");
    			add_location(i, file$3, 367, 48, 13518);
    			attr_dev(a, "href", a_href_value = "https://linkedin.com/in/" + /*preview*/ ctx[0].social.linkedin);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$3, 364, 53, 13341);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://linkedin.com/in/" + /*preview*/ ctx[0].social.linkedin)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$2.name,
    		type: "if",
    		source: "(365:24) {#if preview.social.linkedin}",
    		ctx
    	});

    	return block;
    }

    // (370:24) {#if preview.social.reddit}
    function create_if_block_8$2(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "reddit");
    			add_location(i, file$3, 372, 48, 13802);
    			attr_dev(a, "href", a_href_value = "https://reddit.com/u/" + /*preview*/ ctx[0].social.reddit);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$3, 369, 51, 13630);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://reddit.com/u/" + /*preview*/ ctx[0].social.reddit)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$2.name,
    		type: "if",
    		source: "(370:24) {#if preview.social.reddit}",
    		ctx
    	});

    	return block;
    }

    // (375:24) {#if preview.social.kommunity}
    function create_if_block_7$2(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "kommunity");
    			add_location(i, file$3, 377, 48, 14092);
    			attr_dev(a, "href", a_href_value = "https://kommunity.com/@" + /*preview*/ ctx[0].social.kommunity);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$3, 374, 54, 13915);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://kommunity.com/@" + /*preview*/ ctx[0].social.kommunity)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$2.name,
    		type: "if",
    		source: "(375:24) {#if preview.social.kommunity}",
    		ctx
    	});

    	return block;
    }

    // (380:24) {#if preview.social.email}
    function create_if_block_6$2(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "email");
    			add_location(i, file$3, 381, 48, 14327);
    			attr_dev(a, "href", a_href_value = "mailto:" + /*preview*/ ctx[0].social.email);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$3, 379, 50, 14204);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "mailto:" + /*preview*/ ctx[0].social.email)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$2.name,
    		type: "if",
    		source: "(380:24) {#if preview.social.email}",
    		ctx
    	});

    	return block;
    }

    // (384:24) {#if preview.social.website}
    function create_if_block_5$2(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "website");
    			add_location(i, file$3, 385, 48, 14550);
    			attr_dev(a, "href", a_href_value = /*preview*/ ctx[0].social.website);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$3, 383, 52, 14437);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = /*preview*/ ctx[0].social.website)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(384:24) {#if preview.social.website}",
    		ctx
    	});

    	return block;
    }

    // (400:12) {#if showInfo}
    function create_if_block_4$2(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*processMessage*/ ctx[6]);
    			attr_dev(div, "class", "processInfo");
    			add_location(div, file$3, 400, 12, 15142);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*processMessage*/ 64) set_data_dev(t, /*processMessage*/ ctx[6]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(400:12) {#if showInfo}",
    		ctx
    	});

    	return block;
    }

    // (405:12) {#if showError}
    function create_if_block_3$2(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*processMessage*/ ctx[6]);
    			attr_dev(div, "class", "error");
    			add_location(div, file$3, 405, 12, 15278);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*processMessage*/ 64) set_data_dev(t, /*processMessage*/ ctx[6]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(405:12) {#if showError}",
    		ctx
    	});

    	return block;
    }

    // (410:12) {#if preview.name == "" || preview.name==undefined}
    function create_if_block_2$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Lütfen isim alanını doldurunuz!";
    			attr_dev(div, "class", "error");
    			add_location(div, file$3, 410, 12, 15444);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(410:12) {#if preview.name == \\\"\\\" || preview.name==undefined}",
    		ctx
    	});

    	return block;
    }

    // (415:12) {#if preferAvatar=="twitter" && (preview.social.twitter == undefined || preview.social.twitter == "")}
    function create_if_block_1$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Lütfen Twitter kullanıcı adını giriniz!";
    			attr_dev(div, "class", "error");
    			add_location(div, file$3, 415, 12, 15676);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(415:12) {#if preferAvatar==\\\"twitter\\\" && (preview.social.twitter == undefined || preview.social.twitter == \\\"\\\")}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let link;
    	let t0;
    	let show_info;
    	let h3;
    	let t2;
    	let p0;
    	let t4;
    	let p1;
    	let t6;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block_1$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isGopherLoaded*/ ctx[7]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			show_info = element("show-info");
    			h3 = element("h3");
    			h3.textContent = "Lütfen Okuyun!";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "→ Gopher kartı için profil fotoğrafı, Twitter profilinden\n        çekilir. Profil fotoğrafı için, Twitter kullanıcı adını eklemeyi\n        unutmayın...";
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "→ Buraya girmiş olunan bilgiler herkes tarafından\n        görülebilecektir.";
    			t6 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			this.c = noop;
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/public/global.css");
    			add_location(link, file$3, 128, 0, 3666);
    			add_location(h3, file$3, 130, 4, 3747);
    			add_location(p0, file$3, 131, 4, 3775);
    			add_location(p1, file$3, 136, 4, 3963);
    			set_custom_element_data(show_info, "close", true);
    			add_location(show_info, file$3, 129, 0, 3718);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, show_info, anchor);
    			append_dev(show_info, h3);
    			append_dev(show_info, t2);
    			append_dev(show_info, p0);
    			append_dev(show_info, t4);
    			append_dev(show_info, p1);
    			insert_dev(target, t6, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(show_info);
    			if (detaching) detach_dev(t6);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let isSubmitButtonDisabled;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('edit-gopher', slots, []);
    	let { gopherid } = $$props;
    	let gopherData = null;
    	let insertCompany = false;
    	let jobSelector;

    	onMount(() => {
    		$$invalidate(
    			3,
    			jobSelector.onchange = e => {
    				let jobValue = e.target.value;

    				if (jobValue == "company") {
    					$$invalidate(0, preview.company = "", preview);
    					$$invalidate(2, insertCompany = true);
    				} else if (jobValue == "freelancer") {
    					$$invalidate(0, preview.company = "freelancer", preview);
    					$$invalidate(2, insertCompany = false);
    				} else {
    					$$invalidate(0, preview.company = null, preview);
    					$$invalidate(2, insertCompany = false);
    				}
    			},
    			jobSelector
    		);
    	});

    	let preview = { social: {} };
    	let preferAvatar = "randomGopher";
    	let showInfo = false;
    	let showError = false;
    	let processMessage = "";
    	let isGopherLoaded = false;

    	//all gopher images
    	var gopherPictures = [
    		"/public/img/gophers/gopher1.png",
    		"/public/img/gophers/gopher2.png",
    		"/public/img/gophers/gopher3.png",
    		"/public/img/gophers/gopher4.png",
    		"/public/img/gophers/gopher5.png",
    		"/public/img/gophers/gopher6.png"
    	];

    	const genRandomGopherPP = () => {
    		return gopherPictures[Math.floor(Math.random() * gopherPictures.length)];
    	};

    	async function fetchGopher() {
    		var req = new XMLHttpRequest();
    		req.open("GET", "/api/gopher/" + gopherid, true);

    		req.onload = () => {
    			if (req.status == 200) {
    				$$invalidate(0, preview = JSON.parse(req.responseText));
    				$$invalidate(7, isGopherLoaded = true);

    				if (preview.profile_img_url) {
    					$$invalidate(1, preferAvatar = "twitter");
    				} else {
    					$$invalidate(0, preview.profile_img_url = genRandomGopherPP(), preview);
    				}
    			}
    		};

    		req.send(null);
    	}

    	fetchGopher();

    	const sendGopherData = () => {
    		let req = new XMLHttpRequest();
    		req.open("POST", "/admin/api/gopher/edit", true);
    		req.setRequestHeader('Content-Type', 'application/json');

    		req.onload = () => {
    			if (req.status == 200) {
    				let resp = JSON.parse(req.responseText);
    				$$invalidate(4, showInfo = true);
    				$$invalidate(5, showError = false);
    				$$invalidate(6, processMessage = resp.message);

    				setTimeout(
    					() => {
    						location.href = "/";
    					},
    					3000
    				);
    			} else if (req.status != 200) {
    				let resp = JSON.parse(req.responseText);
    				$$invalidate(4, showInfo = false);
    				$$invalidate(5, showError = true);
    				$$invalidate(6, processMessage = resp.message);
    			}
    		};

    		req.send(JSON.stringify({
    			"gopher": preview,
    			"avatar_method": preferAvatar
    		}));
    	};

    	const goHome = () => {
    		location.href = "/";
    	};

    	const deleteGopher = id => {
    		let req = new XMLHttpRequest();
    		req.open("GET", "/admin/api/gopher/delete/" + id, true);

    		req.onload = () => {
    			if (req.status == 200) {
    				let resp = JSON.parse(req.responseText);
    				$$invalidate(4, showInfo = true);
    				$$invalidate(5, showError = false);
    				$$invalidate(6, processMessage = resp.message);

    				setTimeout(
    					() => {
    						location.href = "/";
    					},
    					3000
    				);
    			} else if (req.status != 200) {
    				let resp = JSON.parse(req.responseText);
    				$$invalidate(4, showInfo = false);
    				$$invalidate(5, showError = true);
    				$$invalidate(6, processMessage = resp.message);
    			}
    		};

    		req.send(null);
    	};

    	const writable_props = ['gopherid'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<edit-gopher> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input0_input_handler() {
    		preview.name = this.value;
    		$$invalidate(0, preview);
    	}

    	function select0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			jobSelector = $$value;
    			$$invalidate(3, jobSelector);
    		});
    	}

    	function input_input_handler() {
    		preview.company = this.value;
    		$$invalidate(0, preview);
    	}

    	function select1_change_handler() {
    		preview.job_status = select_value(this);
    		$$invalidate(0, preview);
    	}

    	function textarea_input_handler() {
    		preview.description = this.value;
    		$$invalidate(0, preview);
    	}

    	function input1_input_handler() {
    		preview.social.github = this.value;
    		$$invalidate(0, preview);
    	}

    	function input2_input_handler() {
    		preview.social.gitlab = this.value;
    		$$invalidate(0, preview);
    	}

    	function input3_input_handler() {
    		preview.social.twitter = this.value;
    		$$invalidate(0, preview);
    	}

    	function input4_input_handler() {
    		preview.social.facebook = this.value;
    		$$invalidate(0, preview);
    	}

    	function input5_input_handler() {
    		preview.social.youtube = this.value;
    		$$invalidate(0, preview);
    	}

    	function input6_input_handler() {
    		preview.social.instagram = this.value;
    		$$invalidate(0, preview);
    	}

    	function input7_input_handler() {
    		preview.social.telegram = this.value;
    		$$invalidate(0, preview);
    	}

    	function input8_input_handler() {
    		preview.social.linkedin = this.value;
    		$$invalidate(0, preview);
    	}

    	function input9_input_handler() {
    		preview.social.reddit = this.value;
    		$$invalidate(0, preview);
    	}

    	function input10_input_handler() {
    		preview.social.kommunity = this.value;
    		$$invalidate(0, preview);
    	}

    	function input11_input_handler() {
    		preview.social.email = this.value;
    		$$invalidate(0, preview);
    	}

    	function input12_input_handler() {
    		preview.social.website = this.value;
    		$$invalidate(0, preview);
    	}

    	function input13_change_handler() {
    		preferAvatar = this.__value;
    		$$invalidate(1, preferAvatar);
    	}

    	function input14_change_handler() {
    		preferAvatar = this.__value;
    		$$invalidate(1, preferAvatar);
    	}

    	$$self.$$set = $$props => {
    		if ('gopherid' in $$props) $$invalidate(12, gopherid = $$props.gopherid);
    	};

    	$$self.$capture_state = () => ({
    		gopherid,
    		onMount,
    		fade,
    		ShowInfo: Info,
    		gopherData,
    		insertCompany,
    		jobSelector,
    		preview,
    		preferAvatar,
    		showInfo,
    		showError,
    		processMessage,
    		isGopherLoaded,
    		gopherPictures,
    		genRandomGopherPP,
    		fetchGopher,
    		sendGopherData,
    		goHome,
    		deleteGopher,
    		isSubmitButtonDisabled
    	});

    	$$self.$inject_state = $$props => {
    		if ('gopherid' in $$props) $$invalidate(12, gopherid = $$props.gopherid);
    		if ('gopherData' in $$props) gopherData = $$props.gopherData;
    		if ('insertCompany' in $$props) $$invalidate(2, insertCompany = $$props.insertCompany);
    		if ('jobSelector' in $$props) $$invalidate(3, jobSelector = $$props.jobSelector);
    		if ('preview' in $$props) $$invalidate(0, preview = $$props.preview);
    		if ('preferAvatar' in $$props) $$invalidate(1, preferAvatar = $$props.preferAvatar);
    		if ('showInfo' in $$props) $$invalidate(4, showInfo = $$props.showInfo);
    		if ('showError' in $$props) $$invalidate(5, showError = $$props.showError);
    		if ('processMessage' in $$props) $$invalidate(6, processMessage = $$props.processMessage);
    		if ('isGopherLoaded' in $$props) $$invalidate(7, isGopherLoaded = $$props.isGopherLoaded);
    		if ('gopherPictures' in $$props) gopherPictures = $$props.gopherPictures;
    		if ('isSubmitButtonDisabled' in $$props) $$invalidate(8, isSubmitButtonDisabled = $$props.isSubmitButtonDisabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*preview, preferAvatar*/ 3) {
    			$$invalidate(8, isSubmitButtonDisabled = !preview.name || preferAvatar == "twitter" && !preview.social.twitter);
    		}
    	};

    	return [
    		preview,
    		preferAvatar,
    		insertCompany,
    		jobSelector,
    		showInfo,
    		showError,
    		processMessage,
    		isGopherLoaded,
    		isSubmitButtonDisabled,
    		sendGopherData,
    		goHome,
    		deleteGopher,
    		gopherid,
    		input0_input_handler,
    		select0_binding,
    		input_input_handler,
    		select1_change_handler,
    		textarea_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input7_input_handler,
    		input8_input_handler,
    		input9_input_handler,
    		input10_input_handler,
    		input11_input_handler,
    		input12_input_handler,
    		input13_change_handler,
    		$$binding_groups,
    		input14_change_handler
    	];
    }

    class EditGopher extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>@keyframes blink{0%{opacity:.3}50%{opacity:1}100%{opacity:.3}}.loader{width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:50px 0px;gap:30px}.loader img{width:100px}.loadingText{color:gray;animation-name:blink;animation-duration:.5s;animation-iteration-count:infinite}.processInfo{color:white;background-color:green;padding:10px;margin-top:20px;box-shadow:0px 3px 10px rgba(0, 0, 0, 0.3);border-radius:2px}.error{color:white;background-color:darkred;padding:10px;border-radius:2px;box-shadow:0px 3px 10px rgba(0, 0, 0, 0.3);margin-top:20px}.gopherEditor{display:flex;gap:20px;flex-wrap:wrap}.editor{position:relative;min-width:300px;flex:1;padding:20px;background-color:rgb(245, 245, 245);box-shadow:0px 3px 10px rgba(0, 0, 0, 0.3);color:rgb(73, 73, 73);border-radius:2px}.editor .title{font-size:25px;font-weight:bold;color:rgb(20, 20, 20)}.column{display:flex;justify-content:space-between;align-items:center;gap:10px}.column b{flex:1;display:flex;flex-direction:row;align-items:center}b>i{filter:invert(1);margin-right:10px}.descolumn{display:flex;flex-direction:column;gap:10px}.descolumn textarea{color:rgb(73, 73, 73);border-radius:2px;border:none;padding:10px;font-size:16px;width:100%;height:100px;resize:none;margin-bottom:30px;background-color:rgb(240, 240, 240);box-shadow:0px 3px 5px rgba(0, 0, 0, 0.3)}textarea:focus{outline-color:#411f89}textarea::placeholder{color:rgb(104, 102, 102)}.editor input[type="text"]{padding:10px 20px;font-size:16px;border-radius:2px;border:0px;background-color:rgb(240, 240, 240);color:rgb(73, 73, 73);width:200px;margin-bottom:10px;float:right;flex:1;box-shadow:0px 3px 5px rgba(0, 0, 0, 0.3)}input[type="text"]::placeholder{color:rgb(165, 165, 165)}.editor input[type="text"]:focus{outline-color:#411f89}.editor select{font-size:16px;padding:10px 20px;border-radius:2px;border:0px;background-color:rgb(240, 240, 240);color:rgb(73, 73, 73);width:200px;margin-bottom:10px;float:right;flex:1;box-shadow:0px 3px 5px rgba(0, 0, 0, 0.3)}.editor select:focus{outline-color:#411f89}.preview{position:relative;width:100%;max-width:400px;height:1000px}.previewSticky{position:sticky;top:90px}.preview .title{font-size:25px;font-weight:bold;color:rgb(26, 26, 26)}.actionButtons{width:100%;display:flex;margin-top:30px;gap:10px}.cancel{flex:1;background-color:transparent;color:rgb(124, 123, 123);font-size:16px;border:0;padding:10px 20px;cursor:pointer;opacity:0.8}.cancel:hover{opacity:1}.delete{flex:1;background-color:darkred;color:white;font-size:16px;padding:10px 20px;border:0px;cursor:pointer;border-radius:2px;box-shadow:0px 3px 5px rgba(0, 0, 0, 0.3);transition:background-color 0.5s}.delete:hover{background-color:rgb(173, 9, 9)}.confirm{flex:1;background-color:#53309e;color:white;font-size:16px;padding:10px 20px;border:0px;cursor:pointer;border-radius:2px;box-shadow:0px 3px 5px rgba(0, 0, 0, 0.3);transition:background-color 0.5s}.confirm:disabled{cursor:not-allowed;opacity:.5}.confirm:hover{background-color:#411f89}i{background-size:24px;background-repeat:no-repeat;width:24px;height:24px;display:inline-block;opacity:0.7;transition:opacity 0.3s}i:hover{opacity:1}.github{background:url("/public/img/icons/github.png")}.gitlab{background:url("/public/img/icons/gitlab.png")}.twitter{background:url("/public/img/icons/twitter.png")}.facebook{background:url("/public/img/icons/facebook.png")}.youtube{background:url("/public/img/icons/youtube.png")}.telegram{background:url("/public/img/icons/telegram.png")}.linkedin{background:url("/public/img/icons/linkedin.png")}.reddit{background:url("/public/img/icons/reddit.png")}.instagram{background:url("/public/img/icons/instagram.png")}.email{background:url("/public/img/icons/email.png")}.website{background:url("/public/img/icons/website.png")}.kommunity{background:url("/public/img/icons/kommunity.png")}</style>`;

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$3,
    			create_fragment$3,
    			safe_not_equal,
    			{ gopherid: 12 },
    			null,
    			[-1, -1]
    		);

    		const { ctx } = this.$$;
    		const props = this.attributes;

    		if (/*gopherid*/ ctx[12] === undefined && !('gopherid' in props)) {
    			console.warn("<edit-gopher> was created without expected prop 'gopherid'");
    		}

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["gopherid"];
    	}

    	get gopherid() {
    		return this.$$.ctx[12];
    	}

    	set gopherid(gopherid) {
    		this.$$set({ gopherid });
    		flush();
    	}
    }

    customElements.define("edit-gopher", EditGopher);

    /* src/EditRequest.svelte generated by Svelte v3.44.2 */
    const file$2 = "src/EditRequest.svelte";

    // (430:0) {:else}
    function create_else_block_1(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			div0.textContent = "Gopher hazırlanıyor...";
    			if (!src_url_equal(img.src, img_src_value = "/public/img/loading.gif")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "gopher");
    			add_location(img, file$2, 431, 4, 16094);
    			attr_dev(div0, "class", "loadingText");
    			add_location(div0, file$2, 432, 4, 16147);
    			attr_dev(div1, "class", "loader");
    			add_location(div1, file$2, 430, 0, 16069);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(430:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (149:0) {#if isGopherLoaded}
    function create_if_block$2(ctx) {
    	let div32;
    	let div19;
    	let section0;
    	let div0;
    	let t1;
    	let div1;
    	let b0;
    	let t3;
    	let input0;
    	let t4;
    	let div2;
    	let b1;
    	let t6;
    	let select0;
    	let option0;
    	let option1;
    	let option2;
    	let t10;
    	let t11;
    	let div3;
    	let b2;
    	let t13;
    	let select1;
    	let option3;
    	let option4;
    	let option5;
    	let t17;
    	let div4;
    	let b3;
    	let t19;
    	let textarea;
    	let t20;
    	let section1;
    	let div5;
    	let t22;
    	let div6;
    	let b4;
    	let i0;
    	let t23;
    	let t24;
    	let input1;
    	let t25;
    	let div7;
    	let b5;
    	let i1;
    	let t26;
    	let t27;
    	let input2;
    	let t28;
    	let div8;
    	let b6;
    	let i2;
    	let t29;
    	let t30;
    	let input3;
    	let t31;
    	let div9;
    	let b7;
    	let i3;
    	let t32;
    	let t33;
    	let input4;
    	let t34;
    	let div10;
    	let b8;
    	let i4;
    	let t35;
    	let t36;
    	let input5;
    	let t37;
    	let div11;
    	let b9;
    	let i5;
    	let t38;
    	let t39;
    	let input6;
    	let t40;
    	let div12;
    	let b10;
    	let i6;
    	let t41;
    	let t42;
    	let input7;
    	let t43;
    	let div13;
    	let b11;
    	let i7;
    	let t44;
    	let t45;
    	let input8;
    	let t46;
    	let div14;
    	let b12;
    	let i8;
    	let t47;
    	let t48;
    	let input9;
    	let t49;
    	let div15;
    	let b13;
    	let i9;
    	let t50;
    	let t51;
    	let input10;
    	let t52;
    	let div16;
    	let b14;
    	let i10;
    	let t53;
    	let t54;
    	let input11;
    	let t55;
    	let div17;
    	let b15;
    	let i11;
    	let t56;
    	let t57;
    	let input12;
    	let t58;
    	let section2;
    	let div18;
    	let t60;
    	let p0;
    	let t62;
    	let p1;
    	let input13;
    	let t63;
    	let label0;
    	let t65;
    	let p2;
    	let input14;
    	let t66;
    	let label1;
    	let t68;
    	let section3;
    	let div31;
    	let div20;
    	let t70;
    	let div29;
    	let div23;
    	let div21;
    	let t71;
    	let img;
    	let img_src_value;
    	let t72;
    	let div22;
    	let t73;
    	let div28;
    	let div26;
    	let div24;
    	let t74_value = (/*preview*/ ctx[0].name || "John Doe") + "";
    	let t74;
    	let t75;
    	let div25;
    	let t76_value = (/*preview*/ ctx[0].description || "Açıklama Bulunmuyor") + "";
    	let t76;
    	let t77;
    	let div27;
    	let t78;
    	let t79;
    	let t80;
    	let t81;
    	let t82;
    	let t83;
    	let t84;
    	let t85;
    	let t86;
    	let t87;
    	let t88;
    	let div29_cardtype_value;
    	let div29_transition;
    	let t89;
    	let div30;
    	let button0;
    	let t91;
    	let button1;
    	let t93;
    	let button2;
    	let t94;
    	let t95;
    	let t96;
    	let t97;
    	let t98;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*insertCompany*/ ctx[2] && create_if_block_21(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*preview*/ ctx[0].company == "freelancer") return create_if_block_20$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block1 = current_block_type(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*preview*/ ctx[0].job_status == "looking") return create_if_block_17$1;
    		if (/*preview*/ ctx[0].job_status == "hiring") return create_if_block_18$1;
    		if (/*preview*/ ctx[0].company) return create_if_block_19$1;
    	}

    	let current_block_type_1 = select_block_type_2(ctx);
    	let if_block2 = current_block_type_1 && current_block_type_1(ctx);
    	let if_block3 = /*preview*/ ctx[0].social.github && create_if_block_16$1(ctx);
    	let if_block4 = /*preview*/ ctx[0].social.gitlab && create_if_block_15$1(ctx);
    	let if_block5 = /*preview*/ ctx[0].social.twitter && create_if_block_14$1(ctx);
    	let if_block6 = /*preview*/ ctx[0].social.facebook && create_if_block_13$1(ctx);
    	let if_block7 = /*preview*/ ctx[0].social.youtube && create_if_block_12$1(ctx);
    	let if_block8 = /*preview*/ ctx[0].social.instagram && create_if_block_11$1(ctx);
    	let if_block9 = /*preview*/ ctx[0].social.telegram && create_if_block_10$1(ctx);
    	let if_block10 = /*preview*/ ctx[0].social.linkedin && create_if_block_9$1(ctx);
    	let if_block11 = /*preview*/ ctx[0].social.reddit && create_if_block_8$1(ctx);
    	let if_block12 = /*preview*/ ctx[0].social.kommunity && create_if_block_7$1(ctx);
    	let if_block13 = /*preview*/ ctx[0].social.email && create_if_block_6$1(ctx);
    	let if_block14 = /*preview*/ ctx[0].social.website && create_if_block_5$1(ctx);
    	let if_block15 = /*showInfo*/ ctx[4] && create_if_block_4$1(ctx);
    	let if_block16 = /*showError*/ ctx[5] && create_if_block_3$1(ctx);
    	let if_block17 = (/*preview*/ ctx[0].name == "" || /*preview*/ ctx[0].name == undefined) && create_if_block_2$1(ctx);
    	let if_block18 = /*preferAvatar*/ ctx[1] == "twitter" && (/*preview*/ ctx[0].social.twitter == undefined || /*preview*/ ctx[0].social.twitter == "") && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			div32 = element("div");
    			div19 = element("div");
    			section0 = element("section");
    			div0 = element("div");
    			div0.textContent = "Temel Bilgiler";
    			t1 = space();
    			div1 = element("div");
    			b0 = element("b");
    			b0.textContent = "Ad ve Soyad:";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div2 = element("div");
    			b1 = element("b");
    			b1.textContent = "Çalışma Durumu:";
    			t6 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Serbest Çalışıyor";
    			option1 = element("option");
    			option1.textContent = "Şirkette Çalışıyor";
    			option2 = element("option");
    			option2.textContent = "Çalışmıyor";
    			t10 = space();
    			if (if_block0) if_block0.c();
    			t11 = space();
    			div3 = element("div");
    			b2 = element("b");
    			b2.textContent = "Arayış Durumu:";
    			t13 = space();
    			select1 = element("select");
    			option3 = element("option");
    			option3.textContent = "İş Arıyor";
    			option4 = element("option");
    			option4.textContent = "Çalışan Arıyor";
    			option5 = element("option");
    			option5.textContent = "Belirtilmemiş";
    			t17 = space();
    			div4 = element("div");
    			b3 = element("b");
    			b3.textContent = "Açıklama:";
    			t19 = space();
    			textarea = element("textarea");
    			t20 = space();
    			section1 = element("section");
    			div5 = element("div");
    			div5.textContent = "İletişim";
    			t22 = space();
    			div6 = element("div");
    			b4 = element("b");
    			i0 = element("i");
    			t23 = text(" GitHub:");
    			t24 = space();
    			input1 = element("input");
    			t25 = space();
    			div7 = element("div");
    			b5 = element("b");
    			i1 = element("i");
    			t26 = text(" GitLab:");
    			t27 = space();
    			input2 = element("input");
    			t28 = space();
    			div8 = element("div");
    			b6 = element("b");
    			i2 = element("i");
    			t29 = text(" Twitter:");
    			t30 = space();
    			input3 = element("input");
    			t31 = space();
    			div9 = element("div");
    			b7 = element("b");
    			i3 = element("i");
    			t32 = text(" Facebook:");
    			t33 = space();
    			input4 = element("input");
    			t34 = space();
    			div10 = element("div");
    			b8 = element("b");
    			i4 = element("i");
    			t35 = text(" YouTube:");
    			t36 = space();
    			input5 = element("input");
    			t37 = space();
    			div11 = element("div");
    			b9 = element("b");
    			i5 = element("i");
    			t38 = text(" Instagram:");
    			t39 = space();
    			input6 = element("input");
    			t40 = space();
    			div12 = element("div");
    			b10 = element("b");
    			i6 = element("i");
    			t41 = text(" Telegram:");
    			t42 = space();
    			input7 = element("input");
    			t43 = space();
    			div13 = element("div");
    			b11 = element("b");
    			i7 = element("i");
    			t44 = text(" LinkedIn:");
    			t45 = space();
    			input8 = element("input");
    			t46 = space();
    			div14 = element("div");
    			b12 = element("b");
    			i8 = element("i");
    			t47 = text(" Reddit:");
    			t48 = space();
    			input9 = element("input");
    			t49 = space();
    			div15 = element("div");
    			b13 = element("b");
    			i9 = element("i");
    			t50 = text(" Kommunity:");
    			t51 = space();
    			input10 = element("input");
    			t52 = space();
    			div16 = element("div");
    			b14 = element("b");
    			i10 = element("i");
    			t53 = text(" E-Mail:");
    			t54 = space();
    			input11 = element("input");
    			t55 = space();
    			div17 = element("div");
    			b15 = element("b");
    			i11 = element("i");
    			t56 = text(" Website:");
    			t57 = space();
    			input12 = element("input");
    			t58 = space();
    			section2 = element("section");
    			div18 = element("div");
    			div18.textContent = "Gopher Avatar";
    			t60 = space();
    			p0 = element("p");
    			p0.textContent = "Profil resmini kullanma tercihini yapın";
    			t62 = space();
    			p1 = element("p");
    			input13 = element("input");
    			t63 = space();
    			label0 = element("label");
    			label0.textContent = "Rastgele Gopher resmi kullan";
    			t65 = space();
    			p2 = element("p");
    			input14 = element("input");
    			t66 = space();
    			label1 = element("label");
    			label1.textContent = "Twitter profil resmini kullan";
    			t68 = space();
    			section3 = element("section");
    			div31 = element("div");
    			div20 = element("div");
    			div20.textContent = "Ön izleme";
    			t70 = space();
    			div29 = element("div");
    			div23 = element("div");
    			div21 = element("div");
    			if_block1.c();
    			t71 = space();
    			img = element("img");
    			t72 = space();
    			div22 = element("div");
    			if (if_block2) if_block2.c();
    			t73 = space();
    			div28 = element("div");
    			div26 = element("div");
    			div24 = element("div");
    			t74 = text(t74_value);
    			t75 = space();
    			div25 = element("div");
    			t76 = text(t76_value);
    			t77 = space();
    			div27 = element("div");
    			if (if_block3) if_block3.c();
    			t78 = space();
    			if (if_block4) if_block4.c();
    			t79 = space();
    			if (if_block5) if_block5.c();
    			t80 = space();
    			if (if_block6) if_block6.c();
    			t81 = space();
    			if (if_block7) if_block7.c();
    			t82 = space();
    			if (if_block8) if_block8.c();
    			t83 = space();
    			if (if_block9) if_block9.c();
    			t84 = space();
    			if (if_block10) if_block10.c();
    			t85 = space();
    			if (if_block11) if_block11.c();
    			t86 = space();
    			if (if_block12) if_block12.c();
    			t87 = space();
    			if (if_block13) if_block13.c();
    			t88 = space();
    			if (if_block14) if_block14.c();
    			t89 = space();
    			div30 = element("div");
    			button0 = element("button");
    			button0.textContent = "← İptal";
    			t91 = space();
    			button1 = element("button");
    			button1.textContent = "Silme İsteğinde Bulun";
    			t93 = space();
    			button2 = element("button");
    			t94 = text("Düzenleme İsteğinde Bulun");
    			t95 = space();
    			if (if_block15) if_block15.c();
    			t96 = space();
    			if (if_block16) if_block16.c();
    			t97 = space();
    			if (if_block17) if_block17.c();
    			t98 = space();
    			if (if_block18) if_block18.c();
    			attr_dev(div0, "class", "title");
    			add_location(div0, file$2, 152, 12, 4385);
    			add_location(b0, file$2, 154, 16, 4474);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "John Doe");
    			add_location(input0, file$2, 155, 16, 4510);
    			attr_dev(div1, "class", "column");
    			add_location(div1, file$2, 153, 12, 4437);
    			add_location(b1, file$2, 162, 16, 4725);
    			option0.__value = "freelancer";
    			option0.value = option0.__value;
    			add_location(option0, file$2, 164, 20, 4817);
    			option1.__value = "company";
    			option1.value = option1.__value;
    			add_location(option1, file$2, 165, 20, 4891);
    			option2.__value = "";
    			option2.value = option2.__value;
    			option2.selected = true;
    			add_location(option2, file$2, 166, 20, 4963);
    			add_location(select0, file$2, 163, 16, 4764);
    			attr_dev(div2, "class", "column");
    			add_location(div2, file$2, 161, 12, 4688);
    			add_location(b2, file$2, 178, 16, 5390);
    			option3.__value = "looking";
    			option3.value = option3.__value;
    			add_location(option3, file$2, 180, 20, 5495);
    			option4.__value = "hiring";
    			option4.value = option4.__value;
    			add_location(option4, file$2, 181, 20, 5558);
    			option5.__value = "";
    			option5.value = option5.__value;
    			option5.selected = true;
    			add_location(option5, file$2, 182, 20, 5625);
    			attr_dev(select1, "place", "");
    			if (/*preview*/ ctx[0].job_status === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[16].call(select1));
    			add_location(select1, file$2, 179, 16, 5428);
    			attr_dev(div3, "class", "column");
    			add_location(div3, file$2, 177, 12, 5353);
    			add_location(b3, file$2, 186, 16, 5771);
    			attr_dev(textarea, "placeholder", "Buraya açıklama girebilirsiniz...");
    			add_location(textarea, file$2, 187, 16, 5804);
    			attr_dev(div4, "class", "descolumn");
    			add_location(div4, file$2, 185, 12, 5731);
    			add_location(section0, file$2, 151, 8, 4363);
    			attr_dev(div5, "class", "title");
    			add_location(div5, file$2, 195, 12, 6023);
    			attr_dev(i0, "class", "github");
    			add_location(i0, file$2, 197, 19, 6109);
    			add_location(b4, file$2, 197, 16, 6106);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "kullanıcı adı");
    			add_location(input1, file$2, 198, 16, 6158);
    			attr_dev(div6, "class", "column");
    			add_location(div6, file$2, 196, 12, 6069);
    			attr_dev(i1, "class", "gitlab");
    			add_location(i1, file$2, 205, 19, 6390);
    			add_location(b5, file$2, 205, 16, 6387);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "placeholder", "kullanıcı adı");
    			add_location(input2, file$2, 206, 16, 6439);
    			attr_dev(div7, "class", "column");
    			add_location(div7, file$2, 204, 12, 6350);
    			attr_dev(i2, "class", "twitter");
    			add_location(i2, file$2, 213, 19, 6671);
    			add_location(b6, file$2, 213, 16, 6668);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "placeholder", "kullanıcı adı");
    			add_location(input3, file$2, 214, 16, 6722);
    			attr_dev(div8, "class", "column");
    			add_location(div8, file$2, 212, 12, 6631);
    			attr_dev(i3, "class", "facebook");
    			add_location(i3, file$2, 221, 19, 6955);
    			add_location(b7, file$2, 221, 16, 6952);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "placeholder", "kullanıcı adı");
    			add_location(input4, file$2, 222, 16, 7008);
    			attr_dev(div9, "class", "column");
    			add_location(div9, file$2, 220, 12, 6915);
    			attr_dev(i4, "class", "youtube");
    			add_location(i4, file$2, 229, 19, 7242);
    			add_location(b8, file$2, 229, 16, 7239);
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "placeholder", "/u/kanallinki");
    			add_location(input5, file$2, 230, 16, 7293);
    			attr_dev(div10, "class", "column");
    			add_location(div10, file$2, 228, 12, 7202);
    			attr_dev(i5, "class", "instagram");
    			add_location(i5, file$2, 237, 19, 7526);
    			add_location(b9, file$2, 237, 16, 7523);
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "placeholder", "kullanıcı adı");
    			add_location(input6, file$2, 238, 16, 7581);
    			attr_dev(div11, "class", "column");
    			add_location(div11, file$2, 236, 12, 7486);
    			attr_dev(i6, "class", "telegram");
    			add_location(i6, file$2, 245, 19, 7816);
    			add_location(b10, file$2, 245, 16, 7813);
    			attr_dev(input7, "type", "text");
    			attr_dev(input7, "placeholder", "kullanıcı adı");
    			add_location(input7, file$2, 246, 16, 7869);
    			attr_dev(div12, "class", "column");
    			add_location(div12, file$2, 244, 12, 7776);
    			attr_dev(i7, "class", "linkedin");
    			add_location(i7, file$2, 253, 19, 8103);
    			add_location(b11, file$2, 253, 16, 8100);
    			attr_dev(input8, "type", "text");
    			attr_dev(input8, "placeholder", "kullanıcı adı");
    			add_location(input8, file$2, 254, 16, 8156);
    			attr_dev(div13, "class", "column");
    			add_location(div13, file$2, 252, 12, 8063);
    			attr_dev(i8, "class", "reddit");
    			add_location(i8, file$2, 261, 19, 8390);
    			add_location(b12, file$2, 261, 16, 8387);
    			attr_dev(input9, "type", "text");
    			attr_dev(input9, "placeholder", "kullanıcı adı");
    			add_location(input9, file$2, 262, 16, 8439);
    			attr_dev(div14, "class", "column");
    			add_location(div14, file$2, 260, 12, 8350);
    			attr_dev(i9, "class", "kommunity");
    			add_location(i9, file$2, 269, 19, 8671);
    			add_location(b13, file$2, 269, 16, 8668);
    			attr_dev(input10, "type", "text");
    			attr_dev(input10, "placeholder", "kullanıcı adı");
    			add_location(input10, file$2, 270, 16, 8726);
    			attr_dev(div15, "class", "column");
    			add_location(div15, file$2, 268, 12, 8631);
    			attr_dev(i10, "class", "email");
    			add_location(i10, file$2, 277, 19, 8961);
    			add_location(b14, file$2, 277, 16, 8958);
    			attr_dev(input11, "type", "text");
    			attr_dev(input11, "placeholder", "me@example.com");
    			add_location(input11, file$2, 278, 16, 9009);
    			attr_dev(div16, "class", "column");
    			add_location(div16, file$2, 276, 12, 8921);
    			attr_dev(i11, "class", "website");
    			add_location(i11, file$2, 285, 19, 9241);
    			add_location(b15, file$2, 285, 16, 9238);
    			attr_dev(input12, "type", "text");
    			attr_dev(input12, "placeholder", "https://example.com");
    			add_location(input12, file$2, 286, 16, 9292);
    			attr_dev(div17, "class", "column");
    			add_location(div17, file$2, 284, 12, 9201);
    			add_location(section1, file$2, 194, 8, 6001);
    			attr_dev(div18, "class", "title");
    			add_location(div18, file$2, 294, 12, 9528);
    			add_location(p0, file$2, 295, 12, 9579);
    			attr_dev(input13, "type", "radio");
    			attr_dev(input13, "name", "from");
    			attr_dev(input13, "id", "randomGopher");
    			input13.__value = "randomGopher";
    			input13.value = input13.__value;
    			/*$$binding_groups*/ ctx[31][0].push(input13);
    			add_location(input13, file$2, 297, 16, 9658);
    			attr_dev(label0, "for", "randomGopher");
    			add_location(label0, file$2, 298, 16, 9772);
    			add_location(p1, file$2, 296, 12, 9638);
    			attr_dev(input14, "type", "radio");
    			attr_dev(input14, "name", "from");
    			attr_dev(input14, "id", "fetchfromtw");
    			input14.__value = "twitter";
    			input14.value = input14.__value;
    			/*$$binding_groups*/ ctx[31][0].push(input14);
    			add_location(input14, file$2, 301, 16, 9884);
    			attr_dev(label1, "for", "fetchfromtw");
    			add_location(label1, file$2, 302, 16, 9992);
    			add_location(p2, file$2, 300, 12, 9864);
    			add_location(section2, file$2, 293, 8, 9506);
    			attr_dev(div19, "class", "editor");
    			add_location(div19, file$2, 150, 4, 4334);
    			attr_dev(div20, "class", "title");
    			add_location(div20, file$2, 309, 12, 10218);
    			attr_dev(div21, "class", "companySide");
    			add_location(div21, file$2, 312, 20, 10391);
    			attr_dev(img, "class", "avatar");
    			if (!src_url_equal(img.src, img_src_value = /*preview*/ ctx[0].profile_img_url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "ppimage");
    			add_location(img, file$2, 319, 20, 10696);
    			attr_dev(div22, "class", "jobStatusSide");
    			add_location(div22, file$2, 324, 20, 10875);
    			attr_dev(div23, "class", "leftSide");
    			add_location(div23, file$2, 311, 16, 10348);
    			attr_dev(div24, "class", "name");
    			add_location(div24, file$2, 331, 24, 11253);
    			attr_dev(div25, "class", "description");
    			add_location(div25, file$2, 332, 24, 11330);
    			attr_dev(div26, "class", "topSide");
    			add_location(div26, file$2, 330, 20, 11207);
    			attr_dev(div27, "class", "socialLinks");
    			add_location(div27, file$2, 336, 20, 11509);
    			attr_dev(div28, "class", "rightSide");
    			add_location(div28, file$2, 329, 16, 11163);
    			attr_dev(div29, "class", "gopher");
    			attr_dev(div29, "cardtype", div29_cardtype_value = /*preview*/ ctx[0].job_status);
    			add_location(div29, file$2, 310, 12, 10265);
    			attr_dev(button0, "class", "cancel");
    			add_location(button0, file$2, 398, 16, 14933);
    			attr_dev(button1, "class", "delete");
    			add_location(button1, file$2, 401, 16, 15055);
    			attr_dev(button2, "class", "confirm");
    			button2.disabled = /*isSubmitButtonDisabled*/ ctx[8];
    			add_location(button2, file$2, 402, 16, 15162);
    			attr_dev(div30, "class", "actionButtons");
    			add_location(div30, file$2, 397, 12, 14889);
    			attr_dev(div31, "class", "previewSticky");
    			add_location(div31, file$2, 308, 8, 10178);
    			attr_dev(section3, "class", "preview");
    			add_location(section3, file$2, 307, 4, 10144);
    			attr_dev(div32, "class", "gopherEditor");
    			add_location(div32, file$2, 149, 0, 4303);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div32, anchor);
    			append_dev(div32, div19);
    			append_dev(div19, section0);
    			append_dev(section0, div0);
    			append_dev(section0, t1);
    			append_dev(section0, div1);
    			append_dev(div1, b0);
    			append_dev(div1, t3);
    			append_dev(div1, input0);
    			set_input_value(input0, /*preview*/ ctx[0].name);
    			append_dev(section0, t4);
    			append_dev(section0, div2);
    			append_dev(div2, b1);
    			append_dev(div2, t6);
    			append_dev(div2, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(select0, option2);
    			/*select0_binding*/ ctx[14](select0);
    			append_dev(div2, t10);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(section0, t11);
    			append_dev(section0, div3);
    			append_dev(div3, b2);
    			append_dev(div3, t13);
    			append_dev(div3, select1);
    			append_dev(select1, option3);
    			append_dev(select1, option4);
    			append_dev(select1, option5);
    			select_option(select1, /*preview*/ ctx[0].job_status);
    			append_dev(section0, t17);
    			append_dev(section0, div4);
    			append_dev(div4, b3);
    			append_dev(div4, t19);
    			append_dev(div4, textarea);
    			set_input_value(textarea, /*preview*/ ctx[0].description);
    			append_dev(div19, t20);
    			append_dev(div19, section1);
    			append_dev(section1, div5);
    			append_dev(section1, t22);
    			append_dev(section1, div6);
    			append_dev(div6, b4);
    			append_dev(b4, i0);
    			append_dev(b4, t23);
    			append_dev(div6, t24);
    			append_dev(div6, input1);
    			set_input_value(input1, /*preview*/ ctx[0].social.github);
    			append_dev(section1, t25);
    			append_dev(section1, div7);
    			append_dev(div7, b5);
    			append_dev(b5, i1);
    			append_dev(b5, t26);
    			append_dev(div7, t27);
    			append_dev(div7, input2);
    			set_input_value(input2, /*preview*/ ctx[0].social.gitlab);
    			append_dev(section1, t28);
    			append_dev(section1, div8);
    			append_dev(div8, b6);
    			append_dev(b6, i2);
    			append_dev(b6, t29);
    			append_dev(div8, t30);
    			append_dev(div8, input3);
    			set_input_value(input3, /*preview*/ ctx[0].social.twitter);
    			append_dev(section1, t31);
    			append_dev(section1, div9);
    			append_dev(div9, b7);
    			append_dev(b7, i3);
    			append_dev(b7, t32);
    			append_dev(div9, t33);
    			append_dev(div9, input4);
    			set_input_value(input4, /*preview*/ ctx[0].social.facebook);
    			append_dev(section1, t34);
    			append_dev(section1, div10);
    			append_dev(div10, b8);
    			append_dev(b8, i4);
    			append_dev(b8, t35);
    			append_dev(div10, t36);
    			append_dev(div10, input5);
    			set_input_value(input5, /*preview*/ ctx[0].social.youtube);
    			append_dev(section1, t37);
    			append_dev(section1, div11);
    			append_dev(div11, b9);
    			append_dev(b9, i5);
    			append_dev(b9, t38);
    			append_dev(div11, t39);
    			append_dev(div11, input6);
    			set_input_value(input6, /*preview*/ ctx[0].social.instagram);
    			append_dev(section1, t40);
    			append_dev(section1, div12);
    			append_dev(div12, b10);
    			append_dev(b10, i6);
    			append_dev(b10, t41);
    			append_dev(div12, t42);
    			append_dev(div12, input7);
    			set_input_value(input7, /*preview*/ ctx[0].social.telegram);
    			append_dev(section1, t43);
    			append_dev(section1, div13);
    			append_dev(div13, b11);
    			append_dev(b11, i7);
    			append_dev(b11, t44);
    			append_dev(div13, t45);
    			append_dev(div13, input8);
    			set_input_value(input8, /*preview*/ ctx[0].social.linkedin);
    			append_dev(section1, t46);
    			append_dev(section1, div14);
    			append_dev(div14, b12);
    			append_dev(b12, i8);
    			append_dev(b12, t47);
    			append_dev(div14, t48);
    			append_dev(div14, input9);
    			set_input_value(input9, /*preview*/ ctx[0].social.reddit);
    			append_dev(section1, t49);
    			append_dev(section1, div15);
    			append_dev(div15, b13);
    			append_dev(b13, i9);
    			append_dev(b13, t50);
    			append_dev(div15, t51);
    			append_dev(div15, input10);
    			set_input_value(input10, /*preview*/ ctx[0].social.kommunity);
    			append_dev(section1, t52);
    			append_dev(section1, div16);
    			append_dev(div16, b14);
    			append_dev(b14, i10);
    			append_dev(b14, t53);
    			append_dev(div16, t54);
    			append_dev(div16, input11);
    			set_input_value(input11, /*preview*/ ctx[0].social.email);
    			append_dev(section1, t55);
    			append_dev(section1, div17);
    			append_dev(div17, b15);
    			append_dev(b15, i11);
    			append_dev(b15, t56);
    			append_dev(div17, t57);
    			append_dev(div17, input12);
    			set_input_value(input12, /*preview*/ ctx[0].social.website);
    			append_dev(div19, t58);
    			append_dev(div19, section2);
    			append_dev(section2, div18);
    			append_dev(section2, t60);
    			append_dev(section2, p0);
    			append_dev(section2, t62);
    			append_dev(section2, p1);
    			append_dev(p1, input13);
    			input13.checked = input13.__value === /*preferAvatar*/ ctx[1];
    			append_dev(p1, t63);
    			append_dev(p1, label0);
    			append_dev(section2, t65);
    			append_dev(section2, p2);
    			append_dev(p2, input14);
    			input14.checked = input14.__value === /*preferAvatar*/ ctx[1];
    			append_dev(p2, t66);
    			append_dev(p2, label1);
    			append_dev(div32, t68);
    			append_dev(div32, section3);
    			append_dev(section3, div31);
    			append_dev(div31, div20);
    			append_dev(div31, t70);
    			append_dev(div31, div29);
    			append_dev(div29, div23);
    			append_dev(div23, div21);
    			if_block1.m(div21, null);
    			append_dev(div23, t71);
    			append_dev(div23, img);
    			append_dev(div23, t72);
    			append_dev(div23, div22);
    			if (if_block2) if_block2.m(div22, null);
    			append_dev(div29, t73);
    			append_dev(div29, div28);
    			append_dev(div28, div26);
    			append_dev(div26, div24);
    			append_dev(div24, t74);
    			append_dev(div26, t75);
    			append_dev(div26, div25);
    			append_dev(div25, t76);
    			append_dev(div28, t77);
    			append_dev(div28, div27);
    			if (if_block3) if_block3.m(div27, null);
    			append_dev(div27, t78);
    			if (if_block4) if_block4.m(div27, null);
    			append_dev(div27, t79);
    			if (if_block5) if_block5.m(div27, null);
    			append_dev(div27, t80);
    			if (if_block6) if_block6.m(div27, null);
    			append_dev(div27, t81);
    			if (if_block7) if_block7.m(div27, null);
    			append_dev(div27, t82);
    			if (if_block8) if_block8.m(div27, null);
    			append_dev(div27, t83);
    			if (if_block9) if_block9.m(div27, null);
    			append_dev(div27, t84);
    			if (if_block10) if_block10.m(div27, null);
    			append_dev(div27, t85);
    			if (if_block11) if_block11.m(div27, null);
    			append_dev(div27, t86);
    			if (if_block12) if_block12.m(div27, null);
    			append_dev(div27, t87);
    			if (if_block13) if_block13.m(div27, null);
    			append_dev(div27, t88);
    			if (if_block14) if_block14.m(div27, null);
    			append_dev(div31, t89);
    			append_dev(div31, div30);
    			append_dev(div30, button0);
    			append_dev(div30, t91);
    			append_dev(div30, button1);
    			append_dev(div30, t93);
    			append_dev(div30, button2);
    			append_dev(button2, t94);
    			append_dev(div31, t95);
    			if (if_block15) if_block15.m(div31, null);
    			append_dev(div31, t96);
    			if (if_block16) if_block16.m(div31, null);
    			append_dev(div31, t97);
    			if (if_block17) if_block17.m(div31, null);
    			append_dev(div31, t98);
    			if (if_block18) if_block18.m(div31, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[13]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[16]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[17]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[18]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[19]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[20]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[21]),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[22]),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[23]),
    					listen_dev(input7, "input", /*input7_input_handler*/ ctx[24]),
    					listen_dev(input8, "input", /*input8_input_handler*/ ctx[25]),
    					listen_dev(input9, "input", /*input9_input_handler*/ ctx[26]),
    					listen_dev(input10, "input", /*input10_input_handler*/ ctx[27]),
    					listen_dev(input11, "input", /*input11_input_handler*/ ctx[28]),
    					listen_dev(input12, "input", /*input12_input_handler*/ ctx[29]),
    					listen_dev(input13, "change", /*input13_change_handler*/ ctx[30]),
    					listen_dev(input14, "change", /*input14_change_handler*/ ctx[32]),
    					listen_dev(button0, "click", /*goHome*/ ctx[10], false, false, false),
    					listen_dev(
    						button1,
    						"click",
    						function () {
    							if (is_function(/*deleteGopher*/ ctx[11](/*preview*/ ctx[0].id))) /*deleteGopher*/ ctx[11](/*preview*/ ctx[0].id).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(button2, "click", /*sendGopherData*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*preview*/ 1 && input0.value !== /*preview*/ ctx[0].name) {
    				set_input_value(input0, /*preview*/ ctx[0].name);
    			}

    			if (/*insertCompany*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*insertCompany*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_21(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div2, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*preview*/ 1) {
    				select_option(select1, /*preview*/ ctx[0].job_status);
    			}

    			if (dirty[0] & /*preview*/ 1) {
    				set_input_value(textarea, /*preview*/ ctx[0].description);
    			}

    			if (dirty[0] & /*preview*/ 1 && input1.value !== /*preview*/ ctx[0].social.github) {
    				set_input_value(input1, /*preview*/ ctx[0].social.github);
    			}

    			if (dirty[0] & /*preview*/ 1 && input2.value !== /*preview*/ ctx[0].social.gitlab) {
    				set_input_value(input2, /*preview*/ ctx[0].social.gitlab);
    			}

    			if (dirty[0] & /*preview*/ 1 && input3.value !== /*preview*/ ctx[0].social.twitter) {
    				set_input_value(input3, /*preview*/ ctx[0].social.twitter);
    			}

    			if (dirty[0] & /*preview*/ 1 && input4.value !== /*preview*/ ctx[0].social.facebook) {
    				set_input_value(input4, /*preview*/ ctx[0].social.facebook);
    			}

    			if (dirty[0] & /*preview*/ 1 && input5.value !== /*preview*/ ctx[0].social.youtube) {
    				set_input_value(input5, /*preview*/ ctx[0].social.youtube);
    			}

    			if (dirty[0] & /*preview*/ 1 && input6.value !== /*preview*/ ctx[0].social.instagram) {
    				set_input_value(input6, /*preview*/ ctx[0].social.instagram);
    			}

    			if (dirty[0] & /*preview*/ 1 && input7.value !== /*preview*/ ctx[0].social.telegram) {
    				set_input_value(input7, /*preview*/ ctx[0].social.telegram);
    			}

    			if (dirty[0] & /*preview*/ 1 && input8.value !== /*preview*/ ctx[0].social.linkedin) {
    				set_input_value(input8, /*preview*/ ctx[0].social.linkedin);
    			}

    			if (dirty[0] & /*preview*/ 1 && input9.value !== /*preview*/ ctx[0].social.reddit) {
    				set_input_value(input9, /*preview*/ ctx[0].social.reddit);
    			}

    			if (dirty[0] & /*preview*/ 1 && input10.value !== /*preview*/ ctx[0].social.kommunity) {
    				set_input_value(input10, /*preview*/ ctx[0].social.kommunity);
    			}

    			if (dirty[0] & /*preview*/ 1 && input11.value !== /*preview*/ ctx[0].social.email) {
    				set_input_value(input11, /*preview*/ ctx[0].social.email);
    			}

    			if (dirty[0] & /*preview*/ 1 && input12.value !== /*preview*/ ctx[0].social.website) {
    				set_input_value(input12, /*preview*/ ctx[0].social.website);
    			}

    			if (dirty[0] & /*preferAvatar*/ 2) {
    				input13.checked = input13.__value === /*preferAvatar*/ ctx[1];
    			}

    			if (dirty[0] & /*preferAvatar*/ 2) {
    				input14.checked = input14.__value === /*preferAvatar*/ ctx[1];
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div21, null);
    				}
    			}

    			if (!current || dirty[0] & /*preview*/ 1 && !src_url_equal(img.src, img_src_value = /*preview*/ ctx[0].profile_img_url)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (current_block_type_1 !== (current_block_type_1 = select_block_type_2(ctx))) {
    				if (if_block2) if_block2.d(1);
    				if_block2 = current_block_type_1 && current_block_type_1(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div22, null);
    				}
    			}

    			if ((!current || dirty[0] & /*preview*/ 1) && t74_value !== (t74_value = (/*preview*/ ctx[0].name || "John Doe") + "")) set_data_dev(t74, t74_value);
    			if ((!current || dirty[0] & /*preview*/ 1) && t76_value !== (t76_value = (/*preview*/ ctx[0].description || "Açıklama Bulunmuyor") + "")) set_data_dev(t76, t76_value);

    			if (/*preview*/ ctx[0].social.github) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_16$1(ctx);
    					if_block3.c();
    					if_block3.m(div27, t78);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*preview*/ ctx[0].social.gitlab) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_15$1(ctx);
    					if_block4.c();
    					if_block4.m(div27, t79);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*preview*/ ctx[0].social.twitter) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_14$1(ctx);
    					if_block5.c();
    					if_block5.m(div27, t80);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*preview*/ ctx[0].social.facebook) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_13$1(ctx);
    					if_block6.c();
    					if_block6.m(div27, t81);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*preview*/ ctx[0].social.youtube) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_12$1(ctx);
    					if_block7.c();
    					if_block7.m(div27, t82);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (/*preview*/ ctx[0].social.instagram) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);
    				} else {
    					if_block8 = create_if_block_11$1(ctx);
    					if_block8.c();
    					if_block8.m(div27, t83);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (/*preview*/ ctx[0].social.telegram) {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);
    				} else {
    					if_block9 = create_if_block_10$1(ctx);
    					if_block9.c();
    					if_block9.m(div27, t84);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}

    			if (/*preview*/ ctx[0].social.linkedin) {
    				if (if_block10) {
    					if_block10.p(ctx, dirty);
    				} else {
    					if_block10 = create_if_block_9$1(ctx);
    					if_block10.c();
    					if_block10.m(div27, t85);
    				}
    			} else if (if_block10) {
    				if_block10.d(1);
    				if_block10 = null;
    			}

    			if (/*preview*/ ctx[0].social.reddit) {
    				if (if_block11) {
    					if_block11.p(ctx, dirty);
    				} else {
    					if_block11 = create_if_block_8$1(ctx);
    					if_block11.c();
    					if_block11.m(div27, t86);
    				}
    			} else if (if_block11) {
    				if_block11.d(1);
    				if_block11 = null;
    			}

    			if (/*preview*/ ctx[0].social.kommunity) {
    				if (if_block12) {
    					if_block12.p(ctx, dirty);
    				} else {
    					if_block12 = create_if_block_7$1(ctx);
    					if_block12.c();
    					if_block12.m(div27, t87);
    				}
    			} else if (if_block12) {
    				if_block12.d(1);
    				if_block12 = null;
    			}

    			if (/*preview*/ ctx[0].social.email) {
    				if (if_block13) {
    					if_block13.p(ctx, dirty);
    				} else {
    					if_block13 = create_if_block_6$1(ctx);
    					if_block13.c();
    					if_block13.m(div27, t88);
    				}
    			} else if (if_block13) {
    				if_block13.d(1);
    				if_block13 = null;
    			}

    			if (/*preview*/ ctx[0].social.website) {
    				if (if_block14) {
    					if_block14.p(ctx, dirty);
    				} else {
    					if_block14 = create_if_block_5$1(ctx);
    					if_block14.c();
    					if_block14.m(div27, null);
    				}
    			} else if (if_block14) {
    				if_block14.d(1);
    				if_block14 = null;
    			}

    			if (!current || dirty[0] & /*preview*/ 1 && div29_cardtype_value !== (div29_cardtype_value = /*preview*/ ctx[0].job_status)) {
    				attr_dev(div29, "cardtype", div29_cardtype_value);
    			}

    			if (!current || dirty[0] & /*isSubmitButtonDisabled*/ 256) {
    				prop_dev(button2, "disabled", /*isSubmitButtonDisabled*/ ctx[8]);
    			}

    			if (/*showInfo*/ ctx[4]) {
    				if (if_block15) {
    					if_block15.p(ctx, dirty);
    				} else {
    					if_block15 = create_if_block_4$1(ctx);
    					if_block15.c();
    					if_block15.m(div31, t96);
    				}
    			} else if (if_block15) {
    				if_block15.d(1);
    				if_block15 = null;
    			}

    			if (/*showError*/ ctx[5]) {
    				if (if_block16) {
    					if_block16.p(ctx, dirty);
    				} else {
    					if_block16 = create_if_block_3$1(ctx);
    					if_block16.c();
    					if_block16.m(div31, t97);
    				}
    			} else if (if_block16) {
    				if_block16.d(1);
    				if_block16 = null;
    			}

    			if (/*preview*/ ctx[0].name == "" || /*preview*/ ctx[0].name == undefined) {
    				if (if_block17) ; else {
    					if_block17 = create_if_block_2$1(ctx);
    					if_block17.c();
    					if_block17.m(div31, t98);
    				}
    			} else if (if_block17) {
    				if_block17.d(1);
    				if_block17 = null;
    			}

    			if (/*preferAvatar*/ ctx[1] == "twitter" && (/*preview*/ ctx[0].social.twitter == undefined || /*preview*/ ctx[0].social.twitter == "")) {
    				if (if_block18) ; else {
    					if_block18 = create_if_block_1$2(ctx);
    					if_block18.c();
    					if_block18.m(div31, null);
    				}
    			} else if (if_block18) {
    				if_block18.d(1);
    				if_block18 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);

    			add_render_callback(() => {
    				if (!div29_transition) div29_transition = create_bidirectional_transition(div29, fade, {}, true);
    				div29_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			if (!div29_transition) div29_transition = create_bidirectional_transition(div29, fade, {}, false);
    			div29_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div32);
    			/*select0_binding*/ ctx[14](null);
    			if (if_block0) if_block0.d();
    			/*$$binding_groups*/ ctx[31][0].splice(/*$$binding_groups*/ ctx[31][0].indexOf(input13), 1);
    			/*$$binding_groups*/ ctx[31][0].splice(/*$$binding_groups*/ ctx[31][0].indexOf(input14), 1);
    			if_block1.d();

    			if (if_block2) {
    				if_block2.d();
    			}

    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			if (if_block8) if_block8.d();
    			if (if_block9) if_block9.d();
    			if (if_block10) if_block10.d();
    			if (if_block11) if_block11.d();
    			if (if_block12) if_block12.d();
    			if (if_block13) if_block13.d();
    			if (if_block14) if_block14.d();
    			if (detaching && div29_transition) div29_transition.end();
    			if (if_block15) if_block15.d();
    			if (if_block16) if_block16.d();
    			if (if_block17) if_block17.d();
    			if (if_block18) if_block18.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(149:0) {#if isGopherLoaded}",
    		ctx
    	});

    	return block;
    }

    // (169:16) {#if insertCompany}
    function create_if_block_21(ctx) {
    	let input;
    	let input_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Şirket İsmi");
    			add_location(input, file$2, 169, 20, 5091);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*preview*/ ctx[0].company);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[15]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && input.value !== /*preview*/ ctx[0].company) {
    				set_input_value(input, /*preview*/ ctx[0].company);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!input_transition) input_transition = create_bidirectional_transition(input, fade, {}, true);
    				input_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!input_transition) input_transition = create_bidirectional_transition(input, fade, {}, false);
    			input_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching && input_transition) input_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_21.name,
    		type: "if",
    		source: "(169:16) {#if insertCompany}",
    		ctx
    	});

    	return block;
    }

    // (316:24) {:else}
    function create_else_block$1(ctx) {
    	let t_value = (/*preview*/ ctx[0].company || "Çalışmıyor") + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && t_value !== (t_value = (/*preview*/ ctx[0].company || "Çalışmıyor") + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(316:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (314:24) {#if preview.company == "freelancer"}
    function create_if_block_20$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Serbest Çalışıyor");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20$1.name,
    		type: "if",
    		source: "(314:24) {#if preview.company == \\\"freelancer\\\"}",
    		ctx
    	});

    	return block;
    }

    // (327:60) 
    function create_if_block_19$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Çalışıyor");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19$1.name,
    		type: "if",
    		source: "(327:60) ",
    		ctx
    	});

    	return block;
    }

    // (326:111) 
    function create_if_block_18$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Çalışan\n                            Arıyor");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18$1.name,
    		type: "if",
    		source: "(326:111) ",
    		ctx
    	});

    	return block;
    }

    // (326:24) {#if preview.job_status == "looking"}
    function create_if_block_17$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("İş Arıyor");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17$1.name,
    		type: "if",
    		source: "(326:24) {#if preview.job_status == \\\"looking\\\"}",
    		ctx
    	});

    	return block;
    }

    // (338:24) {#if preview.social.github}
    function create_if_block_16$1(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "github");
    			add_location(i, file$2, 340, 48, 11756);
    			attr_dev(a, "href", a_href_value = "https://github.com/" + /*preview*/ ctx[0].social.github);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 337, 51, 11586);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://github.com/" + /*preview*/ ctx[0].social.github)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16$1.name,
    		type: "if",
    		source: "(338:24) {#if preview.social.github}",
    		ctx
    	});

    	return block;
    }

    // (343:24) {#if preview.social.gitlab}
    function create_if_block_15$1(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "gitlab");
    			add_location(i, file$2, 345, 48, 12036);
    			attr_dev(a, "href", a_href_value = "https://gitlab.com/" + /*preview*/ ctx[0].social.gitlab);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 342, 51, 11866);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://gitlab.com/" + /*preview*/ ctx[0].social.gitlab)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15$1.name,
    		type: "if",
    		source: "(343:24) {#if preview.social.gitlab}",
    		ctx
    	});

    	return block;
    }

    // (348:24) {#if preview.social.twitter}
    function create_if_block_14$1(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "twitter");
    			add_location(i, file$2, 350, 48, 12319);
    			attr_dev(a, "href", a_href_value = "https://twitter.com/" + /*preview*/ ctx[0].social.twitter);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 347, 52, 12147);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://twitter.com/" + /*preview*/ ctx[0].social.twitter)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14$1.name,
    		type: "if",
    		source: "(348:24) {#if preview.social.twitter}",
    		ctx
    	});

    	return block;
    }

    // (353:24) {#if preview.social.facebook}
    function create_if_block_13$1(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "facebook");
    			add_location(i, file$2, 355, 48, 12606);
    			attr_dev(a, "href", a_href_value = "https://facebook.com/" + /*preview*/ ctx[0].social.facebook);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 352, 53, 12432);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://facebook.com/" + /*preview*/ ctx[0].social.facebook)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13$1.name,
    		type: "if",
    		source: "(353:24) {#if preview.social.facebook}",
    		ctx
    	});

    	return block;
    }

    // (358:24) {#if preview.social.youtube}
    function create_if_block_12$1(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "youtube");
    			add_location(i, file$2, 360, 48, 12891);
    			attr_dev(a, "href", a_href_value = "https://youtube.com/" + /*preview*/ ctx[0].social.youtube);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 357, 52, 12719);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://youtube.com/" + /*preview*/ ctx[0].social.youtube)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12$1.name,
    		type: "if",
    		source: "(358:24) {#if preview.social.youtube}",
    		ctx
    	});

    	return block;
    }

    // (363:24) {#if preview.social.instagram}
    function create_if_block_11$1(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "instagram");
    			add_location(i, file$2, 365, 48, 13181);
    			attr_dev(a, "href", a_href_value = "https://instagram.com/" + /*preview*/ ctx[0].social.instagram);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 362, 54, 13005);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://instagram.com/" + /*preview*/ ctx[0].social.instagram)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11$1.name,
    		type: "if",
    		source: "(363:24) {#if preview.social.instagram}",
    		ctx
    	});

    	return block;
    }

    // (368:24) {#if preview.social.telegram}
    function create_if_block_10$1(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "telegram");
    			add_location(i, file$2, 369, 48, 13425);
    			attr_dev(a, "href", a_href_value = "https://t.me/" + /*preview*/ ctx[0].social.telegram);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 367, 53, 13296);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://t.me/" + /*preview*/ ctx[0].social.telegram)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$1.name,
    		type: "if",
    		source: "(368:24) {#if preview.social.telegram}",
    		ctx
    	});

    	return block;
    }

    // (372:24) {#if preview.social.linkedin}
    function create_if_block_9$1(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "linkedin");
    			add_location(i, file$2, 374, 48, 13716);
    			attr_dev(a, "href", a_href_value = "https://linkedin.com/in/" + /*preview*/ ctx[0].social.linkedin);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 371, 53, 13539);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://linkedin.com/in/" + /*preview*/ ctx[0].social.linkedin)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$1.name,
    		type: "if",
    		source: "(372:24) {#if preview.social.linkedin}",
    		ctx
    	});

    	return block;
    }

    // (377:24) {#if preview.social.reddit}
    function create_if_block_8$1(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "reddit");
    			add_location(i, file$2, 379, 48, 14000);
    			attr_dev(a, "href", a_href_value = "https://reddit.com/u/" + /*preview*/ ctx[0].social.reddit);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 376, 51, 13828);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://reddit.com/u/" + /*preview*/ ctx[0].social.reddit)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$1.name,
    		type: "if",
    		source: "(377:24) {#if preview.social.reddit}",
    		ctx
    	});

    	return block;
    }

    // (382:24) {#if preview.social.kommunity}
    function create_if_block_7$1(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "kommunity");
    			add_location(i, file$2, 384, 48, 14290);
    			attr_dev(a, "href", a_href_value = "https://kommunity.com/@" + /*preview*/ ctx[0].social.kommunity);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 381, 54, 14113);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "https://kommunity.com/@" + /*preview*/ ctx[0].social.kommunity)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(382:24) {#if preview.social.kommunity}",
    		ctx
    	});

    	return block;
    }

    // (387:24) {#if preview.social.email}
    function create_if_block_6$1(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "email");
    			add_location(i, file$2, 388, 48, 14525);
    			attr_dev(a, "href", a_href_value = "mailto:" + /*preview*/ ctx[0].social.email);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 386, 50, 14402);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = "mailto:" + /*preview*/ ctx[0].social.email)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(387:24) {#if preview.social.email}",
    		ctx
    	});

    	return block;
    }

    // (391:24) {#if preview.social.website}
    function create_if_block_5$1(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "website");
    			add_location(i, file$2, 392, 48, 14748);
    			attr_dev(a, "href", a_href_value = /*preview*/ ctx[0].social.website);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 390, 52, 14635);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*preview*/ 1 && a_href_value !== (a_href_value = /*preview*/ ctx[0].social.website)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(391:24) {#if preview.social.website}",
    		ctx
    	});

    	return block;
    }

    // (407:12) {#if showInfo}
    function create_if_block_4$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*processMessage*/ ctx[6]);
    			attr_dev(div, "class", "processInfo");
    			add_location(div, file$2, 407, 12, 15377);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*processMessage*/ 64) set_data_dev(t, /*processMessage*/ ctx[6]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(407:12) {#if showInfo}",
    		ctx
    	});

    	return block;
    }

    // (412:12) {#if showError}
    function create_if_block_3$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*processMessage*/ ctx[6]);
    			attr_dev(div, "class", "error");
    			add_location(div, file$2, 412, 12, 15513);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*processMessage*/ 64) set_data_dev(t, /*processMessage*/ ctx[6]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(412:12) {#if showError}",
    		ctx
    	});

    	return block;
    }

    // (417:12) {#if preview.name == "" || preview.name==undefined}
    function create_if_block_2$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Lütfen isim alanını doldurunuz!";
    			attr_dev(div, "class", "error");
    			add_location(div, file$2, 417, 12, 15679);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(417:12) {#if preview.name == \\\"\\\" || preview.name==undefined}",
    		ctx
    	});

    	return block;
    }

    // (422:12) {#if preferAvatar=="twitter" && (preview.social.twitter == undefined || preview.social.twitter == "")}
    function create_if_block_1$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Lütfen Twitter kullanıcı adını giriniz!";
    			attr_dev(div, "class", "error");
    			add_location(div, file$2, 422, 12, 15911);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(422:12) {#if preferAvatar==\\\"twitter\\\" && (preview.social.twitter == undefined || preview.social.twitter == \\\"\\\")}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let link;
    	let t0;
    	let show_info;
    	let h3;
    	let t2;
    	let p0;
    	let t4;
    	let p1;
    	let t6;
    	let p2;
    	let b;
    	let t8;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isGopherLoaded*/ ctx[7]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			show_info = element("show-info");
    			h3 = element("h3");
    			h3.textContent = "Lütfen Okuyun!";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "→ Gopher kartı için profil fotoğrafı, Twitter profilinden\n        çekilir. Profil fotoğrafı için, Twitter kullanıcı adını eklemeyi\n        unutmayın...";
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "→ Buraya girmiş olunan bilgiler herkes tarafından\n        görülebilecektir.";
    			t6 = space();
    			p2 = element("p");
    			b = element("b");
    			b.textContent = "Gopher kartınının görüntülenmesi için yönetici onayı gereklidir.";
    			t8 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			this.c = noop;
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/public/global.css");
    			add_location(link, file$2, 132, 0, 3767);
    			add_location(h3, file$2, 134, 4, 3848);
    			add_location(p0, file$2, 135, 4, 3876);
    			add_location(p1, file$2, 140, 4, 4064);
    			add_location(b, file$2, 145, 8, 4188);
    			add_location(p2, file$2, 144, 4, 4176);
    			set_custom_element_data(show_info, "close", true);
    			add_location(show_info, file$2, 133, 0, 3819);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, show_info, anchor);
    			append_dev(show_info, h3);
    			append_dev(show_info, t2);
    			append_dev(show_info, p0);
    			append_dev(show_info, t4);
    			append_dev(show_info, p1);
    			append_dev(show_info, t6);
    			append_dev(show_info, p2);
    			append_dev(p2, b);
    			insert_dev(target, t8, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(show_info);
    			if (detaching) detach_dev(t8);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let isSubmitButtonDisabled;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('edit-request', slots, []);
    	let { gopherid } = $$props;
    	let gopherData = null;
    	let insertCompany = false;
    	let jobSelector;

    	onMount(() => {
    		$$invalidate(
    			3,
    			jobSelector.onchange = e => {
    				let jobValue = e.target.value;

    				if (jobValue == "company") {
    					$$invalidate(0, preview.company = "", preview);
    					$$invalidate(2, insertCompany = true);
    				} else if (jobValue == "freelancer") {
    					$$invalidate(0, preview.company = "freelancer", preview);
    					$$invalidate(2, insertCompany = false);
    				} else {
    					$$invalidate(0, preview.company = null, preview);
    					$$invalidate(2, insertCompany = false);
    				}
    			},
    			jobSelector
    		);
    	});

    	let preview = { social: {} };
    	let preferAvatar = "randomGopher";
    	let showInfo = false;
    	let showError = false;
    	let processMessage = "";
    	let isGopherLoaded = false;

    	//all gopher images
    	var gopherPictures = [
    		"/public/img/gophers/gopher1.png",
    		"/public/img/gophers/gopher2.png",
    		"/public/img/gophers/gopher3.png",
    		"/public/img/gophers/gopher4.png",
    		"/public/img/gophers/gopher5.png",
    		"/public/img/gophers/gopher6.png"
    	];

    	const genRandomGopherPP = () => {
    		return gopherPictures[Math.floor(Math.random() * gopherPictures.length)];
    	};

    	function fetchGopher() {
    		var req = new XMLHttpRequest();
    		req.open("GET", "/api/gopher/" + gopherid, true);

    		req.onload = () => {
    			if (req.status == 200) {
    				$$invalidate(0, preview = JSON.parse(req.responseText));
    				$$invalidate(7, isGopherLoaded = true);

    				if (!preview.job_status) {
    					$$invalidate(0, preview.job_status = "", preview);
    				}

    				if (preview.profile_img_url) {
    					$$invalidate(1, preferAvatar = "twitter");
    				} else {
    					$$invalidate(0, preview.profile_img_url = genRandomGopherPP(), preview);
    				}
    			}
    		};

    		req.send(null);
    	}

    	fetchGopher();

    	const sendGopherData = () => {
    		let req = new XMLHttpRequest();
    		req.open("POST", "/api/gopher/edit-request", true);
    		req.setRequestHeader('Content-Type', 'application/json');

    		req.onload = () => {
    			if (req.status == 200) {
    				let resp = JSON.parse(req.responseText);
    				$$invalidate(4, showInfo = true);
    				$$invalidate(5, showError = false);
    				$$invalidate(6, processMessage = resp.message);

    				setTimeout(
    					() => {
    						location.href = "/";
    					},
    					3000
    				);
    			} else if (req.status != 200) {
    				let resp = JSON.parse(req.responseText);
    				$$invalidate(4, showInfo = false);
    				$$invalidate(5, showError = true);
    				$$invalidate(6, processMessage = resp.message);
    			}
    		};

    		req.send(JSON.stringify({
    			"gopher": preview,
    			"avatar_method": preferAvatar
    		}));
    	};

    	const goHome = () => {
    		location.href = "/";
    	};

    	const deleteGopher = id => {
    		let req = new XMLHttpRequest();
    		req.open("GET", "/api/gopher/delete-request/" + id, true);

    		req.onload = () => {
    			if (req.status == 200) {
    				let resp = JSON.parse(req.responseText);
    				$$invalidate(4, showInfo = true);
    				$$invalidate(5, showError = false);
    				$$invalidate(6, processMessage = resp.message);

    				setTimeout(
    					() => {
    						location.href = "/";
    					},
    					3000
    				);
    			} else if (req.status != 200) {
    				let resp = JSON.parse(req.responseText);
    				$$invalidate(4, showInfo = false);
    				$$invalidate(5, showError = true);
    				$$invalidate(6, processMessage = resp.message);
    			}
    		};

    		req.send(null);
    	};

    	const writable_props = ['gopherid'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<edit-request> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input0_input_handler() {
    		preview.name = this.value;
    		$$invalidate(0, preview);
    	}

    	function select0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			jobSelector = $$value;
    			$$invalidate(3, jobSelector);
    		});
    	}

    	function input_input_handler() {
    		preview.company = this.value;
    		$$invalidate(0, preview);
    	}

    	function select1_change_handler() {
    		preview.job_status = select_value(this);
    		$$invalidate(0, preview);
    	}

    	function textarea_input_handler() {
    		preview.description = this.value;
    		$$invalidate(0, preview);
    	}

    	function input1_input_handler() {
    		preview.social.github = this.value;
    		$$invalidate(0, preview);
    	}

    	function input2_input_handler() {
    		preview.social.gitlab = this.value;
    		$$invalidate(0, preview);
    	}

    	function input3_input_handler() {
    		preview.social.twitter = this.value;
    		$$invalidate(0, preview);
    	}

    	function input4_input_handler() {
    		preview.social.facebook = this.value;
    		$$invalidate(0, preview);
    	}

    	function input5_input_handler() {
    		preview.social.youtube = this.value;
    		$$invalidate(0, preview);
    	}

    	function input6_input_handler() {
    		preview.social.instagram = this.value;
    		$$invalidate(0, preview);
    	}

    	function input7_input_handler() {
    		preview.social.telegram = this.value;
    		$$invalidate(0, preview);
    	}

    	function input8_input_handler() {
    		preview.social.linkedin = this.value;
    		$$invalidate(0, preview);
    	}

    	function input9_input_handler() {
    		preview.social.reddit = this.value;
    		$$invalidate(0, preview);
    	}

    	function input10_input_handler() {
    		preview.social.kommunity = this.value;
    		$$invalidate(0, preview);
    	}

    	function input11_input_handler() {
    		preview.social.email = this.value;
    		$$invalidate(0, preview);
    	}

    	function input12_input_handler() {
    		preview.social.website = this.value;
    		$$invalidate(0, preview);
    	}

    	function input13_change_handler() {
    		preferAvatar = this.__value;
    		$$invalidate(1, preferAvatar);
    	}

    	function input14_change_handler() {
    		preferAvatar = this.__value;
    		$$invalidate(1, preferAvatar);
    	}

    	$$self.$$set = $$props => {
    		if ('gopherid' in $$props) $$invalidate(12, gopherid = $$props.gopherid);
    	};

    	$$self.$capture_state = () => ({
    		gopherid,
    		onMount,
    		fade,
    		ShowInfo: Info,
    		gopherData,
    		insertCompany,
    		jobSelector,
    		preview,
    		preferAvatar,
    		showInfo,
    		showError,
    		processMessage,
    		isGopherLoaded,
    		gopherPictures,
    		genRandomGopherPP,
    		fetchGopher,
    		sendGopherData,
    		goHome,
    		deleteGopher,
    		isSubmitButtonDisabled
    	});

    	$$self.$inject_state = $$props => {
    		if ('gopherid' in $$props) $$invalidate(12, gopherid = $$props.gopherid);
    		if ('gopherData' in $$props) gopherData = $$props.gopherData;
    		if ('insertCompany' in $$props) $$invalidate(2, insertCompany = $$props.insertCompany);
    		if ('jobSelector' in $$props) $$invalidate(3, jobSelector = $$props.jobSelector);
    		if ('preview' in $$props) $$invalidate(0, preview = $$props.preview);
    		if ('preferAvatar' in $$props) $$invalidate(1, preferAvatar = $$props.preferAvatar);
    		if ('showInfo' in $$props) $$invalidate(4, showInfo = $$props.showInfo);
    		if ('showError' in $$props) $$invalidate(5, showError = $$props.showError);
    		if ('processMessage' in $$props) $$invalidate(6, processMessage = $$props.processMessage);
    		if ('isGopherLoaded' in $$props) $$invalidate(7, isGopherLoaded = $$props.isGopherLoaded);
    		if ('gopherPictures' in $$props) gopherPictures = $$props.gopherPictures;
    		if ('isSubmitButtonDisabled' in $$props) $$invalidate(8, isSubmitButtonDisabled = $$props.isSubmitButtonDisabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*preview, preferAvatar*/ 3) {
    			$$invalidate(8, isSubmitButtonDisabled = !preview.name || preferAvatar == "twitter" && !preview.social.twitter);
    		}
    	};

    	return [
    		preview,
    		preferAvatar,
    		insertCompany,
    		jobSelector,
    		showInfo,
    		showError,
    		processMessage,
    		isGopherLoaded,
    		isSubmitButtonDisabled,
    		sendGopherData,
    		goHome,
    		deleteGopher,
    		gopherid,
    		input0_input_handler,
    		select0_binding,
    		input_input_handler,
    		select1_change_handler,
    		textarea_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input7_input_handler,
    		input8_input_handler,
    		input9_input_handler,
    		input10_input_handler,
    		input11_input_handler,
    		input12_input_handler,
    		input13_change_handler,
    		$$binding_groups,
    		input14_change_handler
    	];
    }

    class EditRequest extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>@keyframes blink{0%{opacity:.3}50%{opacity:1}100%{opacity:.3}}.loader{width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:50px 0px;gap:30px}.loader img{width:100px}.loadingText{color:gray;animation-name:blink;animation-duration:.5s;animation-iteration-count:infinite}.processInfo{color:white;background-color:green;padding:10px;margin-top:20px;box-shadow:0px 3px 10px rgba(0, 0, 0, 0.3);border-radius:2px}.error{color:white;background-color:darkred;padding:10px;border-radius:2px;box-shadow:0px 3px 10px rgba(0, 0, 0, 0.3);margin-top:20px}.gopherEditor{display:flex;gap:20px;flex-wrap:wrap}.editor{position:relative;min-width:300px;flex:1;padding:20px;background-color:rgb(245, 245, 245);box-shadow:0px 3px 10px rgba(0, 0, 0, 0.3);color:rgb(73, 73, 73);border-radius:2px}.editor .title{font-size:25px;font-weight:bold;color:rgb(20, 20, 20)}.column{display:flex;justify-content:space-between;align-items:center;gap:10px}.column b{flex:1;display:flex;flex-direction:row;align-items:center}b>i{filter:invert(1);margin-right:10px}.descolumn{display:flex;flex-direction:column;gap:10px}.descolumn textarea{color:rgb(73, 73, 73);border-radius:2px;border:none;padding:10px;font-size:16px;width:100%;height:100px;resize:none;margin-bottom:30px;background-color:rgb(240, 240, 240);box-shadow:0px 3px 5px rgba(0, 0, 0, 0.3)}textarea:focus{outline-color:#411f89}textarea::placeholder{color:rgb(104, 102, 102)}.editor input[type="text"]{padding:10px 20px;font-size:16px;border-radius:2px;border:0px;background-color:rgb(240, 240, 240);color:rgb(73, 73, 73);width:200px;margin-bottom:10px;float:right;flex:1;box-shadow:0px 3px 5px rgba(0, 0, 0, 0.3)}input[type="text"]::placeholder{color:rgb(165, 165, 165)}.editor input[type="text"]:focus{outline-color:#411f89}.editor select{font-size:16px;padding:10px 20px;border-radius:2px;border:0px;background-color:rgb(240, 240, 240);color:rgb(73, 73, 73);width:200px;margin-bottom:10px;float:right;flex:1;box-shadow:0px 3px 5px rgba(0, 0, 0, 0.3)}.editor select:focus{outline-color:#411f89}.preview{position:relative;width:100%;max-width:400px;height:1000px}.previewSticky{position:sticky;top:90px}.preview .title{font-size:25px;font-weight:bold;color:rgb(26, 26, 26)}.actionButtons{width:100%;display:flex;margin-top:30px;gap:10px}.cancel{flex:1;background-color:transparent;color:rgb(124, 123, 123);font-size:16px;border:0;padding:10px 20px;cursor:pointer;opacity:0.8}.cancel:hover{opacity:1}.delete{flex:1;background-color:darkred;color:white;font-size:16px;padding:10px 20px;border:0px;cursor:pointer;border-radius:2px;box-shadow:0px 3px 5px rgba(0, 0, 0, 0.3);transition:background-color 0.5s}.delete:hover{background-color:rgb(173, 9, 9)}.confirm{flex:1;background-color:#53309e;color:white;font-size:16px;padding:10px 20px;border:0px;cursor:pointer;border-radius:2px;box-shadow:0px 3px 5px rgba(0, 0, 0, 0.3);transition:background-color 0.5s}.confirm:disabled{cursor:not-allowed;opacity:.5}.confirm:hover{background-color:#411f89}i{background-size:24px;background-repeat:no-repeat;width:24px;height:24px;display:inline-block;opacity:0.7;transition:opacity 0.3s}i:hover{opacity:1}.github{background:url("/public/img/icons/github.png")}.gitlab{background:url("/public/img/icons/gitlab.png")}.twitter{background:url("/public/img/icons/twitter.png")}.facebook{background:url("/public/img/icons/facebook.png")}.youtube{background:url("/public/img/icons/youtube.png")}.telegram{background:url("/public/img/icons/telegram.png")}.linkedin{background:url("/public/img/icons/linkedin.png")}.reddit{background:url("/public/img/icons/reddit.png")}.instagram{background:url("/public/img/icons/instagram.png")}.email{background:url("/public/img/icons/email.png")}.website{background:url("/public/img/icons/website.png")}.kommunity{background:url("/public/img/icons/kommunity.png")}</style>`;

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$2,
    			create_fragment$2,
    			safe_not_equal,
    			{ gopherid: 12 },
    			null,
    			[-1, -1]
    		);

    		const { ctx } = this.$$;
    		const props = this.attributes;

    		if (/*gopherid*/ ctx[12] === undefined && !('gopherid' in props)) {
    			console.warn("<edit-request> was created without expected prop 'gopherid'");
    		}

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["gopherid"];
    	}

    	get gopherid() {
    		return this.$$.ctx[12];
    	}

    	set gopherid(gopherid) {
    		this.$$set({ gopherid });
    		flush();
    	}
    }

    customElements.define("edit-request", EditRequest);

    /* src/LoginArea.svelte generated by Svelte v3.44.2 */
    const file$1 = "src/LoginArea.svelte";

    // (51:28) 
    function create_if_block_1$1(ctx) {
    	let div;
    	let t;
    	let div_intro;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*warning*/ ctx[2]);
    			attr_dev(div, "class", "error");
    			add_location(div, file$1, 51, 8, 1433);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*warning*/ 4) set_data_dev(t, /*warning*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, fade, {});
    					div_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(51:28) ",
    		ctx
    	});

    	return block;
    }

    // (47:8) {#if warning && showSuccess}
    function create_if_block$1(ctx) {
    	let div;
    	let t;
    	let div_intro;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*warning*/ ctx[2]);
    			attr_dev(div, "class", "success");
    			add_location(div, file$1, 47, 8, 1329);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*warning*/ 4) set_data_dev(t, /*warning*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, fade, {});
    					div_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(47:8) {#if warning && showSuccess}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let input0;
    	let t1;
    	let input1;
    	let t2;
    	let button;
    	let t3;
    	let t4;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*warning*/ ctx[2] && /*showSuccess*/ ctx[3]) return create_if_block$1;
    		if (/*showError*/ ctx[4]) return create_if_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			input0 = element("input");
    			t1 = space();
    			input1 = element("input");
    			t2 = space();
    			button = element("button");
    			t3 = text("Giriş Yap");
    			t4 = space();
    			if (if_block) if_block.c();
    			this.c = noop;
    			if (!src_url_equal(img.src, img_src_value = "/public/img/sitelogo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			add_location(img, file$1, 42, 8, 998);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Kullanıcı Adı");
    			add_location(input0, file$1, 43, 8, 1054);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Şifre");
    			add_location(input1, file$1, 44, 8, 1131);
    			button.disabled = /*isButtonDisable*/ ctx[5];
    			add_location(button, file$1, 45, 8, 1206);
    			attr_dev(div0, "class", "loginArea");
    			add_location(div0, file$1, 41, 4, 966);
    			attr_dev(div1, "class", "page");
    			add_location(div1, file$1, 40, 0, 943);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*userid*/ ctx[0]);
    			append_dev(div0, t1);
    			append_dev(div0, input1);
    			set_input_value(input1, /*userpass*/ ctx[1]);
    			append_dev(div0, t2);
    			append_dev(div0, button);
    			append_dev(button, t3);
    			append_dev(div0, t4);
    			if (if_block) if_block.m(div0, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[8]),
    					listen_dev(button, "click", /*sendUserData*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*userid*/ 1 && input0.value !== /*userid*/ ctx[0]) {
    				set_input_value(input0, /*userid*/ ctx[0]);
    			}

    			if (dirty & /*userpass*/ 2 && input1.value !== /*userpass*/ ctx[1]) {
    				set_input_value(input1, /*userpass*/ ctx[1]);
    			}

    			if (dirty & /*isButtonDisable*/ 32) {
    				prop_dev(button, "disabled", /*isButtonDisable*/ ctx[5]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			transition_in(if_block);
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);

    			if (if_block) {
    				if_block.d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let isButtonDisable;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('login-area', slots, []);
    	let userid;
    	let userpass;
    	let warning;
    	let showSuccess = false;
    	let showError = false;

    	const sendUserData = () => {
    		$$invalidate(3, showSuccess = false);
    		$$invalidate(4, showError = false);
    		let req = new XMLHttpRequest();
    		req.open("POST", "/login", true);
    		req.setRequestHeader('Content-Type', 'application/json');

    		req.onload = () => {
    			if (req.status == 200) {
    				let data = JSON.parse(req.responseText);
    				$$invalidate(2, warning = data.message);
    				$$invalidate(3, showSuccess = true);

    				setTimeout(
    					() => {
    						location.href = "/";
    					},
    					2000
    				);
    			} else {
    				let data = JSON.parse(req.responseText);
    				$$invalidate(2, warning = data.message);
    				$$invalidate(4, showError = true);
    			}
    		};

    		req.send(JSON.stringify({ "id": userid, "pass": userpass }));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<login-area> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		userid = this.value;
    		$$invalidate(0, userid);
    	}

    	function input1_input_handler() {
    		userpass = this.value;
    		$$invalidate(1, userpass);
    	}

    	$$self.$capture_state = () => ({
    		fade,
    		userid,
    		userpass,
    		warning,
    		showSuccess,
    		showError,
    		sendUserData,
    		isButtonDisable
    	});

    	$$self.$inject_state = $$props => {
    		if ('userid' in $$props) $$invalidate(0, userid = $$props.userid);
    		if ('userpass' in $$props) $$invalidate(1, userpass = $$props.userpass);
    		if ('warning' in $$props) $$invalidate(2, warning = $$props.warning);
    		if ('showSuccess' in $$props) $$invalidate(3, showSuccess = $$props.showSuccess);
    		if ('showError' in $$props) $$invalidate(4, showError = $$props.showError);
    		if ('isButtonDisable' in $$props) $$invalidate(5, isButtonDisable = $$props.isButtonDisable);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*userid, userpass*/ 3) {
    			$$invalidate(5, isButtonDisable = userid && userpass ? false : true);
    		}
    	};

    	return [
    		userid,
    		userpass,
    		warning,
    		showSuccess,
    		showError,
    		isButtonDisable,
    		sendUserData,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class LoginArea extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>.page{background:url("/public/img/loginbg.png");width:100vw;height:100vh;display:flex;justify-content:center;align-items:center}.loginArea{box-sizing:border-box;border-radius:2px;box-shadow:0px 3px 10px rgba(0, 0, 0, 0.3);width:100%;max-width:300px;height:100%;max-height:400px;background-color:#271647;color:white;display:flex;flex-direction:column;padding:20px;justify-content:center;align-items:center;gap:20px}.loginArea img{height:50px;width:43px}.loginArea input{padding:10px 20px;font-size:18px;border-radius:2px;border:0px}.loginArea button{padding:10px 20px;background-color:#411F89;color:white;border-radius:2px;border:0px;transition:background-color .5s;cursor:pointer}.loginArea button:disabled{opacity:.5;cursor:not-allowed}.loginArea button:hover{background-color:#542aad}.success{background-color:green;color:white;padding:10px;border-radius:2px}.error{background-color:darkred;color:white;padding:10px;border-radius:2px}</style>`;

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$1,
    			create_fragment$1,
    			safe_not_equal,
    			{},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("login-area", LoginArea);

    /* src/DashboardZone.svelte generated by Svelte v3.44.2 */
    const file = "src/DashboardZone.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (71:4) {:else}
    function create_else_block(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*requests*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

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
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*new_data, old_data, requests, rejectReq, acceptReq, showDiff*/ 63) {
    				each_value = /*requests*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(71:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (69:35) 
    function create_if_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("no request here");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(69:35) ",
    		ctx
    	});

    	return block;
    }

    // (67:4) {#if requests==undefined}
    function create_if_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(67:4) {#if requests==undefined}",
    		ctx
    	});

    	return block;
    }

    // (77:8) {#if request.req_type == "edit"}
    function create_if_block_20(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[6](/*request*/ ctx[12], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Show Diff";
    			attr_dev(div, "class", "diff");
    			add_location(div, file, 77, 8, 1960);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20.name,
    		type: "if",
    		source: "(77:8) {#if request.req_type == \\\"edit\\\"}",
    		ctx
    	});

    	return block;
    }

    // (87:4) {#if request.req_type == "edit"}
    function create_if_block_2(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let table;
    	let thead;
    	let td0;
    	let t3;
    	let td1;
    	let t5;
    	let td2;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let t12;
    	let t13;
    	let t14;
    	let t15;
    	let t16;
    	let t17;
    	let t18;
    	let t19;
    	let t20;
    	let t21;
    	let t22;
    	let t23;
    	let t24;
    	let if_block0 = /*old_data*/ ctx[2].name != /*new_data*/ ctx[1].name && create_if_block_19(ctx);
    	let if_block1 = /*old_data*/ ctx[2].company != /*new_data*/ ctx[1].company && create_if_block_18(ctx);
    	let if_block2 = /*old_data*/ ctx[2].description != /*new_data*/ ctx[1].description && create_if_block_17(ctx);
    	let if_block3 = /*old_data*/ ctx[2].profile_img_url != /*new_data*/ ctx[1].profile_img_url && create_if_block_16(ctx);
    	let if_block4 = /*old_data*/ ctx[2].job_status != /*new_data*/ ctx[1].job_status && create_if_block_15(ctx);
    	let if_block5 = /*old_data*/ ctx[2].social.github != /*new_data*/ ctx[1].social.github && create_if_block_14(ctx);
    	let if_block6 = /*old_data*/ ctx[2].social.gitlab != /*new_data*/ ctx[1].social.gitlab && create_if_block_13(ctx);
    	let if_block7 = /*old_data*/ ctx[2].social.twitter != /*new_data*/ ctx[1].social.twitter && create_if_block_12(ctx);
    	let if_block8 = /*old_data*/ ctx[2].social.facebook != /*new_data*/ ctx[1].social.facebook && create_if_block_11(ctx);
    	let if_block9 = /*old_data*/ ctx[2].social.youtube != /*new_data*/ ctx[1].social.youtube && create_if_block_10(ctx);
    	let if_block10 = /*old_data*/ ctx[2].social.telegram != /*new_data*/ ctx[1].social.telegram && create_if_block_9(ctx);
    	let if_block11 = /*old_data*/ ctx[2].social.instagram != /*new_data*/ ctx[1].social.instagram && create_if_block_8(ctx);
    	let if_block12 = /*old_data*/ ctx[2].social.linkedin != /*new_data*/ ctx[1].social.linkedin && create_if_block_7(ctx);
    	let if_block13 = /*old_data*/ ctx[2].social.reddit != /*new_data*/ ctx[1].social.reddit && create_if_block_6(ctx);
    	let if_block14 = /*old_data*/ ctx[2].social.email != /*new_data*/ ctx[1].social.email && create_if_block_5(ctx);
    	let if_block15 = /*old_data*/ ctx[2].social.kommunity != /*new_data*/ ctx[1].social.kommunity && create_if_block_4(ctx);
    	let if_block16 = /*old_data*/ ctx[2].social.website != /*new_data*/ ctx[1].social.website && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Diffrences";
    			t1 = space();
    			div1 = element("div");
    			table = element("table");
    			thead = element("thead");
    			td0 = element("td");
    			td0.textContent = "Field";
    			t3 = space();
    			td1 = element("td");
    			td1.textContent = "Old Value";
    			t5 = space();
    			td2 = element("td");
    			td2.textContent = "New Value";
    			t7 = space();
    			if (if_block0) if_block0.c();
    			t8 = space();
    			if (if_block1) if_block1.c();
    			t9 = space();
    			if (if_block2) if_block2.c();
    			t10 = space();
    			if (if_block3) if_block3.c();
    			t11 = space();
    			if (if_block4) if_block4.c();
    			t12 = space();
    			if (if_block5) if_block5.c();
    			t13 = space();
    			if (if_block6) if_block6.c();
    			t14 = space();
    			if (if_block7) if_block7.c();
    			t15 = space();
    			if (if_block8) if_block8.c();
    			t16 = space();
    			if (if_block9) if_block9.c();
    			t17 = space();
    			if (if_block10) if_block10.c();
    			t18 = space();
    			if (if_block11) if_block11.c();
    			t19 = space();
    			if (if_block12) if_block12.c();
    			t20 = space();
    			if (if_block13) if_block13.c();
    			t21 = space();
    			if (if_block14) if_block14.c();
    			t22 = space();
    			if (if_block15) if_block15.c();
    			t23 = space();
    			if (if_block16) if_block16.c();
    			t24 = space();
    			attr_dev(div0, "class", "diffTitle");
    			add_location(div0, file, 88, 8, 2369);
    			add_location(td0, file, 94, 20, 2527);
    			add_location(td1, file, 95, 20, 2562);
    			add_location(td2, file, 96, 20, 2601);
    			add_location(thead, file, 93, 16, 2499);
    			add_location(table, file, 92, 12, 2475);
    			attr_dev(div1, "class", "diffTable");
    			add_location(div1, file, 91, 8, 2439);
    			attr_dev(div2, "class", "diffBox");
    			add_location(div2, file, 87, 4, 2339);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, table);
    			append_dev(table, thead);
    			append_dev(thead, td0);
    			append_dev(thead, t3);
    			append_dev(thead, td1);
    			append_dev(thead, t5);
    			append_dev(thead, td2);
    			append_dev(table, t7);
    			if (if_block0) if_block0.m(table, null);
    			append_dev(table, t8);
    			if (if_block1) if_block1.m(table, null);
    			append_dev(table, t9);
    			if (if_block2) if_block2.m(table, null);
    			append_dev(table, t10);
    			if (if_block3) if_block3.m(table, null);
    			append_dev(table, t11);
    			if (if_block4) if_block4.m(table, null);
    			append_dev(table, t12);
    			if (if_block5) if_block5.m(table, null);
    			append_dev(table, t13);
    			if (if_block6) if_block6.m(table, null);
    			append_dev(table, t14);
    			if (if_block7) if_block7.m(table, null);
    			append_dev(table, t15);
    			if (if_block8) if_block8.m(table, null);
    			append_dev(table, t16);
    			if (if_block9) if_block9.m(table, null);
    			append_dev(table, t17);
    			if (if_block10) if_block10.m(table, null);
    			append_dev(table, t18);
    			if (if_block11) if_block11.m(table, null);
    			append_dev(table, t19);
    			if (if_block12) if_block12.m(table, null);
    			append_dev(table, t20);
    			if (if_block13) if_block13.m(table, null);
    			append_dev(table, t21);
    			if (if_block14) if_block14.m(table, null);
    			append_dev(table, t22);
    			if (if_block15) if_block15.m(table, null);
    			append_dev(table, t23);
    			if (if_block16) if_block16.m(table, null);
    			append_dev(div2, t24);
    		},
    		p: function update(ctx, dirty) {
    			if (/*old_data*/ ctx[2].name != /*new_data*/ ctx[1].name) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_19(ctx);
    					if_block0.c();
    					if_block0.m(table, t8);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*old_data*/ ctx[2].company != /*new_data*/ ctx[1].company) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_18(ctx);
    					if_block1.c();
    					if_block1.m(table, t9);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*old_data*/ ctx[2].description != /*new_data*/ ctx[1].description) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_17(ctx);
    					if_block2.c();
    					if_block2.m(table, t10);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*old_data*/ ctx[2].profile_img_url != /*new_data*/ ctx[1].profile_img_url) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_16(ctx);
    					if_block3.c();
    					if_block3.m(table, t11);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*old_data*/ ctx[2].job_status != /*new_data*/ ctx[1].job_status) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_15(ctx);
    					if_block4.c();
    					if_block4.m(table, t12);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*old_data*/ ctx[2].social.github != /*new_data*/ ctx[1].social.github) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_14(ctx);
    					if_block5.c();
    					if_block5.m(table, t13);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*old_data*/ ctx[2].social.gitlab != /*new_data*/ ctx[1].social.gitlab) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_13(ctx);
    					if_block6.c();
    					if_block6.m(table, t14);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*old_data*/ ctx[2].social.twitter != /*new_data*/ ctx[1].social.twitter) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_12(ctx);
    					if_block7.c();
    					if_block7.m(table, t15);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (/*old_data*/ ctx[2].social.facebook != /*new_data*/ ctx[1].social.facebook) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);
    				} else {
    					if_block8 = create_if_block_11(ctx);
    					if_block8.c();
    					if_block8.m(table, t16);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (/*old_data*/ ctx[2].social.youtube != /*new_data*/ ctx[1].social.youtube) {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);
    				} else {
    					if_block9 = create_if_block_10(ctx);
    					if_block9.c();
    					if_block9.m(table, t17);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}

    			if (/*old_data*/ ctx[2].social.telegram != /*new_data*/ ctx[1].social.telegram) {
    				if (if_block10) {
    					if_block10.p(ctx, dirty);
    				} else {
    					if_block10 = create_if_block_9(ctx);
    					if_block10.c();
    					if_block10.m(table, t18);
    				}
    			} else if (if_block10) {
    				if_block10.d(1);
    				if_block10 = null;
    			}

    			if (/*old_data*/ ctx[2].social.instagram != /*new_data*/ ctx[1].social.instagram) {
    				if (if_block11) {
    					if_block11.p(ctx, dirty);
    				} else {
    					if_block11 = create_if_block_8(ctx);
    					if_block11.c();
    					if_block11.m(table, t19);
    				}
    			} else if (if_block11) {
    				if_block11.d(1);
    				if_block11 = null;
    			}

    			if (/*old_data*/ ctx[2].social.linkedin != /*new_data*/ ctx[1].social.linkedin) {
    				if (if_block12) {
    					if_block12.p(ctx, dirty);
    				} else {
    					if_block12 = create_if_block_7(ctx);
    					if_block12.c();
    					if_block12.m(table, t20);
    				}
    			} else if (if_block12) {
    				if_block12.d(1);
    				if_block12 = null;
    			}

    			if (/*old_data*/ ctx[2].social.reddit != /*new_data*/ ctx[1].social.reddit) {
    				if (if_block13) {
    					if_block13.p(ctx, dirty);
    				} else {
    					if_block13 = create_if_block_6(ctx);
    					if_block13.c();
    					if_block13.m(table, t21);
    				}
    			} else if (if_block13) {
    				if_block13.d(1);
    				if_block13 = null;
    			}

    			if (/*old_data*/ ctx[2].social.email != /*new_data*/ ctx[1].social.email) {
    				if (if_block14) {
    					if_block14.p(ctx, dirty);
    				} else {
    					if_block14 = create_if_block_5(ctx);
    					if_block14.c();
    					if_block14.m(table, t22);
    				}
    			} else if (if_block14) {
    				if_block14.d(1);
    				if_block14 = null;
    			}

    			if (/*old_data*/ ctx[2].social.kommunity != /*new_data*/ ctx[1].social.kommunity) {
    				if (if_block15) {
    					if_block15.p(ctx, dirty);
    				} else {
    					if_block15 = create_if_block_4(ctx);
    					if_block15.c();
    					if_block15.m(table, t23);
    				}
    			} else if (if_block15) {
    				if_block15.d(1);
    				if_block15 = null;
    			}

    			if (/*old_data*/ ctx[2].social.website != /*new_data*/ ctx[1].social.website) {
    				if (if_block16) {
    					if_block16.p(ctx, dirty);
    				} else {
    					if_block16 = create_if_block_3(ctx);
    					if_block16.c();
    					if_block16.m(table, null);
    				}
    			} else if (if_block16) {
    				if_block16.d(1);
    				if_block16 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			if (if_block8) if_block8.d();
    			if (if_block9) if_block9.d();
    			if (if_block10) if_block10.d();
    			if (if_block11) if_block11.d();
    			if (if_block12) if_block12.d();
    			if (if_block13) if_block13.d();
    			if (if_block14) if_block14.d();
    			if (if_block15) if_block15.d();
    			if (if_block16) if_block16.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(87:4) {#if request.req_type == \\\"edit\\\"}",
    		ctx
    	});

    	return block;
    }

    // (99:16) {#if old_data.name != new_data.name}
    function create_if_block_19(ctx) {
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*old_data*/ ctx[2].name + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*new_data*/ ctx[1].name + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "Name";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file, 100, 24, 2747);
    			add_location(td1, file, 101, 24, 2785);
    			add_location(td2, file, 102, 24, 2834);
    			add_location(tr, file, 99, 20, 2718);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*old_data*/ 4 && t2_value !== (t2_value = /*old_data*/ ctx[2].name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*new_data*/ 2 && t4_value !== (t4_value = /*new_data*/ ctx[1].name + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(99:16) {#if old_data.name != new_data.name}",
    		ctx
    	});

    	return block;
    }

    // (106:16) {#if old_data.company != new_data.company}
    function create_if_block_18(ctx) {
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*old_data*/ ctx[2].company + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*new_data*/ ctx[1].company + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "Company";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file, 107, 24, 3015);
    			add_location(td1, file, 108, 24, 3056);
    			add_location(td2, file, 109, 24, 3108);
    			add_location(tr, file, 106, 20, 2986);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*old_data*/ 4 && t2_value !== (t2_value = /*old_data*/ ctx[2].company + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*new_data*/ 2 && t4_value !== (t4_value = /*new_data*/ ctx[1].company + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(106:16) {#if old_data.company != new_data.company}",
    		ctx
    	});

    	return block;
    }

    // (113:16) {#if old_data.description != new_data.description}
    function create_if_block_17(ctx) {
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*old_data*/ ctx[2].description + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*new_data*/ ctx[1].description + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "Description";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file, 114, 24, 3300);
    			add_location(td1, file, 115, 24, 3345);
    			add_location(td2, file, 116, 24, 3401);
    			add_location(tr, file, 113, 20, 3271);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*old_data*/ 4 && t2_value !== (t2_value = /*old_data*/ ctx[2].description + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*new_data*/ 2 && t4_value !== (t4_value = /*new_data*/ ctx[1].description + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(113:16) {#if old_data.description != new_data.description}",
    		ctx
    	});

    	return block;
    }

    // (120:16) {#if old_data.profile_img_url != new_data.profile_img_url}
    function create_if_block_16(ctx) {
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*old_data*/ ctx[2].profile_img_url + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*new_data*/ ctx[1].profile_img_url + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "PPImg URL";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file, 121, 24, 3605);
    			add_location(td1, file, 122, 24, 3648);
    			add_location(td2, file, 123, 24, 3708);
    			add_location(tr, file, 120, 20, 3576);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*old_data*/ 4 && t2_value !== (t2_value = /*old_data*/ ctx[2].profile_img_url + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*new_data*/ 2 && t4_value !== (t4_value = /*new_data*/ ctx[1].profile_img_url + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(120:16) {#if old_data.profile_img_url != new_data.profile_img_url}",
    		ctx
    	});

    	return block;
    }

    // (127:16) {#if old_data.job_status != new_data.job_status}
    function create_if_block_15(ctx) {
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*old_data*/ ctx[2].job_status + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*new_data*/ ctx[1].job_status + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "Job Status";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file, 128, 24, 3906);
    			add_location(td1, file, 129, 24, 3950);
    			add_location(td2, file, 130, 24, 4005);
    			add_location(tr, file, 127, 20, 3877);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*old_data*/ 4 && t2_value !== (t2_value = /*old_data*/ ctx[2].job_status + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*new_data*/ 2 && t4_value !== (t4_value = /*new_data*/ ctx[1].job_status + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(127:16) {#if old_data.job_status != new_data.job_status}",
    		ctx
    	});

    	return block;
    }

    // (134:16) {#if old_data.social.github != new_data.social.github}
    function create_if_block_14(ctx) {
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*old_data*/ ctx[2].social.github + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*new_data*/ ctx[1].social.github + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "GitHub";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file, 135, 24, 4204);
    			add_location(td1, file, 136, 24, 4244);
    			add_location(td2, file, 137, 24, 4302);
    			add_location(tr, file, 134, 20, 4175);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*old_data*/ 4 && t2_value !== (t2_value = /*old_data*/ ctx[2].social.github + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*new_data*/ 2 && t4_value !== (t4_value = /*new_data*/ ctx[1].social.github + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(134:16) {#if old_data.social.github != new_data.social.github}",
    		ctx
    	});

    	return block;
    }

    // (141:16) {#if old_data.social.gitlab != new_data.social.gitlab}
    function create_if_block_13(ctx) {
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*old_data*/ ctx[2].social.gitlab + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*new_data*/ ctx[1].social.gitlab + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "GitLab";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file, 142, 24, 4504);
    			add_location(td1, file, 143, 24, 4544);
    			add_location(td2, file, 144, 24, 4602);
    			add_location(tr, file, 141, 20, 4475);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*old_data*/ 4 && t2_value !== (t2_value = /*old_data*/ ctx[2].social.gitlab + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*new_data*/ 2 && t4_value !== (t4_value = /*new_data*/ ctx[1].social.gitlab + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(141:16) {#if old_data.social.gitlab != new_data.social.gitlab}",
    		ctx
    	});

    	return block;
    }

    // (148:16) {#if old_data.social.twitter != new_data.social.twitter}
    function create_if_block_12(ctx) {
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*old_data*/ ctx[2].social.twitter + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*new_data*/ ctx[1].social.twitter + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "Twitter";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file, 149, 24, 4806);
    			add_location(td1, file, 150, 24, 4847);
    			add_location(td2, file, 151, 24, 4906);
    			add_location(tr, file, 148, 20, 4777);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*old_data*/ 4 && t2_value !== (t2_value = /*old_data*/ ctx[2].social.twitter + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*new_data*/ 2 && t4_value !== (t4_value = /*new_data*/ ctx[1].social.twitter + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(148:16) {#if old_data.social.twitter != new_data.social.twitter}",
    		ctx
    	});

    	return block;
    }

    // (155:16) {#if old_data.social.facebook != new_data.social.facebook}
    function create_if_block_11(ctx) {
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*old_data*/ ctx[2].social.facebook + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*new_data*/ ctx[1].social.facebook + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "Facebook";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file, 156, 24, 5113);
    			add_location(td1, file, 157, 24, 5155);
    			add_location(td2, file, 158, 24, 5215);
    			add_location(tr, file, 155, 20, 5084);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*old_data*/ 4 && t2_value !== (t2_value = /*old_data*/ ctx[2].social.facebook + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*new_data*/ 2 && t4_value !== (t4_value = /*new_data*/ ctx[1].social.facebook + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(155:16) {#if old_data.social.facebook != new_data.social.facebook}",
    		ctx
    	});

    	return block;
    }

    // (162:16) {#if old_data.social.youtube != new_data.social.youtube}
    function create_if_block_10(ctx) {
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*old_data*/ ctx[2].social.youtube + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*new_data*/ ctx[1].social.youtube + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "YouTube";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file, 163, 24, 5421);
    			add_location(td1, file, 164, 24, 5462);
    			add_location(td2, file, 165, 24, 5521);
    			add_location(tr, file, 162, 20, 5392);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*old_data*/ 4 && t2_value !== (t2_value = /*old_data*/ ctx[2].social.youtube + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*new_data*/ 2 && t4_value !== (t4_value = /*new_data*/ ctx[1].social.youtube + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(162:16) {#if old_data.social.youtube != new_data.social.youtube}",
    		ctx
    	});

    	return block;
    }

    // (169:16) {#if old_data.social.telegram != new_data.social.telegram}
    function create_if_block_9(ctx) {
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*old_data*/ ctx[2].social.telegram + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*new_data*/ ctx[1].social.telegram + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "Telegram";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file, 170, 24, 5728);
    			add_location(td1, file, 171, 24, 5770);
    			add_location(td2, file, 172, 24, 5830);
    			add_location(tr, file, 169, 20, 5699);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*old_data*/ 4 && t2_value !== (t2_value = /*old_data*/ ctx[2].social.telegram + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*new_data*/ 2 && t4_value !== (t4_value = /*new_data*/ ctx[1].social.telegram + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(169:16) {#if old_data.social.telegram != new_data.social.telegram}",
    		ctx
    	});

    	return block;
    }

    // (176:16) {#if old_data.social.instagram != new_data.social.instagram}
    function create_if_block_8(ctx) {
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*old_data*/ ctx[2].social.instagram + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*new_data*/ ctx[1].social.instagram + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "Instagram";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file, 177, 24, 6040);
    			add_location(td1, file, 178, 24, 6083);
    			add_location(td2, file, 179, 24, 6144);
    			add_location(tr, file, 176, 20, 6011);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*old_data*/ 4 && t2_value !== (t2_value = /*old_data*/ ctx[2].social.instagram + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*new_data*/ 2 && t4_value !== (t4_value = /*new_data*/ ctx[1].social.instagram + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(176:16) {#if old_data.social.instagram != new_data.social.instagram}",
    		ctx
    	});

    	return block;
    }

    // (183:16) {#if old_data.social.linkedin != new_data.social.linkedin}
    function create_if_block_7(ctx) {
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*old_data*/ ctx[2].social.linkedin + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*new_data*/ ctx[1].social.linkedin + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "LinkedIn";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file, 184, 24, 6353);
    			add_location(td1, file, 185, 24, 6395);
    			add_location(td2, file, 186, 24, 6455);
    			add_location(tr, file, 183, 20, 6324);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*old_data*/ 4 && t2_value !== (t2_value = /*old_data*/ ctx[2].social.linkedin + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*new_data*/ 2 && t4_value !== (t4_value = /*new_data*/ ctx[1].social.linkedin + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(183:16) {#if old_data.social.linkedin != new_data.social.linkedin}",
    		ctx
    	});

    	return block;
    }

    // (190:16) {#if old_data.social.reddit != new_data.social.reddit}
    function create_if_block_6(ctx) {
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*old_data*/ ctx[2].social.reddit + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*new_data*/ ctx[1].social.reddit + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "Reddit";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file, 191, 24, 6659);
    			add_location(td1, file, 192, 24, 6699);
    			add_location(td2, file, 193, 24, 6757);
    			add_location(tr, file, 190, 20, 6630);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*old_data*/ 4 && t2_value !== (t2_value = /*old_data*/ ctx[2].social.reddit + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*new_data*/ 2 && t4_value !== (t4_value = /*new_data*/ ctx[1].social.reddit + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(190:16) {#if old_data.social.reddit != new_data.social.reddit}",
    		ctx
    	});

    	return block;
    }

    // (197:16) {#if old_data.social.email != new_data.social.email}
    function create_if_block_5(ctx) {
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*old_data*/ ctx[2].social.email + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*new_data*/ ctx[1].social.email + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "E-mail";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file, 198, 24, 6957);
    			add_location(td1, file, 199, 24, 6997);
    			add_location(td2, file, 200, 24, 7054);
    			add_location(tr, file, 197, 20, 6928);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*old_data*/ 4 && t2_value !== (t2_value = /*old_data*/ ctx[2].social.email + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*new_data*/ 2 && t4_value !== (t4_value = /*new_data*/ ctx[1].social.email + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(197:16) {#if old_data.social.email != new_data.social.email}",
    		ctx
    	});

    	return block;
    }

    // (204:16) {#if old_data.social.kommunity != new_data.social.kommunity}
    function create_if_block_4(ctx) {
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*old_data*/ ctx[2].social.kommunity + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*new_data*/ ctx[1].social.kommunity + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "Kommunity";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file, 205, 24, 7261);
    			add_location(td1, file, 206, 24, 7304);
    			add_location(td2, file, 207, 24, 7365);
    			add_location(tr, file, 204, 20, 7232);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*old_data*/ 4 && t2_value !== (t2_value = /*old_data*/ ctx[2].social.kommunity + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*new_data*/ 2 && t4_value !== (t4_value = /*new_data*/ ctx[1].social.kommunity + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(204:16) {#if old_data.social.kommunity != new_data.social.kommunity}",
    		ctx
    	});

    	return block;
    }

    // (211:16) {#if old_data.social.website != new_data.social.website}
    function create_if_block_3(ctx) {
    	let tr;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*old_data*/ ctx[2].social.website + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*new_data*/ ctx[1].social.website + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "Website";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file, 212, 24, 7572);
    			add_location(td1, file, 213, 24, 7613);
    			add_location(td2, file, 214, 24, 7672);
    			add_location(tr, file, 211, 20, 7543);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*old_data*/ 4 && t2_value !== (t2_value = /*old_data*/ ctx[2].social.website + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*new_data*/ 2 && t4_value !== (t4_value = /*new_data*/ ctx[1].social.website + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(211:16) {#if old_data.social.website != new_data.social.website}",
    		ctx
    	});

    	return block;
    }

    // (72:4) {#each requests as request, i}
    function create_each_block(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*request*/ ctx[12].old_data.name + "";
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let button0;
    	let t4;
    	let button1;
    	let div2_class_value;
    	let div2_transition;
    	let t6;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*request*/ ctx[12].req_type == "edit" && create_if_block_20(ctx);

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[7](/*request*/ ctx[12], /*i*/ ctx[14]);
    	}

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[8](/*request*/ ctx[12], /*i*/ ctx[14]);
    	}

    	let if_block1 = /*request*/ ctx[12].req_type == "edit" && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "Accept";
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "Reject";
    			t6 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(div0, "class", "head");
    			add_location(div0, file, 73, 8, 1841);
    			attr_dev(button0, "class", "accept");
    			add_location(button0, file, 82, 12, 2106);
    			attr_dev(button1, "class", "reject");
    			add_location(button1, file, 83, 12, 2195);
    			attr_dev(div1, "class", "tail");
    			add_location(div1, file, 81, 8, 2075);
    			attr_dev(div2, "class", div2_class_value = "request " + /*request*/ ctx[12].req_type);
    			add_location(div2, file, 72, 4, 1776);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t4);
    			append_dev(div1, button1);
    			insert_dev(target, t6, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler_1, false, false, false),
    					listen_dev(button1, "click", click_handler_2, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*requests*/ 1) && t0_value !== (t0_value = /*request*/ ctx[12].old_data.name + "")) set_data_dev(t0, t0_value);

    			if (/*request*/ ctx[12].req_type == "edit") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_20(ctx);
    					if_block0.c();
    					if_block0.m(div2, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!current || dirty & /*requests*/ 1 && div2_class_value !== (div2_class_value = "request " + /*request*/ ctx[12].req_type)) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (/*request*/ ctx[12].req_type == "edit") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (detaching && div2_transition) div2_transition.end();
    			if (detaching) detach_dev(t6);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(72:4) {#each requests as request, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div1;
    	let div0;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*requests*/ ctx[0] == undefined) return 0;
    		if (/*requests*/ ctx[0].length == 0) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Requests";
    			t1 = space();
    			if_block.c();
    			this.c = noop;
    			attr_dev(div0, "class", "title");
    			add_location(div0, file, 65, 4, 1590);
    			attr_dev(div1, "class", "content");
    			add_location(div1, file, 64, 0, 1564);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			if_blocks[current_block_type_index].m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div1, null);
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
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('dashboard-zone', slots, []);
    	let requests = [];
    	let new_data = { social: {} };
    	let old_data = { social: {} };
    	let diff = false;

    	const getRequests = () => {
    		let req = new XMLHttpRequest();
    		req.open("GET", "/admin/api/requests", true);

    		req.onload = () => {
    			if (req.status == 200) {
    				$$invalidate(0, requests = JSON.parse(req.responseText));
    			}
    		};

    		req.send(null);
    	};

    	getRequests();

    	const showDiff = (req, e) => {
    		e.target.parentNode.nextSibling.nextSibling.classList.toggle("active");
    		$$invalidate(1, new_data = req.new_data);
    		$$invalidate(2, old_data = req.old_data);
    	};

    	const deleteIndex = toRemove => {
    		let newReqs = [];

    		requests.forEach((request, index) => {
    			if (index != toRemove) {
    				newReqs = [...newReqs, request];
    			}
    		});

    		$$invalidate(0, requests = newReqs);
    	};

    	const acceptReq = (request, i) => {
    		request.id;
    		let req = new XMLHttpRequest();
    		req.open("POST", "/admin/api/request/accept/", true);
    		req.setRequestHeader('Content-Type', 'application/json');

    		req.onload = () => {
    			if (req.status == 200) {
    				deleteIndex(i);
    			} else {
    				alert(req.responseText);
    			}
    		};

    		req.send(JSON.stringify(request));
    	};

    	const rejectReq = (request, i) => {
    		let reqID = request.id;
    		let req = new XMLHttpRequest();
    		req.open("GET", "/admin/api/request/reject/" + reqID, true);

    		req.onload = () => {
    			if (req.status == 200) {
    				deleteIndex(i);
    			} else {
    				alert(req.responseText);
    			}
    		};

    		req.send(null);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<dashboard-zone> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (request, e) => showDiff(request, e);
    	const click_handler_1 = (request, i) => acceptReq(request, i);
    	const click_handler_2 = (request, i) => rejectReq(request, i);

    	$$self.$capture_state = () => ({
    		fade,
    		requests,
    		new_data,
    		old_data,
    		diff,
    		getRequests,
    		showDiff,
    		deleteIndex,
    		acceptReq,
    		rejectReq
    	});

    	$$self.$inject_state = $$props => {
    		if ('requests' in $$props) $$invalidate(0, requests = $$props.requests);
    		if ('new_data' in $$props) $$invalidate(1, new_data = $$props.new_data);
    		if ('old_data' in $$props) $$invalidate(2, old_data = $$props.old_data);
    		if ('diff' in $$props) diff = $$props.diff;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		requests,
    		new_data,
    		old_data,
    		showDiff,
    		acceptReq,
    		rejectReq,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class DashboardZone extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>.content{padding:20px;background-color:rgb(245, 245, 245);box-shadow:0px 3px 10px rgba(0, 0, 0, 0.3);color:rgb(73, 73, 73);border-radius:2px}.title{font-size:25px;font-weight:bold;margin-bottom:20px}.diff{cursor:pointer}.request{display:flex;flex-direction:row;justify-content:space-between;padding:10px;gap:10px;margin-bottom:10px;border-radius:2px}.edit{background-color:deepskyblue;color:white}.delete{background-color:crimson;color:white}.accept{background-color:rgba(0, 0, 0, 0.3);color:white;border:0px;border-radius:2px;padding:5px 10px;cursor:pointer}.reject{background-color:transparent;color:white;border:0px;border-radius:2px;padding:5px 10px;cursor:pointer}.diffBox{display:none;flex-direction:column;background-color:#0086b2;color:white;bottom:0px;left:0px;width:100%;overflow:hidden;margin-bottom:10px;border-radius:2px;padding:10px;box-sizing:border-box}.active{display:flex}.diffTitle{font-size:30px;color:rgba(255, 255, 255, 0.7)}table{width:100%}thead{font-weight:bold;border-bottom:1px solid rgba(255, 255, 255, 0.5)}</style>`;

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("dashboard-zone", DashboardZone);

})();
//# sourceMappingURL=bundle.js.map
