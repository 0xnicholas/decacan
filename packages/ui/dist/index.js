import rb, { clsx as ab } from "clsx";
import { twMerge as ib } from "tailwind-merge";
import * as R from "react";
import W, { createContext as fe, useRef as B, useLayoutEffect as wf, useEffect as U, useId as Kr, useContext as ee, useInsertionEffect as pi, useMemo as F, useCallback as G, Children as ob, isValidElement as $f, useState as _, Fragment as gi, createElement as sb, forwardRef as ut, Component as lb, memo as ub, useReducer as Df, cloneElement as Cf } from "react";
import { cva as re } from "class-variance-authority";
import { Plus as cb, ChevronDown as Wr, X as Os, MoreHorizontal as Ef, ChevronRight as vi, ChevronLeft as db, ArrowRight as Sf, ArrowLeft as Tf, Check as nt, Minus as fb, Copy as mb, Search as hb, CheckIcon as pb, CircleIcon as gb, ChevronRightIcon as Pf, CirclePlus as vb, Circle as zs, ArrowUp as Eu, ArrowDown as Su, ArrowLeftToLine as bb, ArrowRightToLine as yb, Settings2 as xb, ChevronsUpDown as wb, PinOff as $b, ChevronUp as Db, ChevronLeftIcon as Cb, GripVertical as kf, GripHorizontal as Eb, Star as Tu, MinusIcon as Sb, ChevronDownIcon as Nf, SquareMinus as Tb, SquarePlus as Pb } from "lucide-react";
import * as je from "@radix-ui/react-accordion";
import { Slot as Qe } from "@radix-ui/react-slot";
import * as Tt from "@radix-ui/react-alert-dialog";
import * as kb from "@radix-ui/react-aspect-ratio";
import * as _s from "@radix-ui/react-avatar";
import { DayPicker as Nb } from "react-day-picker";
import Ab from "embla-carousel-react";
import * as Us from "recharts";
import * as Pu from "@radix-ui/react-checkbox";
import * as Hs from "@radix-ui/react-collapsible";
import * as ye from "@radix-ui/react-dialog";
import { Command as un } from "cmdk";
import * as Te from "@radix-ui/react-context-menu";
import * as Ks from "@radix-ui/react-popover";
import * as jb from "@radix-ui/react-separator";
import * as Pe from "@radix-ui/react-dropdown-menu";
import * as Me from "@radix-ui/react-select";
import { unstable_batchedUpdates as ma, createPortal as Mb, flushSync as Rb } from "react-dom";
import { Root as Ib, Content as Vb, Overlay as Bb, Portal as Lb } from "vaul";
import * as Fb from "@radix-ui/react-label";
import { FormProvider as Ob, Controller as zb, useFormContext as _b } from "react-hook-form";
import * as Ga from "@radix-ui/react-hover-card";
import { OTPInput as Ub, OTPInputContext as Hb } from "input-otp";
import * as Ce from "@radix-ui/react-menubar";
import * as Kt from "@radix-ui/react-navigation-menu";
import * as ku from "@radix-ui/react-progress";
import * as Ho from "@radix-ui/react-radio-group";
import * as Ws from "react-resizable-panels";
import * as vr from "@radix-ui/react-scroll-area";
import * as Aa from "@radix-ui/react-slider";
import { useTheme as Kb } from "next-themes";
import { Toaster as Wb } from "sonner";
import * as Nu from "@radix-ui/react-switch";
import * as bi from "@radix-ui/react-tabs";
import * as Gb from "@radix-ui/react-toggle";
import * as Af from "@radix-ui/react-toggle-group";
import * as yi from "@radix-ui/react-tooltip";
function y(...e) {
  return ib(ab(e));
}
var ha = { exports: {} }, sr = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Au;
function Yb() {
  if (Au) return sr;
  Au = 1;
  var e = Symbol.for("react.transitional.element"), t = Symbol.for("react.fragment");
  function n(r, a, i) {
    var o = null;
    if (i !== void 0 && (o = "" + i), a.key !== void 0 && (o = "" + a.key), "key" in a) {
      i = {};
      for (var s in a)
        s !== "key" && (i[s] = a[s]);
    } else i = a;
    return a = i.ref, {
      $$typeof: e,
      type: r,
      key: o,
      ref: a !== void 0 ? a : null,
      props: i
    };
  }
  return sr.Fragment = t, sr.jsx = n, sr.jsxs = n, sr;
}
var lr = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ju;
function qb() {
  return ju || (ju = 1, process.env.NODE_ENV !== "production" && (function() {
    function e($) {
      if ($ == null) return null;
      if (typeof $ == "function")
        return $.$$typeof === M ? null : $.displayName || $.name || null;
      if (typeof $ == "string") return $;
      switch ($) {
        case v:
          return "Fragment";
        case x:
          return "Profiler";
        case b:
          return "StrictMode";
        case k:
          return "Suspense";
        case A:
          return "SuspenseList";
        case T:
          return "Activity";
      }
      if (typeof $ == "object")
        switch (typeof $.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), $.$$typeof) {
          case g:
            return "Portal";
          case w:
            return $.displayName || "Context";
          case C:
            return ($._context.displayName || "Context") + ".Consumer";
          case E:
            var D = $.render;
            return $ = $.displayName, $ || ($ = D.displayName || D.name || "", $ = $ !== "" ? "ForwardRef(" + $ + ")" : "ForwardRef"), $;
          case P:
            return D = $.displayName || null, D !== null ? D : e($.type) || "Memo";
          case j:
            D = $._payload, $ = $._init;
            try {
              return e($(D));
            } catch {
            }
        }
      return null;
    }
    function t($) {
      return "" + $;
    }
    function n($) {
      try {
        t($);
        var D = !1;
      } catch {
        D = !0;
      }
      if (D) {
        D = console;
        var N = D.error, I = typeof Symbol == "function" && Symbol.toStringTag && $[Symbol.toStringTag] || $.constructor.name || "Object";
        return N.call(
          D,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          I
        ), t($);
      }
    }
    function r($) {
      if ($ === v) return "<>";
      if (typeof $ == "object" && $ !== null && $.$$typeof === j)
        return "<...>";
      try {
        var D = e($);
        return D ? "<" + D + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function a() {
      var $ = L.A;
      return $ === null ? null : $.getOwner();
    }
    function i() {
      return Error("react-stack-top-frame");
    }
    function o($) {
      if (O.call($, "key")) {
        var D = Object.getOwnPropertyDescriptor($, "key").get;
        if (D && D.isReactWarning) return !1;
      }
      return $.key !== void 0;
    }
    function s($, D) {
      function N() {
        J || (J = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          D
        ));
      }
      N.isReactWarning = !0, Object.defineProperty($, "key", {
        get: N,
        configurable: !0
      });
    }
    function l() {
      var $ = e(this.type);
      return Y[$] || (Y[$] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), $ = this.props.ref, $ !== void 0 ? $ : null;
    }
    function c($, D, N, I, H, ne) {
      var X = N.ref;
      return $ = {
        $$typeof: p,
        type: $,
        key: D,
        props: N,
        _owner: I
      }, (X !== void 0 ? X : null) !== null ? Object.defineProperty($, "ref", {
        enumerable: !1,
        get: l
      }) : Object.defineProperty($, "ref", { enumerable: !1, value: null }), $._store = {}, Object.defineProperty($._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty($, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty($, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: H
      }), Object.defineProperty($, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: ne
      }), Object.freeze && (Object.freeze($.props), Object.freeze($)), $;
    }
    function d($, D, N, I, H, ne) {
      var X = D.children;
      if (X !== void 0)
        if (I)
          if (Z(X)) {
            for (I = 0; I < X.length; I++)
              f(X[I]);
            Object.freeze && Object.freeze(X);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else f(X);
      if (O.call(D, "key")) {
        X = e($);
        var oe = Object.keys(D).filter(function(V) {
          return V !== "key";
        });
        I = 0 < oe.length ? "{key: someKey, " + oe.join(": ..., ") + ": ...}" : "{key: someKey}", S[X + I] || (oe = 0 < oe.length ? "{" + oe.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          I,
          X,
          oe,
          X
        ), S[X + I] = !0);
      }
      if (X = null, N !== void 0 && (n(N), X = "" + N), o(D) && (n(D.key), X = "" + D.key), "key" in D) {
        N = {};
        for (var le in D)
          le !== "key" && (N[le] = D[le]);
      } else N = D;
      return X && s(
        N,
        typeof $ == "function" ? $.displayName || $.name || "Unknown" : $
      ), c(
        $,
        X,
        N,
        a(),
        H,
        ne
      );
    }
    function f($) {
      m($) ? $._store && ($._store.validated = 1) : typeof $ == "object" && $ !== null && $.$$typeof === j && ($._payload.status === "fulfilled" ? m($._payload.value) && $._payload.value._store && ($._payload.value._store.validated = 1) : $._store && ($._store.validated = 1));
    }
    function m($) {
      return typeof $ == "object" && $ !== null && $.$$typeof === p;
    }
    var h = W, p = Symbol.for("react.transitional.element"), g = Symbol.for("react.portal"), v = Symbol.for("react.fragment"), b = Symbol.for("react.strict_mode"), x = Symbol.for("react.profiler"), C = Symbol.for("react.consumer"), w = Symbol.for("react.context"), E = Symbol.for("react.forward_ref"), k = Symbol.for("react.suspense"), A = Symbol.for("react.suspense_list"), P = Symbol.for("react.memo"), j = Symbol.for("react.lazy"), T = Symbol.for("react.activity"), M = Symbol.for("react.client.reference"), L = h.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, O = Object.prototype.hasOwnProperty, Z = Array.isArray, Q = console.createTask ? console.createTask : function() {
      return null;
    };
    h = {
      react_stack_bottom_frame: function($) {
        return $();
      }
    };
    var J, Y = {}, K = h.react_stack_bottom_frame.bind(
      h,
      i
    )(), te = Q(r(i)), S = {};
    lr.Fragment = v, lr.jsx = function($, D, N) {
      var I = 1e4 > L.recentlyCreatedOwnerStacks++;
      return d(
        $,
        D,
        N,
        !1,
        I ? Error("react-stack-top-frame") : K,
        I ? Q(r($)) : te
      );
    }, lr.jsxs = function($, D, N) {
      var I = 1e4 > L.recentlyCreatedOwnerStacks++;
      return d(
        $,
        D,
        N,
        !0,
        I ? Error("react-stack-top-frame") : K,
        I ? Q(r($)) : te
      );
    };
  })()), lr;
}
var Mu;
function Zb() {
  return Mu || (Mu = 1, process.env.NODE_ENV === "production" ? ha.exports = Yb() : ha.exports = qb()), ha.exports;
}
var u = Zb();
const Xb = re("", {
  variants: {
    variant: {
      default: "",
      outline: "space-y-2",
      solid: "space-y-2"
    }
  },
  defaultVariants: {
    variant: "default"
  }
}), Jb = re("", {
  variants: {
    variant: {
      default: "border-b border-border",
      outline: "border border-border rounded-lg px-4",
      solid: "rounded-lg bg-accent/70 px-4"
    }
  },
  defaultVariants: {
    variant: "default"
  }
}), Qb = re(
  "flex flex-1 items-center justify-between py-4 gap-2.5 text-foreground font-medium transition-all [&[data-state=open]>svg]:rotate-180 cursor-pointer",
  {
    variants: {
      variant: {
        default: "",
        outline: "",
        solid: ""
      },
      indicator: {
        arrow: "",
        plus: "[&>svg>path:last-child]:origin-center [&>svg>path:last-child]:transition-all [&>svg>path:last-child]:duration-200 [&[data-state=open]>svg>path:last-child]:rotate-90 [&[data-state=open]>svg>path:last-child]:opacity-0 [&[data-state=open]>svg]:rotate-180",
        none: ""
      }
    },
    defaultVariants: {
      variant: "default",
      indicator: "arrow"
    }
  }
), ey = re(
  "overflow-hidden text-sm text-accent-foreground transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
  {
    variants: {
      variant: {
        default: "",
        outline: "",
        solid: ""
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
), xi = R.createContext({
  variant: "default",
  indicator: "arrow"
});
function RE(e) {
  const { className: t, variant: n = "default", indicator: r = "arrow", children: a, ...i } = e;
  return /* @__PURE__ */ u.jsx(xi.Provider, { value: { variant: n || "default", indicator: r }, children: /* @__PURE__ */ u.jsx(
    je.Root,
    {
      "data-slot": "accordion",
      className: y(Xb({ variant: n }), t),
      ...i,
      children: a
    }
  ) });
}
function IE(e) {
  const { className: t, children: n, ...r } = e, { variant: a } = R.useContext(xi);
  return /* @__PURE__ */ u.jsx(
    je.Item,
    {
      "data-slot": "accordion-item",
      className: y(Jb({ variant: a }), t),
      ...r,
      children: n
    }
  );
}
function VE(e) {
  const { className: t, children: n, ...r } = e, { variant: a, indicator: i } = R.useContext(xi);
  return /* @__PURE__ */ u.jsx(je.Header, { className: "flex", children: /* @__PURE__ */ u.jsxs(
    je.Trigger,
    {
      "data-slot": "accordion-trigger",
      className: y(Qb({ variant: a, indicator: i }), t),
      ...r,
      children: [
        n,
        i === "plus" && /* @__PURE__ */ u.jsx(cb, { className: "size-4 shrink-0 transition-transform duration-200", strokeWidth: 1 }),
        i === "arrow" && /* @__PURE__ */ u.jsx(Wr, { className: "size-4 shrink-0 transition-transform duration-200", strokeWidth: 1 })
      ]
    }
  ) });
}
function BE(e) {
  const { className: t, children: n, ...r } = e, { variant: a } = R.useContext(xi);
  return /* @__PURE__ */ u.jsx(
    je.Content,
    {
      "data-slot": "accordion-content",
      className: y(ey({ variant: a }), t),
      ...r,
      children: /* @__PURE__ */ u.jsx("div", { className: y("pb-5 pt-0", t), children: n })
    }
  );
}
const Pt = R.createContext({
  matchPath: () => !1,
  selectedValue: "",
  setSelectedValue: () => {
  },
  nestedStates: {},
  setNestedStates: () => {
  }
});
function LE({
  className: e,
  matchPath: t = () => !1,
  classNames: n,
  children: r,
  selectedValue: a,
  onItemClick: i,
  ...o
}) {
  const [s, l] = R.useState(a);
  R.useEffect(() => {
    l(a);
  }, [a]);
  const c = R.useMemo(() => {
    const p = (x, C = []) => {
      let w = [];
      return R.Children.forEach(x, (E) => {
        if (R.isValidElement(E)) {
          const { value: k, children: A } = E.props, P = k ? [...C, k] : C;
          if (k && (k === a || t(k)))
            w = P;
          else if (A) {
            const j = p(A, P);
            j.length > 0 && (w = j);
          }
        }
      }), w;
    }, g = p(r), v = g.length > 1 ? g.slice(0, g.length - 1) : g, b = {};
    if (v.length > 0)
      if (o.type === "multiple")
        b.root = v;
      else {
        b.root = v[0];
        for (let x = 0; x < v.length - 1; x++)
          b[v[x]] = v[x + 1];
      }
    return b;
  }, [r, t, a, o.type]), [d, f] = R.useState(c), m = Array.isArray(d.root) ? d.root : typeof d.root == "string" ? [d.root] : [], h = d.root ?? "";
  return /* @__PURE__ */ u.jsx(
    Pt.Provider,
    {
      value: {
        matchPath: t,
        selectedValue: s,
        setSelectedValue: l,
        classNames: n,
        onItemClick: i,
        nestedStates: d,
        setNestedStates: f
      },
      children: o.type === "single" ? /* @__PURE__ */ u.jsx(
        je.Root,
        {
          "data-slot": "accordion-menu",
          value: h,
          className: y("w-full", n?.root, e),
          onValueChange: (p) => f((g) => ({ ...g, root: p })),
          ...o,
          role: "menu",
          children: r
        }
      ) : /* @__PURE__ */ u.jsx(
        je.Root,
        {
          "data-slot": "accordion-menu",
          value: m,
          className: y("w-full", n?.root, e),
          onValueChange: (p) => f((g) => ({ ...g, root: p })),
          ...o,
          role: "menu",
          children: r
        }
      )
    }
  );
}
function FE({ children: e, className: t, ...n }) {
  const { classNames: r } = R.useContext(Pt);
  return /* @__PURE__ */ u.jsx(
    "div",
    {
      "data-slot": "accordion-menu-group",
      role: "group",
      className: y("space-y-0.5", r?.group, t),
      ...n,
      children: e
    }
  );
}
function OE({ children: e, className: t, ...n }) {
  const { classNames: r } = R.useContext(Pt);
  return /* @__PURE__ */ u.jsx(
    "div",
    {
      "data-slot": "accordion-menu-label",
      role: "presentation",
      className: y("px-2 py-1.5 text-xs font-medium text-muted-foreground", r?.label, t),
      ...n,
      children: e
    }
  );
}
function zE({ className: e, ...t }) {
  const { classNames: n } = R.useContext(Pt);
  return /* @__PURE__ */ u.jsx(
    "div",
    {
      "data-slot": "accordion-menu-separator",
      role: "separator",
      className: y("my-1 h-px bg-border", n?.separator, e),
      ...t
    }
  );
}
const ty = re(
  "relative cursor-pointer select-none flex w-full text-start items-center text-foreground rounded-lg gap-2 px-2 py-1.5 text-sm outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground disabled:opacity-50 disabled:bg-transparent focus-visible:bg-accent focus-visible:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:opacity-60 [&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0 [&_a]:flex [&>a]:w-full [&>a]:items-center [&>a]:gap-2",
  {
    variants: {
      variant: {
        default: "",
        destructive: "text-destructive hover:text-destructive focus:text-destructive hover:bg-destructive/5 focus:bg-destructive/5 data-[active=true]:bg-destructive/5"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function _E({
  className: e,
  children: t,
  variant: n,
  asChild: r,
  onClick: a,
  ...i
}) {
  const { classNames: o, selectedValue: s, matchPath: l, onItemClick: c } = R.useContext(Pt);
  return /* @__PURE__ */ u.jsx(je.Item, { className: "flex", ...i, children: /* @__PURE__ */ u.jsx(je.Header, { className: "flex w-full", children: /* @__PURE__ */ u.jsx(
    je.Trigger,
    {
      asChild: r,
      "data-slot": "accordion-menu-item",
      className: y(ty({ variant: n }), o?.item, e),
      onClick: (d) => {
        c && c(i.value, d), a && a(d), d.preventDefault();
      },
      onKeyDown: (d) => {
        if (d.key === "Enter") {
          d.preventDefault();
          const m = d.currentTarget.firstElementChild;
          m && m.click();
        }
      },
      "data-selected": l(i.value) || s === i.value ? "true" : void 0,
      children: t
    }
  ) }) });
}
function UE({
  className: e,
  children: t,
  ...n
}) {
  const { classNames: r } = R.useContext(Pt);
  return /* @__PURE__ */ u.jsx(je.Item, { "data-slot": "accordion-menu-sub", className: y(r?.sub, e), ...n, children: t });
}
function HE({
  className: e,
  children: t
}) {
  const { classNames: n } = R.useContext(Pt);
  return /* @__PURE__ */ u.jsx(je.Header, { className: "flex", children: /* @__PURE__ */ u.jsx(
    je.Trigger,
    {
      "data-slot": "accordion-menu-sub-trigger",
      className: y(
        "w-full relative flex items-center cursor-pointer select-none text-start rounded-lg gap-2 px-2 py-1.5 text-sm outline-hidden text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([role=img]):not([class*=text-])]:opacity-60 [&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0",
        n?.subTrigger,
        e
      ),
      children: /* @__PURE__ */ u.jsxs(u.Fragment, { children: [
        t,
        /* @__PURE__ */ u.jsx(
          Wr,
          {
            "data-slot": "accordion-menu-sub-indicator",
            className: y(
              "ms-auto size-3.5! shrink-0 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:-rotate-180"
            )
          }
        )
      ] })
    }
  ) });
}
function KE({
  className: e,
  children: t,
  type: n,
  collapsible: r,
  defaultValue: a,
  parentValue: i,
  ...o
}) {
  const { nestedStates: s, setNestedStates: l, classNames: c } = R.useContext(Pt);
  let d;
  if (n === "multiple") {
    const f = s[i];
    Array.isArray(f) ? d = f : typeof f == "string" ? d = [f] : a ? d = Array.isArray(a) ? a : [a] : d = [];
  } else
    d = s[i] ?? a ?? "";
  return /* @__PURE__ */ u.jsx(
    je.Content,
    {
      "data-slot": "accordion-menu-sub-content",
      className: y(
        "ps-5",
        "overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        c?.subContent,
        e
      ),
      ...o,
      children: n === "multiple" ? /* @__PURE__ */ u.jsx(
        je.Root,
        {
          className: y("w-full py-0.5", c?.subWrapper),
          type: "multiple",
          value: d,
          role: "menu",
          "data-slot": "accordion-menu-sub-wrapper",
          onValueChange: (f) => {
            const m = Array.isArray(f) ? f : [f];
            l((h) => ({ ...h, [i]: m }));
          },
          children: t
        }
      ) : /* @__PURE__ */ u.jsx(
        je.Root,
        {
          className: y("w-full py-0.5", c?.subWrapper),
          type: "single",
          collapsible: r,
          value: d,
          role: "menu",
          "data-slot": "accordion-menu-sub-wrapper",
          onValueChange: (f) => l((m) => ({ ...m, [i]: f })),
          children: t
        }
      )
    }
  );
}
function WE({ className: e, ...t }) {
  const { classNames: n } = R.useContext(Pt);
  return /* @__PURE__ */ u.jsx(
    "span",
    {
      "aria-hidden": "true",
      "data-slot": "accordion-menu-indicator",
      className: y("ms-auto flex items-center font-medium", n?.indicator, e),
      ...t
    }
  );
}
const Tr = re(
  "cursor-pointer group whitespace-nowrap focus-visible:outline-hidden inline-flex items-center justify-center has-data-[arrow=true]:justify-between whitespace-nowrap text-sm font-medium ring-offset-background transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-60 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 data-[state=open]:bg-primary/90",
        mono: "bg-zinc-950 text-white dark:bg-zinc-300 dark:text-black hover:bg-zinc-950/90 dark:hover:bg-zinc-300/90 data-[state=open]:bg-zinc-950/90 dark:data-[state=open]:bg-zinc-300/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 data-[state=open]:bg-destructive/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 data-[state=open]:bg-secondary/90",
        outline: "bg-background text-accent-foreground border border-input hover:bg-accent data-[state=open]:bg-accent",
        dashed: "text-accent-foreground border border-input border-dashed bg-background hover:bg-accent hover:text-accent-foreground data-[state=open]:text-accent-foreground",
        ghost: "text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        dim: "text-muted-foreground hover:text-foreground data-[state=open]:text-foreground",
        foreground: "",
        inverse: ""
      },
      appearance: {
        default: "",
        ghost: ""
      },
      underline: {
        solid: "",
        dashed: ""
      },
      underlined: {
        solid: "",
        dashed: ""
      },
      size: {
        lg: "h-10 rounded-md px-4 text-sm gap-1.5 [&_svg:not([class*=size-])]:size-4",
        md: "h-8.5 rounded-md px-3 gap-1.5 text-[0.8125rem] leading-(--text-sm--line-height) [&_svg:not([class*=size-])]:size-4",
        sm: "h-7 rounded-md px-2.5 gap-1.25 text-xs [&_svg:not([class*=size-])]:size-3.5",
        icon: "size-8.5 rounded-md [&_svg:not([class*=size-])]:size-4 shrink-0"
      },
      autoHeight: {
        true: "",
        false: ""
      },
      shape: {
        default: "",
        circle: "rounded-full"
      },
      mode: {
        default: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        icon: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shrink-0",
        link: "text-primary h-auto p-0 bg-transparent rounded-none hover:bg-transparent data-[state=open]:bg-transparent",
        input: `
            justify-start font-normal hover:bg-background [&_svg]:transition-colors [&_svg]:hover:text-foreground data-[state=open]:bg-background 
            focus-visible:border-ring focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring/30 
            [[data-state=open]>&]:border-ring [[data-state=open]>&]:outline-hidden [[data-state=open]>&]:ring-[3px] 
            [[data-state=open]>&]:ring-ring/30 
            aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/20
            in-data-[invalid=true]:border-destructive/60 in-data-[invalid=true]:ring-destructive/10  dark:in-data-[invalid=true]:border-destructive dark:in-data-[invalid=true]:ring-destructive/20
          `
      },
      placeholder: {
        true: "text-muted-foreground",
        false: ""
      }
    },
    compoundVariants: [
      // Icons opacity for default mode
      {
        variant: "ghost",
        mode: "default",
        className: "[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60"
      },
      {
        variant: "outline",
        mode: "default",
        className: "[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60"
      },
      {
        variant: "dashed",
        mode: "default",
        className: "[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60"
      },
      {
        variant: "secondary",
        mode: "default",
        className: "[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60"
      },
      // Icons opacity for default mode
      {
        variant: "outline",
        mode: "input",
        className: "[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60"
      },
      {
        variant: "outline",
        mode: "icon",
        className: "[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60"
      },
      // Auto height
      {
        size: "md",
        autoHeight: !0,
        className: "h-auto min-h-8.5"
      },
      {
        size: "sm",
        autoHeight: !0,
        className: "h-auto min-h-7"
      },
      {
        size: "lg",
        autoHeight: !0,
        className: "h-auto min-h-10"
      },
      // Shadow support
      {
        variant: "primary",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "mono",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "secondary",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "outline",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "dashed",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "destructive",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      // Shadow support
      {
        variant: "primary",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "mono",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "secondary",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "outline",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "dashed",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "destructive",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      // Link
      {
        variant: "primary",
        mode: "link",
        underline: "solid",
        className: "font-medium text-primary hover:text-primary/90 [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-solid"
      },
      {
        variant: "primary",
        mode: "link",
        underline: "dashed",
        className: "font-medium text-primary hover:text-primary/90 [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-dashed decoration-1"
      },
      {
        variant: "primary",
        mode: "link",
        underlined: "solid",
        className: "font-medium text-primary hover:text-primary/90 [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-solid"
      },
      {
        variant: "primary",
        mode: "link",
        underlined: "dashed",
        className: "font-medium text-primary hover:text-primary/90 [&_svg]:opacity-60 underline underline-offset-4 decoration-dashed decoration-1"
      },
      {
        variant: "inverse",
        mode: "link",
        underline: "solid",
        className: "font-medium text-inherit [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-solid"
      },
      {
        variant: "inverse",
        mode: "link",
        underline: "dashed",
        className: "font-medium text-inherit [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-dashed decoration-1"
      },
      {
        variant: "inverse",
        mode: "link",
        underlined: "solid",
        className: "font-medium text-inherit [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-solid"
      },
      {
        variant: "inverse",
        mode: "link",
        underlined: "dashed",
        className: "font-medium text-inherit [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-dashed decoration-1"
      },
      {
        variant: "foreground",
        mode: "link",
        underline: "solid",
        className: "font-medium text-foreground [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-solid"
      },
      {
        variant: "foreground",
        mode: "link",
        underline: "dashed",
        className: "font-medium text-foreground [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-dashed decoration-1"
      },
      {
        variant: "foreground",
        mode: "link",
        underlined: "solid",
        className: "font-medium text-foreground [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-solid"
      },
      {
        variant: "foreground",
        mode: "link",
        underlined: "dashed",
        className: "font-medium text-foreground [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-dashed decoration-1"
      },
      // Ghost
      {
        variant: "primary",
        appearance: "ghost",
        className: "bg-transparent text-primary/90 hover:bg-primary/5 data-[state=open]:bg-primary/5"
      },
      {
        variant: "destructive",
        appearance: "ghost",
        className: "bg-transparent text-destructive/90 hover:bg-destructive/5 data-[state=open]:bg-destructive/5"
      },
      {
        variant: "ghost",
        mode: "icon",
        className: "text-muted-foreground"
      },
      // Size
      {
        size: "sm",
        mode: "icon",
        className: "w-7 h-7 p-0 [[&_svg:not([class*=size-])]:size-3.5"
      },
      {
        size: "md",
        mode: "icon",
        className: "w-8.5 h-8.5 p-0 [&_svg:not([class*=size-])]:size-4"
      },
      {
        size: "icon",
        className: "w-8.5 h-8.5 p-0 [&_svg:not([class*=size-])]:size-4"
      },
      {
        size: "lg",
        mode: "icon",
        className: "w-10 h-10 p-0 [&_svg:not([class*=size-])]:size-4"
      },
      // Input mode
      {
        mode: "input",
        placeholder: !0,
        variant: "outline",
        className: "font-normal text-muted-foreground"
      },
      {
        mode: "input",
        variant: "outline",
        size: "sm",
        className: "gap-1.25"
      },
      {
        mode: "input",
        variant: "outline",
        size: "md",
        className: "gap-1.5"
      },
      {
        mode: "input",
        variant: "outline",
        size: "lg",
        className: "gap-1.5"
      }
    ],
    defaultVariants: {
      variant: "primary",
      mode: "default",
      size: "md",
      shape: "default",
      appearance: "default"
    }
  }
);
function Re({
  className: e,
  selected: t,
  variant: n,
  shape: r,
  appearance: a,
  mode: i,
  size: o,
  autoHeight: s,
  underlined: l,
  underline: c,
  asChild: d = !1,
  placeholder: f = !1,
  ...m
}) {
  const h = d ? Qe : "button";
  return /* @__PURE__ */ u.jsx(
    h,
    {
      "data-slot": "button",
      className: y(
        Tr({
          variant: n,
          size: o,
          shape: r,
          appearance: a,
          mode: i,
          autoHeight: s,
          placeholder: f,
          underlined: l,
          underline: c,
          className: e
        }),
        d && m.disabled && "pointer-events-none opacity-50"
      ),
      ...t && { "data-state": "open" },
      ...m
    }
  );
}
function GE({ icon: e = Wr, className: t, ...n }) {
  return /* @__PURE__ */ u.jsx(e, { "data-slot": "button-arrow", className: y("ms-auto -me-1", t), ...n });
}
const ny = re("flex items-stretch w-full gap-2 group-[.toaster]:w-(--width)", {
  variants: {
    variant: {
      secondary: "",
      primary: "",
      destructive: "",
      success: "",
      info: "",
      mono: "",
      warning: ""
    },
    icon: {
      primary: "",
      destructive: "",
      success: "",
      info: "",
      warning: ""
    },
    appearance: {
      solid: "",
      outline: "",
      light: "",
      stroke: "text-foreground"
    },
    size: {
      lg: "rounded-lg p-4 gap-3 text-base [&>[data-slot=alert-icon]>svg]:size-6 *:data-slot=alert-icon:mt-0.5 [&_[data-slot=alert-close]]:mt-1",
      md: "rounded-lg p-3.5 gap-2.5 text-sm [&>[data-slot=alert-icon]>svg]:size-5 *:data-slot=alert-icon:mt-0 [&_[data-slot=alert-close]]:mt-0.5",
      sm: "rounded-md px-3 py-2.5 gap-2 text-xs [&>[data-slot=alert-icon]>svg]:size-4 *:data-alert-icon:mt-0.5 [&_[data-slot=alert-close]]:mt-0.25 [&_[data-slot=alert-close]_svg]:size-3.5"
    }
  },
  compoundVariants: [
    /* Solid */
    {
      variant: "secondary",
      appearance: "solid",
      className: "bg-muted text-foreground"
    },
    {
      variant: "primary",
      appearance: "solid",
      className: "bg-primary text-primary-foreground"
    },
    {
      variant: "destructive",
      appearance: "solid",
      className: "bg-destructive text-destructive-foreground"
    },
    {
      variant: "success",
      appearance: "solid",
      className: "bg-[var(--color-success,var(--color-green-500))] text-[var(--color-success-foreground,var(--color-white))]"
    },
    {
      variant: "info",
      appearance: "solid",
      className: "bg-[var(--color-info,var(--color-violet-600))] text-[var(--color-info-foreground,var(--color-white))]"
    },
    {
      variant: "warning",
      appearance: "solid",
      className: "bg-[var(--color-warning,var(--color-yellow-500))] text-[var(--color-warning-foreground,var(--color-white))]"
    },
    {
      variant: "mono",
      appearance: "solid",
      className: "bg-zinc-950 text-white dark:bg-zinc-300 dark:text-black *:data-slot-[alert=close]:text-white"
    },
    /* Outline */
    {
      variant: "secondary",
      appearance: "outline",
      className: "border border-border bg-background text-foreground [&_[data-slot=alert-close]]:text-foreground"
    },
    {
      variant: "primary",
      appearance: "outline",
      className: "border border-border bg-background text-primary [&_[data-slot=alert-close]]:text-foreground"
    },
    {
      variant: "destructive",
      appearance: "outline",
      className: "border border-border bg-background text-destructive [&_[data-slot=alert-close]]:text-foreground"
    },
    {
      variant: "success",
      appearance: "outline",
      className: "border border-border bg-background text-[var(--color-success,var(--color-green-500))] [&_[data-slot=alert-close]]:text-foreground"
    },
    {
      variant: "info",
      appearance: "outline",
      className: "border border-border bg-background text-[var(--color-info,var(--color-violet-600))] [&_[data-slot=alert-close]]:text-foreground"
    },
    {
      variant: "warning",
      appearance: "outline",
      className: "border border-border bg-background text-[var(--color-warning,var(--color-yellow-500))] [&_[data-slot=alert-close]]:text-foreground"
    },
    {
      variant: "mono",
      appearance: "outline",
      className: "border border-border bg-background text-foreground [&_[data-slot=alert-close]]:text-foreground"
    },
    /* Light */
    {
      variant: "secondary",
      appearance: "light",
      className: "bg-muted border border-border text-foreground"
    },
    {
      variant: "primary",
      appearance: "light",
      className: "text-foreground bg-[var(--color-primary-soft,var(--color-blue-50))] border border-[var(--color-primary-alpha,var(--color-blue-100))] [&_[data-slot=alert-icon]]:text-primary dark:bg-[var(--color-primary-soft,var(--color-blue-950))] dark:border-[var(--color-primary-alpha,var(--color-blue-900))]"
    },
    {
      variant: "destructive",
      appearance: "light",
      className: "bg-[var(--color-destructive-soft,var(--color-red-50))] border border-[var(--color-destructive-alpha,var(--color-red-100))] text-foreground [&_[data-slot=alert-icon]]:text-destructive dark:bg-[var(--color-destructive-soft,var(--color-red-950))] dark:border-[var(--color-destructive-alpha,var(--color-red-900))] "
    },
    {
      variant: "success",
      appearance: "light",
      className: "bg-[var(--color-success-soft,var(--color-green-50))] border border-[var(--color-success-alpha,var(--color-green-200))] text-foreground [&_[data-slot=alert-icon]]:text-[var(--color-success-foreground,var(--color-green-600))] dark:bg-[var(--color-success-soft,var(--color-green-950))] dark:border-[var(--color-success-alpha,var(--color-green-900))]"
    },
    {
      variant: "info",
      appearance: "light",
      className: "bg-[var(--color-info-soft,var(--color-violet-50))] border border-[var(--color-info-alpha,var(--color-violet-100))] text-foreground [&_[data-slot=alert-icon]]:text-[var(--color-info-foreground,var(--color-violet-600))] dark:bg-[var(--color-info-soft,var(--color-violet-950))] dark:border-[var(--color-info-alpha,var(--color-violet-900))]"
    },
    {
      variant: "warning",
      appearance: "light",
      className: "bg-[var(--color-warning-soft,var(--color-yellow-50))] border border-[var(--color-warning-alpha,var(--color-yellow-200))] text-foreground [&_[data-slot=alert-icon]]:text-[var(--color-warning-foreground,var(--color-yellow-600))] dark:bg-[var(--color-warning-soft,var(--color-yellow-950))] dark:border-[var(--color-warning-alpha,var(--color-yellow-900))]"
    },
    /* Mono */
    {
      variant: "mono",
      icon: "primary",
      className: "[&_[data-slot=alert-icon]]:text-primary"
    },
    {
      variant: "mono",
      icon: "warning",
      className: "[&_[data-slot=alert-icon]]:text-[var(--color-warning-foreground,var(--color-yellow-600))]"
    },
    {
      variant: "mono",
      icon: "success",
      className: "[&_[data-slot=alert-icon]]:text-[var(--color-success-foreground,var(--color-green-600))]"
    },
    {
      variant: "mono",
      icon: "destructive",
      className: "[&_[data-slot=alert-icon]]:text-destructive"
    },
    {
      variant: "mono",
      icon: "info",
      className: "[&_[data-slot=alert-icon]]:text-[var(--color-info-foreground,var(--color-violet-600))]"
    }
  ],
  defaultVariants: {
    variant: "secondary",
    appearance: "solid",
    size: "md"
  }
});
function YE({ className: e, variant: t, size: n, icon: r, appearance: a, close: i = !1, onClose: o, children: s, ...l }) {
  return /* @__PURE__ */ u.jsxs(
    "div",
    {
      "data-slot": "alert",
      role: "alert",
      className: y(ny({ variant: t, size: n, icon: r, appearance: a }), e),
      ...l,
      children: [
        s,
        i && /* @__PURE__ */ u.jsx(
          Re,
          {
            size: "sm",
            variant: "inverse",
            mode: "icon",
            onClick: o,
            "aria-label": "Dismiss",
            "data-slot": "alert-close",
            className: y("group shrink-0 size-4"),
            children: /* @__PURE__ */ u.jsx(Os, { className: "opacity-60 group-hover:opacity-100 size-4" })
          }
        )
      ]
    }
  );
}
function qE({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "alert-title", className: y("grow tracking-tight", e), ...t });
}
function ZE({ children: e, className: t, ...n }) {
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "alert-icon", className: y("shrink-0", t), ...n, children: e });
}
function XE({ children: e, className: t, ...n }) {
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "alert-toolbar", className: y(t), ...n, children: e });
}
function JE({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    "div",
    {
      "data-slot": "alert-description",
      className: y("text-sm [&_p]:leading-relaxed [&_p]:mb-2", e),
      ...t
    }
  );
}
function QE({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    "div",
    {
      "data-slot": "alert-content",
      className: y("space-y-2 [&_[data-slot=alert-title]]:font-semibold", e),
      ...t
    }
  );
}
function eS({ ...e }) {
  return /* @__PURE__ */ u.jsx(Tt.Root, { "data-slot": "alert-dialog", ...e });
}
function tS({ ...e }) {
  return /* @__PURE__ */ u.jsx(Tt.Trigger, { "data-slot": "alert-dialog-trigger", ...e });
}
function ry({ ...e }) {
  return /* @__PURE__ */ u.jsx(Tt.Portal, { "data-slot": "alert-dialog-portal", ...e });
}
function ay({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    Tt.Overlay,
    {
      "data-slot": "alert-dialog-overlay",
      className: y(
        "fixed inset-0 z-50 bg-black/30 [backdrop-filter:blur(4px)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        e
      ),
      ...t
    }
  );
}
function nS({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsxs(ry, { children: [
    /* @__PURE__ */ u.jsx(ay, {}),
    /* @__PURE__ */ u.jsx(
      Tt.Content,
      {
        "data-slot": "alert-dialog-content",
        className: y(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg shadow-black/5 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
          e
        ),
        ...t
      }
    )
  ] });
}
const rS = ({ className: e, ...t }) => /* @__PURE__ */ u.jsx(
  "div",
  {
    "data-slot": "alert-dialog-header",
    className: y("flex flex-col space-y-2 text-center sm:text-left", e),
    ...t
  }
), aS = ({ className: e, ...t }) => /* @__PURE__ */ u.jsx(
  "div",
  {
    "data-slot": "alert-dialog-footer",
    className: y("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2.5", e),
    ...t
  }
);
function iS({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    Tt.Title,
    {
      "data-slot": "alert-dialog-title",
      className: y("text-lg font-semibold", e),
      ...t
    }
  );
}
function oS({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ u.jsx(
    Tt.Description,
    {
      "data-slot": "alert-dialog-description",
      className: y("text-sm text-muted-foreground", e),
      ...t
    }
  );
}
function sS({
  className: e,
  variant: t,
  ...n
}) {
  return /* @__PURE__ */ u.jsx(
    Tt.Action,
    {
      "data-slot": "alert-dialog-action",
      className: y(Tr({ variant: t }), e),
      ...n
    }
  );
}
function lS({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    Tt.Cancel,
    {
      "data-slot": "alert-dialog-cancel",
      className: y(Tr({ variant: "outline" }), "mt-2 sm:mt-0", e),
      ...t
    }
  );
}
function uS({ ...e }) {
  return /* @__PURE__ */ u.jsx(kb.Root, { "data-slot": "aspect-ratio", ...e });
}
const iy = re("flex items-center rounded-full size-2 border-2 border-background", {
  variants: {
    variant: {
      online: "bg-green-600",
      offline: "bg-zinc-600 dark:bg-zinc-300",
      busy: "bg-yellow-600",
      away: "bg-blue-600"
    }
  },
  defaultVariants: {
    variant: "online"
  }
});
function cS({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(_s.Root, { "data-slot": "avatar", className: y("relative flex shrink-0 size-10", e), ...t });
}
function dS({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx("div", { className: y("relative overflow-hidden rounded-full", e), children: /* @__PURE__ */ u.jsx(_s.Image, { "data-slot": "avatar-image", className: y("aspect-square h-full w-full"), ...t }) });
}
function fS({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    _s.Fallback,
    {
      "data-slot": "avatar-fallback",
      className: y(
        "flex h-full w-full items-center justify-center rounded-full border border-border bg-accent text-accent-foreground text-xs",
        e
      ),
      ...t
    }
  );
}
function mS({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    "div",
    {
      "data-slot": "avatar-indicator",
      className: y("absolute flex size-6 items-center justify-center", e),
      ...t
    }
  );
}
function hS({
  className: e,
  variant: t,
  ...n
}) {
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "avatar-status", className: y(iy({ variant: t }), e), ...n });
}
const Gs = fe({});
function rn(e) {
  const t = B(null);
  return t.current === null && (t.current = e()), t.current;
}
const oy = typeof window < "u", Ys = oy ? wf : U, wi = /* @__PURE__ */ fe(null);
function qs(e, t) {
  e.indexOf(t) === -1 && e.push(t);
}
function Ln(e, t) {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}
const yt = (e, t, n) => n > t ? t : n < e ? e : n;
function Ko(e, t) {
  return t ? `${e}. For more information and steps for solving, visit https://motion.dev/troubleshooting/${t}` : e;
}
let Gn = () => {
}, at = () => {
};
typeof process < "u" && process.env?.NODE_ENV !== "production" && (Gn = (e, t, n) => {
  !e && typeof console < "u" && console.warn(Ko(t, n));
}, at = (e, t, n) => {
  if (!e)
    throw new Error(Ko(t, n));
});
const Ut = {}, jf = (e) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e);
function Mf(e) {
  return typeof e == "object" && e !== null;
}
const Rf = (e) => /^0[^.\s]+$/u.test(e);
// @__NO_SIDE_EFFECTS__
function If(e) {
  let t;
  return () => (t === void 0 && (t = e()), t);
}
const Je = /* @__NO_SIDE_EFFECTS__ */ (e) => e, sy = (e, t) => (n) => t(e(n)), Gr = (...e) => e.reduce(sy), Fn = /* @__NO_SIDE_EFFECTS__ */ (e, t, n) => {
  const r = t - e;
  return r === 0 ? 1 : (n - e) / r;
};
class Zs {
  constructor() {
    this.subscriptions = [];
  }
  add(t) {
    return qs(this.subscriptions, t), () => Ln(this.subscriptions, t);
  }
  notify(t, n, r) {
    const a = this.subscriptions.length;
    if (a)
      if (a === 1)
        this.subscriptions[0](t, n, r);
      else
        for (let i = 0; i < a; i++) {
          const o = this.subscriptions[i];
          o && o(t, n, r);
        }
  }
  getSize() {
    return this.subscriptions.length;
  }
  clear() {
    this.subscriptions.length = 0;
  }
}
const Be = /* @__NO_SIDE_EFFECTS__ */ (e) => e * 1e3, Xe = /* @__NO_SIDE_EFFECTS__ */ (e) => e / 1e3;
function Vf(e, t) {
  return t ? e * (1e3 / t) : 0;
}
const Ru = /* @__PURE__ */ new Set();
function Xs(e, t, n) {
  e || Ru.has(t) || (console.warn(Ko(t, n)), Ru.add(t));
}
const ly = (e, t, n) => {
  const r = t - e;
  return ((n - e) % r + r) % r + e;
}, Bf = (e, t, n) => (((1 - 3 * n + 3 * t) * e + (3 * n - 6 * t)) * e + 3 * t) * e, uy = 1e-7, cy = 12;
function dy(e, t, n, r, a) {
  let i, o, s = 0;
  do
    o = t + (n - t) / 2, i = Bf(o, r, a) - e, i > 0 ? n = o : t = o;
  while (Math.abs(i) > uy && ++s < cy);
  return o;
}
function Yr(e, t, n, r) {
  if (e === t && n === r)
    return Je;
  const a = (i) => dy(i, 0, 1, e, n);
  return (i) => i === 0 || i === 1 ? i : Bf(a(i), t, r);
}
const Lf = (e) => (t) => t <= 0.5 ? e(2 * t) / 2 : (2 - e(2 * (1 - t))) / 2, Ff = (e) => (t) => 1 - e(1 - t), Of = /* @__PURE__ */ Yr(0.33, 1.53, 0.69, 0.99), Js = /* @__PURE__ */ Ff(Of), zf = /* @__PURE__ */ Lf(Js), _f = (e) => e >= 1 ? 1 : (e *= 2) < 1 ? 0.5 * Js(e) : 0.5 * (2 - Math.pow(2, -10 * (e - 1))), Qs = (e) => 1 - Math.sin(Math.acos(e)), Uf = Ff(Qs), Hf = Lf(Qs), fy = /* @__PURE__ */ Yr(0.42, 0, 1, 1), my = /* @__PURE__ */ Yr(0, 0, 0.58, 1), Kf = /* @__PURE__ */ Yr(0.42, 0, 0.58, 1), Wf = (e) => Array.isArray(e) && typeof e[0] != "number";
function Gf(e, t) {
  return Wf(e) ? e[ly(0, e.length, t)] : e;
}
const Yf = (e) => Array.isArray(e) && typeof e[0] == "number", Iu = {
  linear: Je,
  easeIn: fy,
  easeInOut: Kf,
  easeOut: my,
  circIn: Qs,
  circInOut: Hf,
  circOut: Uf,
  backIn: Js,
  backInOut: zf,
  backOut: Of,
  anticipate: _f
}, hy = (e) => typeof e == "string", Vu = (e) => {
  if (Yf(e)) {
    at(e.length === 4, "Cubic bezier arrays must contain four numerical values.", "cubic-bezier-length");
    const [t, n, r, a] = e;
    return Yr(t, n, r, a);
  } else if (hy(e))
    return at(Iu[e] !== void 0, `Invalid easing type '${e}'`, "invalid-easing-type"), Iu[e];
  return e;
}, pa = [
  "setup",
  // Compute
  "read",
  // Read
  "resolveKeyframes",
  // Write/Read/Write/Read
  "preUpdate",
  // Compute
  "update",
  // Compute
  "preRender",
  // Compute
  "render",
  // Write
  "postRender"
  // Compute
];
function py(e, t) {
  let n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), a = !1, i = !1;
  const o = /* @__PURE__ */ new WeakSet();
  let s = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  };
  function l(d) {
    o.has(d) && (c.schedule(d), e()), d(s);
  }
  const c = {
    /**
     * Schedule a process to run on the next frame.
     */
    schedule: (d, f = !1, m = !1) => {
      const p = m && a ? n : r;
      return f && o.add(d), p.add(d), d;
    },
    /**
     * Cancel the provided callback from running on the next frame.
     */
    cancel: (d) => {
      r.delete(d), o.delete(d);
    },
    /**
     * Execute all schedule callbacks.
     */
    process: (d) => {
      if (s = d, a) {
        i = !0;
        return;
      }
      a = !0;
      const f = n;
      n = r, r = f, n.forEach(l), n.clear(), a = !1, i && (i = !1, c.process(d));
    }
  };
  return c;
}
const gy = 40;
function qf(e, t) {
  let n = !1, r = !0;
  const a = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  }, i = () => n = !0, o = pa.reduce((C, w) => (C[w] = py(i), C), {}), { setup: s, read: l, resolveKeyframes: c, preUpdate: d, update: f, preRender: m, render: h, postRender: p } = o, g = () => {
    const C = Ut.useManualTiming, w = C ? a.timestamp : performance.now();
    n = !1, C || (a.delta = r ? 1e3 / 60 : Math.max(Math.min(w - a.timestamp, gy), 1)), a.timestamp = w, a.isProcessing = !0, s.process(a), l.process(a), c.process(a), d.process(a), f.process(a), m.process(a), h.process(a), p.process(a), a.isProcessing = !1, n && t && (r = !1, e(g));
  }, v = () => {
    n = !0, r = !0, a.isProcessing || e(g);
  };
  return { schedule: pa.reduce((C, w) => {
    const E = o[w];
    return C[w] = (k, A = !1, P = !1) => (n || v(), E.schedule(k, A, P)), C;
  }, {}), cancel: (C) => {
    for (let w = 0; w < pa.length; w++)
      o[pa[w]].cancel(C);
  }, state: a, steps: o };
}
const { schedule: ue, cancel: Et, state: Se, steps: eo } = /* @__PURE__ */ qf(typeof requestAnimationFrame < "u" ? requestAnimationFrame : Je, !0);
let ja;
function vy() {
  ja = void 0;
}
const Ie = {
  now: () => (ja === void 0 && Ie.set(Se.isProcessing || Ut.useManualTiming ? Se.timestamp : performance.now()), ja),
  set: (e) => {
    ja = e, queueMicrotask(vy);
  }
}, Zf = (e) => (t) => typeof t == "string" && t.startsWith(e), Xf = /* @__PURE__ */ Zf("--"), by = /* @__PURE__ */ Zf("var(--"), el = (e) => by(e) ? yy.test(e.split("/*")[0].trim()) : !1, yy = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;
function Bu(e) {
  return typeof e != "string" ? !1 : e.split("/*")[0].includes("var(--");
}
const Yn = {
  test: (e) => typeof e == "number",
  parse: parseFloat,
  transform: (e) => e
}, Pr = {
  ...Yn,
  transform: (e) => yt(0, 1, e)
}, ga = {
  ...Yn,
  default: 1
}, br = (e) => Math.round(e * 1e5) / 1e5, tl = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function xy(e) {
  return e == null;
}
const wy = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, nl = (e, t) => (n) => !!(typeof n == "string" && wy.test(n) && n.startsWith(e) || t && !xy(n) && Object.prototype.hasOwnProperty.call(n, t)), Jf = (e, t, n) => (r) => {
  if (typeof r != "string")
    return r;
  const [a, i, o, s] = r.match(tl);
  return {
    [e]: parseFloat(a),
    [t]: parseFloat(i),
    [n]: parseFloat(o),
    alpha: s !== void 0 ? parseFloat(s) : 1
  };
}, $y = (e) => yt(0, 255, e), to = {
  ...Yn,
  transform: (e) => Math.round($y(e))
}, Jt = {
  test: /* @__PURE__ */ nl("rgb", "red"),
  parse: /* @__PURE__ */ Jf("red", "green", "blue"),
  transform: ({ red: e, green: t, blue: n, alpha: r = 1 }) => "rgba(" + to.transform(e) + ", " + to.transform(t) + ", " + to.transform(n) + ", " + br(Pr.transform(r)) + ")"
};
function Dy(e) {
  let t = "", n = "", r = "", a = "";
  return e.length > 5 ? (t = e.substring(1, 3), n = e.substring(3, 5), r = e.substring(5, 7), a = e.substring(7, 9)) : (t = e.substring(1, 2), n = e.substring(2, 3), r = e.substring(3, 4), a = e.substring(4, 5), t += t, n += n, r += r, a += a), {
    red: parseInt(t, 16),
    green: parseInt(n, 16),
    blue: parseInt(r, 16),
    alpha: a ? parseInt(a, 16) / 255 : 1
  };
}
const Wo = {
  test: /* @__PURE__ */ nl("#"),
  parse: Dy,
  transform: Jt.transform
}, qr = /* @__NO_SIDE_EFFECTS__ */ (e) => ({
  test: (t) => typeof t == "string" && t.endsWith(e) && t.split(" ").length === 1,
  parse: parseFloat,
  transform: (t) => `${t}${e}`
}), Bt = /* @__PURE__ */ qr("deg"), vt = /* @__PURE__ */ qr("%"), z = /* @__PURE__ */ qr("px"), Cy = /* @__PURE__ */ qr("vh"), Ey = /* @__PURE__ */ qr("vw"), Lu = {
  ...vt,
  parse: (e) => vt.parse(e) / 100,
  transform: (e) => vt.transform(e * 100)
}, Sn = {
  test: /* @__PURE__ */ nl("hsl", "hue"),
  parse: /* @__PURE__ */ Jf("hue", "saturation", "lightness"),
  transform: ({ hue: e, saturation: t, lightness: n, alpha: r = 1 }) => "hsla(" + Math.round(e) + ", " + vt.transform(br(t)) + ", " + vt.transform(br(n)) + ", " + br(Pr.transform(r)) + ")"
}, be = {
  test: (e) => Jt.test(e) || Wo.test(e) || Sn.test(e),
  parse: (e) => Jt.test(e) ? Jt.parse(e) : Sn.test(e) ? Sn.parse(e) : Wo.parse(e),
  transform: (e) => typeof e == "string" ? e : e.hasOwnProperty("red") ? Jt.transform(e) : Sn.transform(e),
  getAnimatableNone: (e) => {
    const t = be.parse(e);
    return t.alpha = 0, be.transform(t);
  }
}, Sy = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function Ty(e) {
  return isNaN(e) && typeof e == "string" && (e.match(tl)?.length || 0) + (e.match(Sy)?.length || 0) > 0;
}
const Qf = "number", em = "color", Py = "var", ky = "var(", Fu = "${}", Ny = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function On(e) {
  const t = e.toString(), n = [], r = {
    color: [],
    number: [],
    var: []
  }, a = [];
  let i = 0;
  const s = t.replace(Ny, (l) => (be.test(l) ? (r.color.push(i), a.push(em), n.push(be.parse(l))) : l.startsWith(ky) ? (r.var.push(i), a.push(Py), n.push(l)) : (r.number.push(i), a.push(Qf), n.push(parseFloat(l))), ++i, Fu)).split(Fu);
  return { values: n, split: s, indexes: r, types: a };
}
function Ay(e) {
  return On(e).values;
}
function tm({ split: e, types: t }) {
  const n = e.length;
  return (r) => {
    let a = "";
    for (let i = 0; i < n; i++)
      if (a += e[i], r[i] !== void 0) {
        const o = t[i];
        o === Qf ? a += br(r[i]) : o === em ? a += be.transform(r[i]) : a += r[i];
      }
    return a;
  };
}
function jy(e) {
  return tm(On(e));
}
const My = (e) => typeof e == "number" ? 0 : be.test(e) ? be.getAnimatableNone(e) : e, Ry = (e, t) => typeof e == "number" ? t?.trim().endsWith("/") ? e : 0 : My(e);
function Iy(e) {
  const t = On(e);
  return tm(t)(t.values.map((r, a) => Ry(r, t.split[a])));
}
const rt = {
  test: Ty,
  parse: Ay,
  createTransformer: jy,
  getAnimatableNone: Iy
};
function no(e, t, n) {
  return n < 0 && (n += 1), n > 1 && (n -= 1), n < 1 / 6 ? e + (t - e) * 6 * n : n < 1 / 2 ? t : n < 2 / 3 ? e + (t - e) * (2 / 3 - n) * 6 : e;
}
function Vy({ hue: e, saturation: t, lightness: n, alpha: r }) {
  e /= 360, t /= 100, n /= 100;
  let a = 0, i = 0, o = 0;
  if (!t)
    a = i = o = n;
  else {
    const s = n < 0.5 ? n * (1 + t) : n + t - n * t, l = 2 * n - s;
    a = no(l, s, e + 1 / 3), i = no(l, s, e), o = no(l, s, e - 1 / 3);
  }
  return {
    red: Math.round(a * 255),
    green: Math.round(i * 255),
    blue: Math.round(o * 255),
    alpha: r
  };
}
function Ya(e, t) {
  return (n) => n > 0 ? t : e;
}
const ce = (e, t, n) => e + (t - e) * n, ro = (e, t, n) => {
  const r = e * e, a = n * (t * t - r) + r;
  return a < 0 ? 0 : Math.sqrt(a);
}, By = [Wo, Jt, Sn], Ly = (e) => By.find((t) => t.test(e));
function Ou(e) {
  const t = Ly(e);
  if (Gn(!!t, `'${e}' is not an animatable color. Use the equivalent color code instead.`, "color-not-animatable"), !t)
    return !1;
  let n = t.parse(e);
  return t === Sn && (n = Vy(n)), n;
}
const zu = (e, t) => {
  const n = Ou(e), r = Ou(t);
  if (!n || !r)
    return Ya(e, t);
  const a = { ...n };
  return (i) => (a.red = ro(n.red, r.red, i), a.green = ro(n.green, r.green, i), a.blue = ro(n.blue, r.blue, i), a.alpha = ce(n.alpha, r.alpha, i), Jt.transform(a));
}, Go = /* @__PURE__ */ new Set(["none", "hidden"]);
function Fy(e, t) {
  return Go.has(e) ? (n) => n <= 0 ? e : t : (n) => n >= 1 ? t : e;
}
function Oy(e, t) {
  return (n) => ce(e, t, n);
}
function rl(e) {
  return typeof e == "number" ? Oy : typeof e == "string" ? el(e) ? Ya : be.test(e) ? zu : Uy : Array.isArray(e) ? nm : typeof e == "object" ? be.test(e) ? zu : zy : Ya;
}
function nm(e, t) {
  const n = [...e], r = n.length, a = e.map((i, o) => rl(i)(i, t[o]));
  return (i) => {
    for (let o = 0; o < r; o++)
      n[o] = a[o](i);
    return n;
  };
}
function zy(e, t) {
  const n = { ...e, ...t }, r = {};
  for (const a in n)
    e[a] !== void 0 && t[a] !== void 0 && (r[a] = rl(e[a])(e[a], t[a]));
  return (a) => {
    for (const i in r)
      n[i] = r[i](a);
    return n;
  };
}
function _y(e, t) {
  const n = [], r = { color: 0, var: 0, number: 0 };
  for (let a = 0; a < t.values.length; a++) {
    const i = t.types[a], o = e.indexes[i][r[i]], s = e.values[o] ?? 0;
    n[a] = s, r[i]++;
  }
  return n;
}
const Uy = (e, t) => {
  const n = rt.createTransformer(t), r = On(e), a = On(t);
  return r.indexes.var.length === a.indexes.var.length && r.indexes.color.length === a.indexes.color.length && r.indexes.number.length >= a.indexes.number.length ? Go.has(e) && !a.values.length || Go.has(t) && !r.values.length ? Fy(e, t) : Gr(nm(_y(r, a), a.values), n) : (Gn(!0, `Complex values '${e}' and '${t}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`, "complex-values-different"), Ya(e, t));
};
function rm(e, t, n) {
  return typeof e == "number" && typeof t == "number" && typeof n == "number" ? ce(e, t, n) : rl(e)(e, t);
}
const Hy = (e) => {
  const t = ({ timestamp: n }) => e(n);
  return {
    start: (n = !0) => ue.update(t, n),
    stop: () => Et(t),
    /**
     * If we're processing this frame we can use the
     * framelocked timestamp to keep things in sync.
     */
    now: () => Se.isProcessing ? Se.timestamp : Ie.now()
  };
}, am = (e, t, n = 10) => {
  let r = "";
  const a = Math.max(Math.round(t / n), 2);
  for (let i = 0; i < a; i++)
    r += Math.round(e(i / (a - 1)) * 1e4) / 1e4 + ", ";
  return `linear(${r.substring(0, r.length - 2)})`;
}, qa = 2e4;
function al(e) {
  let t = 0;
  const n = 50;
  let r = e.next(t);
  for (; !r.done && t < qa; )
    t += n, r = e.next(t);
  return t >= qa ? 1 / 0 : t;
}
function im(e, t = 100, n) {
  const r = n({ ...e, keyframes: [0, t] }), a = Math.min(al(r), qa);
  return {
    type: "keyframes",
    ease: (i) => r.next(a * i).value / t,
    duration: /* @__PURE__ */ Xe(a)
  };
}
const he = {
  // Default spring physics
  stiffness: 100,
  damping: 10,
  mass: 1,
  velocity: 0,
  // Default duration/bounce-based options
  duration: 800,
  // in ms
  bounce: 0.3,
  visualDuration: 0.3,
  // in seconds
  // Rest thresholds
  restSpeed: {
    granular: 0.01,
    default: 2
  },
  restDelta: {
    granular: 5e-3,
    default: 0.5
  },
  // Limits
  minDuration: 0.01,
  // in seconds
  maxDuration: 10,
  // in seconds
  minDamping: 0.05,
  maxDamping: 1
};
function Yo(e, t) {
  return e * Math.sqrt(1 - t * t);
}
const Ky = 12;
function Wy(e, t, n) {
  let r = n;
  for (let a = 1; a < Ky; a++)
    r = r - e(r) / t(r);
  return r;
}
const ao = 1e-3;
function Gy({ duration: e = he.duration, bounce: t = he.bounce, velocity: n = he.velocity, mass: r = he.mass }) {
  let a, i;
  Gn(e <= /* @__PURE__ */ Be(he.maxDuration), "Spring duration must be 10 seconds or less", "spring-duration-limit");
  let o = 1 - t;
  o = yt(he.minDamping, he.maxDamping, o), e = yt(he.minDuration, he.maxDuration, /* @__PURE__ */ Xe(e)), o < 1 ? (a = (c) => {
    const d = c * o, f = d * e, m = d - n, h = Yo(c, o), p = Math.exp(-f);
    return ao - m / h * p;
  }, i = (c) => {
    const f = c * o * e, m = f * n + n, h = Math.pow(o, 2) * Math.pow(c, 2) * e, p = Math.exp(-f), g = Yo(Math.pow(c, 2), o);
    return (-a(c) + ao > 0 ? -1 : 1) * ((m - h) * p) / g;
  }) : (a = (c) => {
    const d = Math.exp(-c * e), f = (c - n) * e + 1;
    return -ao + d * f;
  }, i = (c) => {
    const d = Math.exp(-c * e), f = (n - c) * (e * e);
    return d * f;
  });
  const s = 5 / e, l = Wy(a, i, s);
  if (e = /* @__PURE__ */ Be(e), isNaN(l))
    return {
      stiffness: he.stiffness,
      damping: he.damping,
      duration: e
    };
  {
    const c = Math.pow(l, 2) * r;
    return {
      stiffness: c,
      damping: o * 2 * Math.sqrt(r * c),
      duration: e
    };
  }
}
const Yy = ["duration", "bounce"], qy = ["stiffness", "damping", "mass"];
function _u(e, t) {
  return t.some((n) => e[n] !== void 0);
}
function Zy(e) {
  let t = {
    velocity: he.velocity,
    stiffness: he.stiffness,
    damping: he.damping,
    mass: he.mass,
    isResolvedFromDuration: !1,
    ...e
  };
  if (!_u(e, qy) && _u(e, Yy))
    if (t.velocity = 0, e.visualDuration) {
      const n = e.visualDuration, r = 2 * Math.PI / (n * 1.2), a = r * r, i = 2 * yt(0.05, 1, 1 - (e.bounce || 0)) * Math.sqrt(a);
      t = {
        ...t,
        mass: he.mass,
        stiffness: a,
        damping: i
      };
    } else {
      const n = Gy({ ...e, velocity: 0 });
      t = {
        ...t,
        ...n,
        mass: he.mass
      }, t.isResolvedFromDuration = !0;
    }
  return t;
}
function kr(e = he.visualDuration, t = he.bounce) {
  const n = typeof e != "object" ? {
    visualDuration: e,
    keyframes: [0, 1],
    bounce: t
  } : e;
  let { restSpeed: r, restDelta: a } = n;
  const i = n.keyframes[0], o = n.keyframes[n.keyframes.length - 1], s = { done: !1, value: i }, { stiffness: l, damping: c, mass: d, duration: f, velocity: m, isResolvedFromDuration: h } = Zy({
    ...n,
    velocity: -/* @__PURE__ */ Xe(n.velocity || 0)
  }), p = m || 0, g = c / (2 * Math.sqrt(l * d)), v = o - i, b = /* @__PURE__ */ Xe(Math.sqrt(l / d)), x = Math.abs(v) < 5;
  r || (r = x ? he.restSpeed.granular : he.restSpeed.default), a || (a = x ? he.restDelta.granular : he.restDelta.default);
  let C, w, E, k, A, P;
  if (g < 1)
    E = Yo(b, g), k = (p + g * b * v) / E, C = (T) => {
      const M = Math.exp(-g * b * T);
      return o - M * (k * Math.sin(E * T) + v * Math.cos(E * T));
    }, A = g * b * k + v * E, P = g * b * v - k * E, w = (T) => Math.exp(-g * b * T) * (A * Math.sin(E * T) + P * Math.cos(E * T));
  else if (g === 1) {
    C = (M) => o - Math.exp(-b * M) * (v + (p + b * v) * M);
    const T = p + b * v;
    w = (M) => Math.exp(-b * M) * (b * T * M - p);
  } else {
    const T = b * Math.sqrt(g * g - 1);
    C = (Z) => {
      const Q = Math.exp(-g * b * Z), J = Math.min(T * Z, 300);
      return o - Q * ((p + g * b * v) * Math.sinh(J) + T * v * Math.cosh(J)) / T;
    };
    const M = (p + g * b * v) / T, L = g * b * M - v * T, O = g * b * v - M * T;
    w = (Z) => {
      const Q = Math.exp(-g * b * Z), J = Math.min(T * Z, 300);
      return Q * (L * Math.sinh(J) + O * Math.cosh(J));
    };
  }
  const j = {
    calculatedDuration: h && f || null,
    velocity: (T) => /* @__PURE__ */ Be(w(T)),
    next: (T) => {
      if (!h && g < 1) {
        const L = Math.exp(-g * b * T), O = Math.sin(E * T), Z = Math.cos(E * T), Q = o - L * (k * O + v * Z), J = /* @__PURE__ */ Be(L * (A * O + P * Z));
        return s.done = Math.abs(J) <= r && Math.abs(o - Q) <= a, s.value = s.done ? o : Q, s;
      }
      const M = C(T);
      if (h)
        s.done = T >= f;
      else {
        const L = /* @__PURE__ */ Be(w(T));
        s.done = Math.abs(L) <= r && Math.abs(o - M) <= a;
      }
      return s.value = s.done ? o : M, s;
    },
    toString: () => {
      const T = Math.min(al(j), qa), M = am((L) => j.next(T * L).value, T, 30);
      return T + "ms " + M;
    },
    toTransition: () => {
    }
  };
  return j;
}
kr.applyToOptions = (e) => {
  const t = im(e, 100, kr);
  return e.ease = t.ease, e.duration = /* @__PURE__ */ Be(t.duration), e.type = "keyframes", e;
};
const Xy = 5;
function om(e, t, n) {
  const r = Math.max(t - Xy, 0);
  return Vf(n - e(r), t - r);
}
function qo({ keyframes: e, velocity: t = 0, power: n = 0.8, timeConstant: r = 325, bounceDamping: a = 10, bounceStiffness: i = 500, modifyTarget: o, min: s, max: l, restDelta: c = 0.5, restSpeed: d }) {
  const f = e[0], m = {
    done: !1,
    value: f
  }, h = (P) => s !== void 0 && P < s || l !== void 0 && P > l, p = (P) => s === void 0 ? l : l === void 0 || Math.abs(s - P) < Math.abs(l - P) ? s : l;
  let g = n * t;
  const v = f + g, b = o === void 0 ? v : o(v);
  b !== v && (g = b - f);
  const x = (P) => -g * Math.exp(-P / r), C = (P) => b + x(P), w = (P) => {
    const j = x(P), T = C(P);
    m.done = Math.abs(j) <= c, m.value = m.done ? b : T;
  };
  let E, k;
  const A = (P) => {
    h(m.value) && (E = P, k = kr({
      keyframes: [m.value, p(m.value)],
      velocity: om(C, P, m.value),
      // TODO: This should be passing * 1000
      damping: a,
      stiffness: i,
      restDelta: c,
      restSpeed: d
    }));
  };
  return A(0), {
    calculatedDuration: null,
    next: (P) => {
      let j = !1;
      return !k && E === void 0 && (j = !0, w(P), A(P)), E !== void 0 && P >= E ? k.next(P - E) : (!j && w(P), m);
    }
  };
}
function Jy(e, t, n) {
  const r = [], a = n || Ut.mix || rm, i = e.length - 1;
  for (let o = 0; o < i; o++) {
    let s = a(e[o], e[o + 1]);
    if (t) {
      const l = Array.isArray(t) ? t[o] || Je : t;
      s = Gr(l, s);
    }
    r.push(s);
  }
  return r;
}
function sm(e, t, { clamp: n = !0, ease: r, mixer: a } = {}) {
  const i = e.length;
  if (at(i === t.length, "Both input and output ranges must be the same length", "range-length"), i === 1)
    return () => t[0];
  if (i === 2 && t[0] === t[1])
    return () => t[1];
  const o = e[0] === e[1];
  e[0] > e[i - 1] && (e = [...e].reverse(), t = [...t].reverse());
  const s = Jy(t, r, a), l = s.length, c = (d) => {
    if (o && d < e[0])
      return t[0];
    let f = 0;
    if (l > 1)
      for (; f < e.length - 2 && !(d < e[f + 1]); f++)
        ;
    const m = /* @__PURE__ */ Fn(e[f], e[f + 1], d);
    return s[f](m);
  };
  return n ? (d) => c(yt(e[0], e[i - 1], d)) : c;
}
function lm(e, t) {
  const n = e[e.length - 1];
  for (let r = 1; r <= t; r++) {
    const a = /* @__PURE__ */ Fn(0, t, r);
    e.push(ce(n, 1, a));
  }
}
function um(e) {
  const t = [0];
  return lm(t, e.length - 1), t;
}
function Qy(e, t) {
  return e.map((n) => n * t);
}
function ex(e, t) {
  return e.map(() => t || Kf).splice(0, e.length - 1);
}
function Tn({ duration: e = 300, keyframes: t, times: n, ease: r = "easeInOut" }) {
  const a = Wf(r) ? r.map(Vu) : Vu(r), i = {
    done: !1,
    value: t[0]
  }, o = Qy(
    // Only use the provided offsets if they're the correct length
    // TODO Maybe we should warn here if there's a length mismatch
    n && n.length === t.length ? n : um(t),
    e
  ), s = sm(o, t, {
    ease: Array.isArray(a) ? a : ex(t, a)
  });
  return {
    calculatedDuration: e,
    next: (l) => (i.value = s(l), i.done = l >= e, i)
  };
}
const tx = (e) => e !== null;
function $i(e, { repeat: t, repeatType: n = "loop" }, r, a = 1) {
  const i = e.filter(tx), s = a < 0 || t && n !== "loop" && t % 2 === 1 ? 0 : i.length - 1;
  return !s || r === void 0 ? i[s] : r;
}
const nx = {
  decay: qo,
  inertia: qo,
  tween: Tn,
  keyframes: Tn,
  spring: kr
};
function cm(e) {
  typeof e.type == "string" && (e.type = nx[e.type]);
}
class il {
  constructor() {
    this.updateFinished();
  }
  get finished() {
    return this._finished;
  }
  updateFinished() {
    this._finished = new Promise((t) => {
      this.resolve = t;
    });
  }
  notifyFinished() {
    this.resolve();
  }
  /**
   * Allows the animation to be awaited.
   *
   * @deprecated Use `finished` instead.
   */
  then(t, n) {
    return this.finished.then(t, n);
  }
}
const rx = (e) => e / 100;
class Nr extends il {
  constructor(t) {
    super(), this.state = "idle", this.startTime = null, this.isStopped = !1, this.currentTime = 0, this.holdTime = null, this.playbackSpeed = 1, this.delayState = {
      done: !1,
      value: void 0
    }, this.stop = () => {
      const { motionValue: n } = this.options;
      n && n.updatedAt !== Ie.now() && this.tick(Ie.now()), this.isStopped = !0, this.state !== "idle" && (this.teardown(), this.options.onStop?.());
    }, this.options = t, this.initAnimation(), this.play(), t.autoplay === !1 && this.pause();
  }
  initAnimation() {
    const { options: t } = this;
    cm(t);
    const { type: n = Tn, repeat: r = 0, repeatDelay: a = 0, repeatType: i, velocity: o = 0 } = t;
    let { keyframes: s } = t;
    const l = n || Tn;
    process.env.NODE_ENV !== "production" && l !== Tn && at(s.length <= 2, `Only two keyframes currently supported with spring and inertia animations. Trying to animate ${s}`, "spring-two-frames"), l !== Tn && typeof s[0] != "number" && (this.mixKeyframes = Gr(rx, rm(s[0], s[1])), s = [0, 100]);
    const c = l({ ...t, keyframes: s });
    i === "mirror" && (this.mirroredGenerator = l({
      ...t,
      keyframes: [...s].reverse(),
      velocity: -o
    })), c.calculatedDuration === null && (c.calculatedDuration = al(c));
    const { calculatedDuration: d } = c;
    this.calculatedDuration = d, this.resolvedDuration = d + a, this.totalDuration = this.resolvedDuration * (r + 1) - a, this.generator = c;
  }
  updateTime(t) {
    const n = Math.round(t - this.startTime) * this.playbackSpeed;
    this.holdTime !== null ? this.currentTime = this.holdTime : this.currentTime = n;
  }
  tick(t, n = !1) {
    const { generator: r, totalDuration: a, mixKeyframes: i, mirroredGenerator: o, resolvedDuration: s, calculatedDuration: l } = this;
    if (this.startTime === null)
      return r.next(0);
    const { delay: c = 0, keyframes: d, repeat: f, repeatType: m, repeatDelay: h, type: p, onUpdate: g, finalKeyframe: v } = this.options;
    this.speed > 0 ? this.startTime = Math.min(this.startTime, t) : this.speed < 0 && (this.startTime = Math.min(t - a / this.speed, this.startTime)), n ? this.currentTime = t : this.updateTime(t);
    const b = this.currentTime - c * (this.playbackSpeed >= 0 ? 1 : -1), x = this.playbackSpeed >= 0 ? b < 0 : b > a;
    this.currentTime = Math.max(b, 0), this.state === "finished" && this.holdTime === null && (this.currentTime = a);
    let C = this.currentTime, w = r;
    if (f) {
      const P = Math.min(this.currentTime, a) / s;
      let j = Math.floor(P), T = P % 1;
      !T && P >= 1 && (T = 1), T === 1 && j--, j = Math.min(j, f + 1), !!(j % 2) && (m === "reverse" ? (T = 1 - T, h && (T -= h / s)) : m === "mirror" && (w = o)), C = yt(0, 1, T) * s;
    }
    let E;
    x ? (this.delayState.value = d[0], E = this.delayState) : E = w.next(C), i && !x && (E.value = i(E.value));
    let { done: k } = E;
    !x && l !== null && (k = this.playbackSpeed >= 0 ? this.currentTime >= a : this.currentTime <= 0);
    const A = this.holdTime === null && (this.state === "finished" || this.state === "running" && k);
    return A && p !== qo && (E.value = $i(d, this.options, v, this.speed)), g && g(E.value), A && this.finish(), E;
  }
  /**
   * Allows the returned animation to be awaited or promise-chained. Currently
   * resolves when the animation finishes at all but in a future update could/should
   * reject if its cancels.
   */
  then(t, n) {
    return this.finished.then(t, n);
  }
  get duration() {
    return /* @__PURE__ */ Xe(this.calculatedDuration);
  }
  get iterationDuration() {
    const { delay: t = 0 } = this.options || {};
    return this.duration + /* @__PURE__ */ Xe(t);
  }
  get time() {
    return /* @__PURE__ */ Xe(this.currentTime);
  }
  set time(t) {
    t = /* @__PURE__ */ Be(t), this.currentTime = t, this.startTime === null || this.holdTime !== null || this.playbackSpeed === 0 ? this.holdTime = t : this.driver && (this.startTime = this.driver.now() - t / this.playbackSpeed), this.driver ? this.driver.start(!1) : (this.startTime = 0, this.state = "paused", this.holdTime = t, this.tick(t));
  }
  /**
   * Returns the generator's velocity at the current time in units/second.
   * Uses the analytical derivative when available (springs), avoiding
   * the MotionValue's frame-dependent velocity estimation.
   */
  getGeneratorVelocity() {
    const t = this.currentTime;
    if (t <= 0)
      return this.options.velocity || 0;
    if (this.generator.velocity)
      return this.generator.velocity(t);
    const n = this.generator.next(t).value;
    return om((r) => this.generator.next(r).value, t, n);
  }
  get speed() {
    return this.playbackSpeed;
  }
  set speed(t) {
    const n = this.playbackSpeed !== t;
    n && this.driver && this.updateTime(Ie.now()), this.playbackSpeed = t, n && this.driver && (this.time = /* @__PURE__ */ Xe(this.currentTime));
  }
  play() {
    if (this.isStopped)
      return;
    const { driver: t = Hy, startTime: n } = this.options;
    this.driver || (this.driver = t((a) => this.tick(a))), this.options.onPlay?.();
    const r = this.driver.now();
    this.state === "finished" ? (this.updateFinished(), this.startTime = r) : this.holdTime !== null ? this.startTime = r - this.holdTime : this.startTime || (this.startTime = n ?? r), this.state === "finished" && this.speed < 0 && (this.startTime += this.calculatedDuration), this.holdTime = null, this.state = "running", this.driver.start();
  }
  pause() {
    this.state = "paused", this.updateTime(Ie.now()), this.holdTime = this.currentTime;
  }
  complete() {
    this.state !== "running" && this.play(), this.state = "finished", this.holdTime = null;
  }
  finish() {
    this.notifyFinished(), this.teardown(), this.state = "finished", this.options.onComplete?.();
  }
  cancel() {
    this.holdTime = null, this.startTime = 0, this.tick(0), this.teardown(), this.options.onCancel?.();
  }
  teardown() {
    this.state = "idle", this.stopDriver(), this.startTime = this.holdTime = null;
  }
  stopDriver() {
    this.driver && (this.driver.stop(), this.driver = void 0);
  }
  sample(t) {
    return this.startTime = 0, this.tick(t, !0);
  }
  attachTimeline(t) {
    return this.options.allowFlatten && (this.options.type = "keyframes", this.options.ease = "linear", this.initAnimation()), this.driver?.stop(), t.observe(this);
  }
}
function ax(e) {
  for (let t = 1; t < e.length; t++)
    e[t] ?? (e[t] = e[t - 1]);
}
const Qt = (e) => e * 180 / Math.PI, Zo = (e) => {
  const t = Qt(Math.atan2(e[1], e[0]));
  return Xo(t);
}, ix = {
  x: 4,
  y: 5,
  translateX: 4,
  translateY: 5,
  scaleX: 0,
  scaleY: 3,
  scale: (e) => (Math.abs(e[0]) + Math.abs(e[3])) / 2,
  rotate: Zo,
  rotateZ: Zo,
  skewX: (e) => Qt(Math.atan(e[1])),
  skewY: (e) => Qt(Math.atan(e[2])),
  skew: (e) => (Math.abs(e[1]) + Math.abs(e[2])) / 2
}, Xo = (e) => (e = e % 360, e < 0 && (e += 360), e), Uu = Zo, Hu = (e) => Math.sqrt(e[0] * e[0] + e[1] * e[1]), Ku = (e) => Math.sqrt(e[4] * e[4] + e[5] * e[5]), ox = {
  x: 12,
  y: 13,
  z: 14,
  translateX: 12,
  translateY: 13,
  translateZ: 14,
  scaleX: Hu,
  scaleY: Ku,
  scale: (e) => (Hu(e) + Ku(e)) / 2,
  rotateX: (e) => Xo(Qt(Math.atan2(e[6], e[5]))),
  rotateY: (e) => Xo(Qt(Math.atan2(-e[2], e[0]))),
  rotateZ: Uu,
  rotate: Uu,
  skewX: (e) => Qt(Math.atan(e[4])),
  skewY: (e) => Qt(Math.atan(e[1])),
  skew: (e) => (Math.abs(e[1]) + Math.abs(e[4])) / 2
};
function Jo(e) {
  return e.includes("scale") ? 1 : 0;
}
function Qo(e, t) {
  if (!e || e === "none")
    return Jo(t);
  const n = e.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);
  let r, a;
  if (n)
    r = ox, a = n;
  else {
    const s = e.match(/^matrix\(([-\d.e\s,]+)\)$/u);
    r = ix, a = s;
  }
  if (!a)
    return Jo(t);
  const i = r[t], o = a[1].split(",").map(lx);
  return typeof i == "function" ? i(o) : o[i];
}
const sx = (e, t) => {
  const { transform: n = "none" } = getComputedStyle(e);
  return Qo(n, t);
};
function lx(e) {
  return parseFloat(e.trim());
}
const qn = [
  "transformPerspective",
  "x",
  "y",
  "z",
  "translateX",
  "translateY",
  "translateZ",
  "scale",
  "scaleX",
  "scaleY",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "skew",
  "skewX",
  "skewY"
], Zn = new Set(qn), Wu = (e) => e === Yn || e === z, ux = /* @__PURE__ */ new Set(["x", "y", "z"]), cx = qn.filter((e) => !ux.has(e));
function dx(e) {
  const t = [];
  return cx.forEach((n) => {
    const r = e.getValue(n);
    r !== void 0 && (t.push([n, r.get()]), r.set(n.startsWith("scale") ? 1 : 0));
  }), t;
}
const zt = {
  // Dimensions
  width: ({ x: e }, { paddingLeft: t = "0", paddingRight: n = "0", boxSizing: r }) => {
    const a = e.max - e.min;
    return r === "border-box" ? a : a - parseFloat(t) - parseFloat(n);
  },
  height: ({ y: e }, { paddingTop: t = "0", paddingBottom: n = "0", boxSizing: r }) => {
    const a = e.max - e.min;
    return r === "border-box" ? a : a - parseFloat(t) - parseFloat(n);
  },
  top: (e, { top: t }) => parseFloat(t),
  left: (e, { left: t }) => parseFloat(t),
  bottom: ({ y: e }, { top: t }) => parseFloat(t) + (e.max - e.min),
  right: ({ x: e }, { left: t }) => parseFloat(t) + (e.max - e.min),
  // Transform
  x: (e, { transform: t }) => Qo(t, "x"),
  y: (e, { transform: t }) => Qo(t, "y")
};
zt.translateX = zt.x;
zt.translateY = zt.y;
const tn = /* @__PURE__ */ new Set();
let es = !1, ts = !1, ns = !1;
function dm() {
  if (ts) {
    const e = Array.from(tn).filter((r) => r.needsMeasurement), t = new Set(e.map((r) => r.element)), n = /* @__PURE__ */ new Map();
    t.forEach((r) => {
      const a = dx(r);
      a.length && (n.set(r, a), r.render());
    }), e.forEach((r) => r.measureInitialState()), t.forEach((r) => {
      r.render();
      const a = n.get(r);
      a && a.forEach(([i, o]) => {
        r.getValue(i)?.set(o);
      });
    }), e.forEach((r) => r.measureEndState()), e.forEach((r) => {
      r.suspendedScrollY !== void 0 && window.scrollTo(0, r.suspendedScrollY);
    });
  }
  ts = !1, es = !1, tn.forEach((e) => e.complete(ns)), tn.clear();
}
function fm() {
  tn.forEach((e) => {
    e.readKeyframes(), e.needsMeasurement && (ts = !0);
  });
}
function fx() {
  ns = !0, fm(), dm(), ns = !1;
}
class ol {
  constructor(t, n, r, a, i, o = !1) {
    this.state = "pending", this.isAsync = !1, this.needsMeasurement = !1, this.unresolvedKeyframes = [...t], this.onComplete = n, this.name = r, this.motionValue = a, this.element = i, this.isAsync = o;
  }
  scheduleResolve() {
    this.state = "scheduled", this.isAsync ? (tn.add(this), es || (es = !0, ue.read(fm), ue.resolveKeyframes(dm))) : (this.readKeyframes(), this.complete());
  }
  readKeyframes() {
    const { unresolvedKeyframes: t, name: n, element: r, motionValue: a } = this;
    if (t[0] === null) {
      const i = a?.get(), o = t[t.length - 1];
      if (i !== void 0)
        t[0] = i;
      else if (r && n) {
        const s = r.readValue(n, o);
        s != null && (t[0] = s);
      }
      t[0] === void 0 && (t[0] = o), a && i === void 0 && a.set(t[0]);
    }
    ax(t);
  }
  setFinalKeyframe() {
  }
  measureInitialState() {
  }
  renderEndStyles() {
  }
  measureEndState() {
  }
  complete(t = !1) {
    this.state = "complete", this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, t), tn.delete(this);
  }
  cancel() {
    this.state === "scheduled" && (tn.delete(this), this.state = "pending");
  }
  resume() {
    this.state === "pending" && this.scheduleResolve();
  }
}
const mx = (e) => e.startsWith("--");
function mm(e, t, n) {
  mx(t) ? e.style.setProperty(t, n) : e.style[t] = n;
}
const hx = {};
function hm(e, t) {
  const n = /* @__PURE__ */ If(e);
  return () => hx[t] ?? n();
}
const px = /* @__PURE__ */ hm(() => window.ScrollTimeline !== void 0, "scrollTimeline"), pm = /* @__PURE__ */ hm(() => {
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
  } catch {
    return !1;
  }
  return !0;
}, "linearEasing"), mr = ([e, t, n, r]) => `cubic-bezier(${e}, ${t}, ${n}, ${r})`, Gu = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  circIn: /* @__PURE__ */ mr([0, 0.65, 0.55, 1]),
  circOut: /* @__PURE__ */ mr([0.55, 0, 1, 0.45]),
  backIn: /* @__PURE__ */ mr([0.31, 0.01, 0.66, -0.59]),
  backOut: /* @__PURE__ */ mr([0.33, 1.53, 0.69, 0.99])
};
function gm(e, t) {
  if (e)
    return typeof e == "function" ? pm() ? am(e, t) : "ease-out" : Yf(e) ? mr(e) : Array.isArray(e) ? e.map((n) => gm(n, t) || Gu.easeOut) : Gu[e];
}
function gx(e, t, n, { delay: r = 0, duration: a = 300, repeat: i = 0, repeatType: o = "loop", ease: s = "easeOut", times: l } = {}, c = void 0) {
  const d = {
    [t]: n
  };
  l && (d.offset = l);
  const f = gm(s, a);
  Array.isArray(f) && (d.easing = f);
  const m = {
    delay: r,
    duration: a,
    easing: Array.isArray(f) ? "linear" : f,
    fill: "both",
    iterations: i + 1,
    direction: o === "reverse" ? "alternate" : "normal"
  };
  return c && (m.pseudoElement = c), e.animate(d, m);
}
function sl(e) {
  return typeof e == "function" && "applyToOptions" in e;
}
function vx({ type: e, ...t }) {
  return sl(e) && pm() ? e.applyToOptions(t) : (t.duration ?? (t.duration = 300), t.ease ?? (t.ease = "easeOut"), t);
}
class vm extends il {
  constructor(t) {
    if (super(), this.finishedTime = null, this.isStopped = !1, this.manualStartTime = null, !t)
      return;
    const { element: n, name: r, keyframes: a, pseudoElement: i, allowFlatten: o = !1, finalKeyframe: s, onComplete: l } = t;
    this.isPseudoElement = !!i, this.allowFlatten = o, this.options = t, at(typeof t.type != "string", `Mini animate() doesn't support "type" as a string.`, "mini-spring");
    const c = vx(t);
    this.animation = gx(n, r, a, c, i), c.autoplay === !1 && this.animation.pause(), this.animation.onfinish = () => {
      if (this.finishedTime = this.time, !i) {
        const d = $i(a, this.options, s, this.speed);
        this.updateMotionValue && this.updateMotionValue(d), mm(n, r, d), this.animation.cancel();
      }
      l?.(), this.notifyFinished();
    };
  }
  play() {
    this.isStopped || (this.manualStartTime = null, this.animation.play(), this.state === "finished" && this.updateFinished());
  }
  pause() {
    this.animation.pause();
  }
  complete() {
    this.animation.finish?.();
  }
  cancel() {
    try {
      this.animation.cancel();
    } catch {
    }
  }
  stop() {
    if (this.isStopped)
      return;
    this.isStopped = !0;
    const { state: t } = this;
    t === "idle" || t === "finished" || (this.updateMotionValue ? this.updateMotionValue() : this.commitStyles(), this.isPseudoElement || this.cancel());
  }
  /**
   * WAAPI doesn't natively have any interruption capabilities.
   *
   * In this method, we commit styles back to the DOM before cancelling
   * the animation.
   *
   * This is designed to be overridden by NativeAnimationExtended, which
   * will create a renderless JS animation and sample it twice to calculate
   * its current value, "previous" value, and therefore allow
   * Motion to also correctly calculate velocity for any subsequent animation
   * while deferring the commit until the next animation frame.
   */
  commitStyles() {
    const t = this.options?.element;
    !this.isPseudoElement && t?.isConnected && this.animation.commitStyles?.();
  }
  get duration() {
    const t = this.animation.effect?.getComputedTiming?.().duration || 0;
    return /* @__PURE__ */ Xe(Number(t));
  }
  get iterationDuration() {
    const { delay: t = 0 } = this.options || {};
    return this.duration + /* @__PURE__ */ Xe(t);
  }
  get time() {
    return /* @__PURE__ */ Xe(Number(this.animation.currentTime) || 0);
  }
  set time(t) {
    const n = this.finishedTime !== null;
    this.manualStartTime = null, this.finishedTime = null, this.animation.currentTime = /* @__PURE__ */ Be(t), n && this.animation.pause();
  }
  /**
   * The playback speed of the animation.
   * 1 = normal speed, 2 = double speed, 0.5 = half speed.
   */
  get speed() {
    return this.animation.playbackRate;
  }
  set speed(t) {
    t < 0 && (this.finishedTime = null), this.animation.playbackRate = t;
  }
  get state() {
    return this.finishedTime !== null ? "finished" : this.animation.playState;
  }
  get startTime() {
    return this.manualStartTime ?? Number(this.animation.startTime);
  }
  set startTime(t) {
    this.manualStartTime = this.animation.startTime = t;
  }
  /**
   * Attaches a timeline to the animation, for instance the `ScrollTimeline`.
   */
  attachTimeline({ timeline: t, rangeStart: n, rangeEnd: r, observe: a }) {
    return this.allowFlatten && this.animation.effect?.updateTiming({ easing: "linear" }), this.animation.onfinish = null, t && px() ? (this.animation.timeline = t, n && (this.animation.rangeStart = n), r && (this.animation.rangeEnd = r), Je) : a(this);
  }
}
const bm = {
  anticipate: _f,
  backInOut: zf,
  circInOut: Hf
};
function bx(e) {
  return e in bm;
}
function yx(e) {
  typeof e.ease == "string" && bx(e.ease) && (e.ease = bm[e.ease]);
}
const io = 10;
class xx extends vm {
  constructor(t) {
    yx(t), cm(t), super(t), t.startTime !== void 0 && t.autoplay !== !1 && (this.startTime = t.startTime), this.options = t;
  }
  /**
   * WAAPI doesn't natively have any interruption capabilities.
   *
   * Rather than read committed styles back out of the DOM, we can
   * create a renderless JS animation and sample it twice to calculate
   * its current value, "previous" value, and therefore allow
   * Motion to calculate velocity for any subsequent animation.
   */
  updateMotionValue(t) {
    const { motionValue: n, onUpdate: r, onComplete: a, element: i, ...o } = this.options;
    if (!n)
      return;
    if (t !== void 0) {
      n.set(t);
      return;
    }
    const s = new Nr({
      ...o,
      autoplay: !1
    }), l = Math.max(io, Ie.now() - this.startTime), c = yt(0, io, l - io), d = s.sample(l).value, { name: f } = this.options;
    i && f && mm(i, f, d), n.setWithVelocity(s.sample(Math.max(0, l - c)).value, d, c), s.stop();
  }
}
const Yu = (e, t) => t === "zIndex" ? !1 : !!(typeof e == "number" || Array.isArray(e) || typeof e == "string" && // It's animatable if we have a string
(rt.test(e) || e === "0") && // And it contains numbers and/or colors
!e.startsWith("url("));
function wx(e) {
  const t = e[0];
  if (e.length === 1)
    return !0;
  for (let n = 0; n < e.length; n++)
    if (e[n] !== t)
      return !0;
}
function $x(e, t, n, r) {
  const a = e[0];
  if (a === null)
    return !1;
  if (t === "display" || t === "visibility")
    return !0;
  const i = e[e.length - 1], o = Yu(a, t), s = Yu(i, t);
  return Gn(o === s, `You are trying to animate ${t} from "${a}" to "${i}". "${o ? i : a}" is not an animatable value.`, "value-not-animatable"), !o || !s ? !1 : wx(e) || (n === "spring" || sl(n)) && r;
}
function rs(e) {
  e.duration = 0, e.type = "keyframes";
}
const ym = /* @__PURE__ */ new Set([
  "opacity",
  "clipPath",
  "filter",
  "transform"
  // TODO: Can be accelerated but currently disabled until https://issues.chromium.org/issues/41491098 is resolved
  // or until we implement support for linear() easing.
  // "background-color"
]), Dx = /^(?:oklch|oklab|lab|lch|color|color-mix|light-dark)\(/;
function Cx(e) {
  for (let t = 0; t < e.length; t++)
    if (typeof e[t] == "string" && Dx.test(e[t]))
      return !0;
  return !1;
}
const Ex = /* @__PURE__ */ new Set([
  "color",
  "backgroundColor",
  "outlineColor",
  "fill",
  "stroke",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor"
]), Sx = /* @__PURE__ */ If(() => Object.hasOwnProperty.call(Element.prototype, "animate"));
function Tx(e) {
  const { motionValue: t, name: n, repeatDelay: r, repeatType: a, damping: i, type: o, keyframes: s } = e;
  if (!(t?.owner?.current instanceof HTMLElement))
    return !1;
  const { onUpdate: c, transformTemplate: d } = t.owner.getProps();
  return Sx() && n && /**
   * Force WAAPI for color properties with browser-only color formats
   * (oklch, oklab, lab, lch, etc.) that the JS animation path can't parse.
   */
  (ym.has(n) || Ex.has(n) && Cx(s)) && (n !== "transform" || !d) && /**
   * If we're outputting values to onUpdate then we can't use WAAPI as there's
   * no way to read the value from WAAPI every frame.
   */
  !c && !r && a !== "mirror" && i !== 0 && o !== "inertia";
}
const Px = 40;
class kx extends il {
  constructor({ autoplay: t = !0, delay: n = 0, type: r = "keyframes", repeat: a = 0, repeatDelay: i = 0, repeatType: o = "loop", keyframes: s, name: l, motionValue: c, element: d, ...f }) {
    super(), this.stop = () => {
      this._animation && (this._animation.stop(), this.stopTimeline?.()), this.keyframeResolver?.cancel();
    }, this.createdAt = Ie.now();
    const m = {
      autoplay: t,
      delay: n,
      type: r,
      repeat: a,
      repeatDelay: i,
      repeatType: o,
      name: l,
      motionValue: c,
      element: d,
      ...f
    }, h = d?.KeyframeResolver || ol;
    this.keyframeResolver = new h(s, (p, g, v) => this.onKeyframesResolved(p, g, m, !v), l, c, d), this.keyframeResolver?.scheduleResolve();
  }
  onKeyframesResolved(t, n, r, a) {
    this.keyframeResolver = void 0;
    const { name: i, type: o, velocity: s, delay: l, isHandoff: c, onUpdate: d } = r;
    this.resolvedAt = Ie.now();
    let f = !0;
    $x(t, i, o, s) || (f = !1, (Ut.instantAnimations || !l) && d?.($i(t, r, n)), t[0] = t[t.length - 1], rs(r), r.repeat = 0);
    const h = {
      startTime: a ? this.resolvedAt ? this.resolvedAt - this.createdAt > Px ? this.resolvedAt : this.createdAt : this.createdAt : void 0,
      finalKeyframe: n,
      ...r,
      keyframes: t
    }, p = f && !c && Tx(h), g = h.motionValue?.owner?.current;
    let v;
    if (p)
      try {
        v = new xx({
          ...h,
          element: g
        });
      } catch {
        v = new Nr(h);
      }
    else
      v = new Nr(h);
    v.finished.then(() => {
      this.notifyFinished();
    }).catch(Je), this.pendingTimeline && (this.stopTimeline = v.attachTimeline(this.pendingTimeline), this.pendingTimeline = void 0), this._animation = v;
  }
  get finished() {
    return this._animation ? this.animation.finished : this._finished;
  }
  then(t, n) {
    return this.finished.finally(t).then(() => {
    });
  }
  get animation() {
    return this._animation || (this.keyframeResolver?.resume(), fx()), this._animation;
  }
  get duration() {
    return this.animation.duration;
  }
  get iterationDuration() {
    return this.animation.iterationDuration;
  }
  get time() {
    return this.animation.time;
  }
  set time(t) {
    this.animation.time = t;
  }
  get speed() {
    return this.animation.speed;
  }
  get state() {
    return this.animation.state;
  }
  set speed(t) {
    this.animation.speed = t;
  }
  get startTime() {
    return this.animation.startTime;
  }
  attachTimeline(t) {
    return this._animation ? this.stopTimeline = this.animation.attachTimeline(t) : this.pendingTimeline = t, () => this.stop();
  }
  play() {
    this.animation.play();
  }
  pause() {
    this.animation.pause();
  }
  complete() {
    this.animation.complete();
  }
  cancel() {
    this._animation && this.animation.cancel(), this.keyframeResolver?.cancel();
  }
}
class Nx {
  constructor(t) {
    this.stop = () => this.runAll("stop"), this.animations = t.filter(Boolean);
  }
  get finished() {
    return Promise.all(this.animations.map((t) => t.finished));
  }
  /**
   * TODO: Filter out cancelled or stopped animations before returning
   */
  getAll(t) {
    return this.animations[0][t];
  }
  setAll(t, n) {
    for (let r = 0; r < this.animations.length; r++)
      this.animations[r][t] = n;
  }
  attachTimeline(t) {
    const n = this.animations.map((r) => r.attachTimeline(t));
    return () => {
      n.forEach((r, a) => {
        r && r(), this.animations[a].stop();
      });
    };
  }
  get time() {
    return this.getAll("time");
  }
  set time(t) {
    this.setAll("time", t);
  }
  get speed() {
    return this.getAll("speed");
  }
  set speed(t) {
    this.setAll("speed", t);
  }
  get state() {
    return this.getAll("state");
  }
  get startTime() {
    return this.getAll("startTime");
  }
  get duration() {
    return qu(this.animations, "duration");
  }
  get iterationDuration() {
    return qu(this.animations, "iterationDuration");
  }
  runAll(t) {
    this.animations.forEach((n) => n[t]());
  }
  play() {
    this.runAll("play");
  }
  pause() {
    this.runAll("pause");
  }
  cancel() {
    this.runAll("cancel");
  }
  complete() {
    this.runAll("complete");
  }
}
function qu(e, t) {
  let n = 0;
  for (let r = 0; r < e.length; r++) {
    const a = e[r][t];
    a !== null && a > n && (n = a);
  }
  return n;
}
class Ax extends Nx {
  then(t, n) {
    return this.finished.finally(t).then(() => {
    });
  }
}
function xm(e, t, n, r = 0, a = 1) {
  const i = Array.from(e).sort((c, d) => c.sortNodePosition(d)).indexOf(t), o = e.size, s = (o - 1) * r;
  return typeof n == "function" ? n(i, o) : a === 1 ? i * r : s - i * r;
}
const jx = (
  // eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive, as it can match a lot of words
  /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u
);
function Mx(e) {
  const t = jx.exec(e);
  if (!t)
    return [,];
  const [, n, r, a] = t;
  return [`--${n ?? r}`, a];
}
const Rx = 4;
function wm(e, t, n = 1) {
  at(n <= Rx, `Max CSS variable fallback depth detected in property "${e}". This may indicate a circular fallback dependency.`, "max-css-var-depth");
  const [r, a] = Mx(e);
  if (!r)
    return;
  const i = window.getComputedStyle(t).getPropertyValue(r);
  if (i) {
    const o = i.trim();
    return jf(o) ? parseFloat(o) : o;
  }
  return el(a) ? wm(a, t, n + 1) : a;
}
const Ix = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
}, Vx = (e) => ({
  type: "spring",
  stiffness: 550,
  damping: e === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
}), Bx = {
  type: "keyframes",
  duration: 0.8
}, Lx = {
  type: "keyframes",
  ease: [0.25, 0.1, 0.35, 1],
  duration: 0.3
}, Fx = (e, { keyframes: t }) => t.length > 2 ? Bx : Zn.has(e) ? e.startsWith("scale") ? Vx(t[1]) : Ix : Lx;
function $m(e, t) {
  if (e?.inherit && t) {
    const { inherit: n, ...r } = e;
    return { ...t, ...r };
  }
  return e;
}
function ll(e, t) {
  const n = e?.[t] ?? e?.default ?? e;
  return n !== e ? $m(n, e) : n;
}
const Ox = /* @__PURE__ */ new Set([
  "when",
  "delay",
  "delayChildren",
  "staggerChildren",
  "staggerDirection",
  "repeat",
  "repeatType",
  "repeatDelay",
  "from",
  "elapsed"
]);
function zx(e) {
  for (const t in e)
    if (!Ox.has(t))
      return !0;
  return !1;
}
const ul = (e, t, n, r = {}, a, i) => (o) => {
  const s = ll(r, e) || {}, l = s.delay || r.delay || 0;
  let { elapsed: c = 0 } = r;
  c = c - /* @__PURE__ */ Be(l);
  const d = {
    keyframes: Array.isArray(n) ? n : [null, n],
    ease: "easeOut",
    velocity: t.getVelocity(),
    ...s,
    delay: -c,
    onUpdate: (m) => {
      t.set(m), s.onUpdate && s.onUpdate(m);
    },
    onComplete: () => {
      o(), s.onComplete && s.onComplete();
    },
    name: e,
    motionValue: t,
    element: i ? void 0 : a
  };
  zx(s) || Object.assign(d, Fx(e, d)), d.duration && (d.duration = /* @__PURE__ */ Be(d.duration)), d.repeatDelay && (d.repeatDelay = /* @__PURE__ */ Be(d.repeatDelay)), d.from !== void 0 && (d.keyframes[0] = d.from);
  let f = !1;
  if ((d.type === !1 || d.duration === 0 && !d.repeatDelay) && (rs(d), d.delay === 0 && (f = !0)), (Ut.instantAnimations || Ut.skipAnimations || a?.shouldSkipAnimations) && (f = !0, rs(d), d.delay = 0), d.allowFlatten = !s.type && !s.ease, f && !i && t.get() !== void 0) {
    const m = $i(d.keyframes, s);
    if (m !== void 0) {
      ue.update(() => {
        d.onUpdate(m), d.onComplete();
      });
      return;
    }
  }
  return s.isSync ? new Nr(d) : new kx(d);
};
function Zu(e) {
  const t = [{}, {}];
  return e?.values.forEach((n, r) => {
    t[0][r] = n.get(), t[1][r] = n.getVelocity();
  }), t;
}
function cl(e, t, n, r) {
  if (typeof t == "function") {
    const [a, i] = Zu(r);
    t = t(n !== void 0 ? n : e.custom, a, i);
  }
  if (typeof t == "string" && (t = e.variants && e.variants[t]), typeof t == "function") {
    const [a, i] = Zu(r);
    t = t(n !== void 0 ? n : e.custom, a, i);
  }
  return t;
}
function nn(e, t, n) {
  const r = e.getProps();
  return cl(r, t, n !== void 0 ? n : r.custom, e);
}
const Dm = /* @__PURE__ */ new Set([
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  ...qn
]), Xu = 30, _x = (e) => !isNaN(parseFloat(e)), yr = {
  current: void 0
};
class Ux {
  /**
   * @param init - The initiating value
   * @param config - Optional configuration options
   *
   * -  `transformer`: A function to transform incoming values with.
   */
  constructor(t, n = {}) {
    this.canTrackVelocity = null, this.events = {}, this.updateAndNotify = (r) => {
      const a = Ie.now();
      if (this.updatedAt !== a && this.setPrevFrameValue(), this.prev = this.current, this.setCurrent(r), this.current !== this.prev && (this.events.change?.notify(this.current), this.dependents))
        for (const i of this.dependents)
          i.dirty();
    }, this.hasAnimated = !1, this.setCurrent(t), this.owner = n.owner;
  }
  setCurrent(t) {
    this.current = t, this.updatedAt = Ie.now(), this.canTrackVelocity === null && t !== void 0 && (this.canTrackVelocity = _x(this.current));
  }
  setPrevFrameValue(t = this.current) {
    this.prevFrameValue = t, this.prevUpdatedAt = this.updatedAt;
  }
  /**
   * Adds a function that will be notified when the `MotionValue` is updated.
   *
   * It returns a function that, when called, will cancel the subscription.
   *
   * When calling `onChange` inside a React component, it should be wrapped with the
   * `useEffect` hook. As it returns an unsubscribe function, this should be returned
   * from the `useEffect` function to ensure you don't add duplicate subscribers..
   *
   * ```jsx
   * export const MyComponent = () => {
   *   const x = useMotionValue(0)
   *   const y = useMotionValue(0)
   *   const opacity = useMotionValue(1)
   *
   *   useEffect(() => {
   *     function updateOpacity() {
   *       const maxXY = Math.max(x.get(), y.get())
   *       const newOpacity = transform(maxXY, [0, 100], [1, 0])
   *       opacity.set(newOpacity)
   *     }
   *
   *     const unsubscribeX = x.on("change", updateOpacity)
   *     const unsubscribeY = y.on("change", updateOpacity)
   *
   *     return () => {
   *       unsubscribeX()
   *       unsubscribeY()
   *     }
   *   }, [])
   *
   *   return <motion.div style={{ x }} />
   * }
   * ```
   *
   * @param subscriber - A function that receives the latest value.
   * @returns A function that, when called, will cancel this subscription.
   *
   * @deprecated
   */
  onChange(t) {
    return process.env.NODE_ENV !== "production" && Xs(!1, 'value.onChange(callback) is deprecated. Switch to value.on("change", callback).'), this.on("change", t);
  }
  on(t, n) {
    this.events[t] || (this.events[t] = new Zs());
    const r = this.events[t].add(n);
    return t === "change" ? () => {
      r(), ue.read(() => {
        this.events.change.getSize() || this.stop();
      });
    } : r;
  }
  clearListeners() {
    for (const t in this.events)
      this.events[t].clear();
  }
  /**
   * Attaches a passive effect to the `MotionValue`.
   */
  attach(t, n) {
    this.passiveEffect = t, this.stopPassiveEffect = n;
  }
  /**
   * Sets the state of the `MotionValue`.
   *
   * @remarks
   *
   * ```jsx
   * const x = useMotionValue(0)
   * x.set(10)
   * ```
   *
   * @param latest - Latest value to set.
   * @param render - Whether to notify render subscribers. Defaults to `true`
   *
   * @public
   */
  set(t) {
    this.passiveEffect ? this.passiveEffect(t, this.updateAndNotify) : this.updateAndNotify(t);
  }
  setWithVelocity(t, n, r) {
    this.set(n), this.prev = void 0, this.prevFrameValue = t, this.prevUpdatedAt = this.updatedAt - r;
  }
  /**
   * Set the state of the `MotionValue`, stopping any active animations,
   * effects, and resets velocity to `0`.
   */
  jump(t, n = !0) {
    this.updateAndNotify(t), this.prev = t, this.prevUpdatedAt = this.prevFrameValue = void 0, n && this.stop(), this.stopPassiveEffect && this.stopPassiveEffect();
  }
  dirty() {
    this.events.change?.notify(this.current);
  }
  addDependent(t) {
    this.dependents || (this.dependents = /* @__PURE__ */ new Set()), this.dependents.add(t);
  }
  removeDependent(t) {
    this.dependents && this.dependents.delete(t);
  }
  /**
   * Returns the latest state of `MotionValue`
   *
   * @returns - The latest state of `MotionValue`
   *
   * @public
   */
  get() {
    return yr.current && yr.current.push(this), this.current;
  }
  /**
   * @public
   */
  getPrevious() {
    return this.prev;
  }
  /**
   * Returns the latest velocity of `MotionValue`
   *
   * @returns - The latest velocity of `MotionValue`. Returns `0` if the state is non-numerical.
   *
   * @public
   */
  getVelocity() {
    const t = Ie.now();
    if (!this.canTrackVelocity || this.prevFrameValue === void 0 || t - this.updatedAt > Xu)
      return 0;
    const n = Math.min(this.updatedAt - this.prevUpdatedAt, Xu);
    return Vf(parseFloat(this.current) - parseFloat(this.prevFrameValue), n);
  }
  /**
   * Registers a new animation to control this `MotionValue`. Only one
   * animation can drive a `MotionValue` at one time.
   *
   * ```jsx
   * value.start()
   * ```
   *
   * @param animation - A function that starts the provided animation
   */
  start(t) {
    return this.stop(), new Promise((n) => {
      this.hasAnimated = !0, this.animation = t(n), this.events.animationStart && this.events.animationStart.notify();
    }).then(() => {
      this.events.animationComplete && this.events.animationComplete.notify(), this.clearAnimation();
    });
  }
  /**
   * Stop the currently active animation.
   *
   * @public
   */
  stop() {
    this.animation && (this.animation.stop(), this.events.animationCancel && this.events.animationCancel.notify()), this.clearAnimation();
  }
  /**
   * Returns `true` if this value is currently animating.
   *
   * @public
   */
  isAnimating() {
    return !!this.animation;
  }
  clearAnimation() {
    delete this.animation;
  }
  /**
   * Destroy and clean up subscribers to this `MotionValue`.
   *
   * The `MotionValue` hooks like `useMotionValue` and `useTransform` automatically
   * handle the lifecycle of the returned `MotionValue`, so this method is only necessary if you've manually
   * created a `MotionValue` via the `motionValue` function.
   *
   * @public
   */
  destroy() {
    this.dependents?.clear(), this.events.destroy?.notify(), this.clearListeners(), this.stop(), this.stopPassiveEffect && this.stopPassiveEffect();
  }
}
function Ht(e, t) {
  return new Ux(e, t);
}
const as = (e) => Array.isArray(e);
function Hx(e, t, n) {
  e.hasValue(t) ? e.getValue(t).set(n) : e.addValue(t, Ht(n));
}
function Kx(e) {
  return as(e) ? e[e.length - 1] || 0 : e;
}
function Wx(e, t) {
  const n = nn(e, t);
  let { transitionEnd: r = {}, transition: a = {}, ...i } = n || {};
  i = { ...i, ...r };
  for (const o in i) {
    const s = Kx(i[o]);
    Hx(e, o, s);
  }
}
const ge = (e) => !!(e && e.getVelocity);
function Gx(e) {
  return !!(ge(e) && e.add);
}
function is(e, t) {
  const n = e.getValue("willChange");
  if (Gx(n))
    return n.add(t);
  if (!n && Ut.WillChange) {
    const r = new Ut.WillChange("auto");
    e.addValue("willChange", r), r.add(t);
  }
}
function dl(e) {
  return e.replace(/([A-Z])/g, (t) => `-${t.toLowerCase()}`);
}
const Yx = "framerAppearId", Cm = "data-" + dl(Yx);
function Em(e) {
  return e.props[Cm];
}
function qx({ protectedKeys: e, needsAnimating: t }, n) {
  const r = e.hasOwnProperty(n) && t[n] !== !0;
  return t[n] = !1, r;
}
function fl(e, t, { delay: n = 0, transitionOverride: r, type: a } = {}) {
  let { transition: i, transitionEnd: o, ...s } = t;
  const l = e.getDefaultTransition();
  i = i ? $m(i, l) : l;
  const c = i?.reduceMotion;
  r && (i = r);
  const d = [], f = a && e.animationState && e.animationState.getState()[a];
  for (const m in s) {
    const h = e.getValue(m, e.latestValues[m] ?? null), p = s[m];
    if (p === void 0 || f && qx(f, m))
      continue;
    const g = {
      delay: n,
      ...ll(i || {}, m)
    }, v = h.get();
    if (v !== void 0 && !h.isAnimating() && !Array.isArray(p) && p === v && !g.velocity) {
      ue.update(() => h.set(p));
      continue;
    }
    let b = !1;
    if (window.MotionHandoffAnimation) {
      const w = Em(e);
      if (w) {
        const E = window.MotionHandoffAnimation(w, m, ue);
        E !== null && (g.startTime = E, b = !0);
      }
    }
    is(e, m);
    const x = c ?? e.shouldReduceMotion;
    h.start(ul(m, h, p, x && Dm.has(m) ? { type: !1 } : g, e, b));
    const C = h.animation;
    C && d.push(C);
  }
  if (o) {
    const m = () => ue.update(() => {
      o && Wx(e, o);
    });
    d.length ? Promise.all(d).then(m) : m();
  }
  return d;
}
function os(e, t, n = {}) {
  const r = nn(e, t, n.type === "exit" ? e.presenceContext?.custom : void 0);
  let { transition: a = e.getDefaultTransition() || {} } = r || {};
  n.transitionOverride && (a = n.transitionOverride);
  const i = r ? () => Promise.all(fl(e, r, n)) : () => Promise.resolve(), o = e.variantChildren && e.variantChildren.size ? (l = 0) => {
    const { delayChildren: c = 0, staggerChildren: d, staggerDirection: f } = a;
    return Zx(e, t, l, c, d, f, n);
  } : () => Promise.resolve(), { when: s } = a;
  if (s) {
    const [l, c] = s === "beforeChildren" ? [i, o] : [o, i];
    return l().then(() => c());
  } else
    return Promise.all([i(), o(n.delay)]);
}
function Zx(e, t, n = 0, r = 0, a = 0, i = 1, o) {
  const s = [];
  for (const l of e.variantChildren)
    l.notify("AnimationStart", t), s.push(os(l, t, {
      ...o,
      delay: n + (typeof r == "function" ? 0 : r) + xm(e.variantChildren, l, r, a, i)
    }).then(() => l.notify("AnimationComplete", t)));
  return Promise.all(s);
}
function Xx(e, t, n = {}) {
  e.notify("AnimationStart", t);
  let r;
  if (Array.isArray(t)) {
    const a = t.map((i) => os(e, i, n));
    r = Promise.all(a);
  } else if (typeof t == "string")
    r = os(e, t, n);
  else {
    const a = typeof t == "function" ? nn(e, t, n.custom) : t;
    r = Promise.all(fl(e, a, n));
  }
  return r.then(() => {
    e.notify("AnimationComplete", t);
  });
}
const Jx = {
  test: (e) => e === "auto",
  parse: (e) => e
}, Sm = (e) => (t) => t.test(e), Tm = [Yn, z, vt, Bt, Ey, Cy, Jx], Ju = (e) => Tm.find(Sm(e));
function Qx(e) {
  return typeof e == "number" ? e === 0 : e !== null ? e === "none" || e === "0" || Rf(e) : !0;
}
const e1 = /* @__PURE__ */ new Set(["brightness", "contrast", "saturate", "opacity"]);
function t1(e) {
  const [t, n] = e.slice(0, -1).split("(");
  if (t === "drop-shadow")
    return e;
  const [r] = n.match(tl) || [];
  if (!r)
    return e;
  const a = n.replace(r, "");
  let i = e1.has(t) ? 1 : 0;
  return r !== n && (i *= 100), t + "(" + i + a + ")";
}
const n1 = /\b([a-z-]*)\(.*?\)/gu, ss = {
  ...rt,
  getAnimatableNone: (e) => {
    const t = e.match(n1);
    return t ? t.map(t1).join(" ") : e;
  }
}, ls = {
  ...rt,
  getAnimatableNone: (e) => {
    const t = rt.parse(e);
    return rt.createTransformer(e)(t.map((r) => typeof r == "number" ? 0 : typeof r == "object" ? { ...r, alpha: 1 } : r));
  }
}, Qu = {
  ...Yn,
  transform: Math.round
}, r1 = {
  rotate: Bt,
  rotateX: Bt,
  rotateY: Bt,
  rotateZ: Bt,
  scale: ga,
  scaleX: ga,
  scaleY: ga,
  scaleZ: ga,
  skew: Bt,
  skewX: Bt,
  skewY: Bt,
  distance: z,
  translateX: z,
  translateY: z,
  translateZ: z,
  x: z,
  y: z,
  z,
  perspective: z,
  transformPerspective: z,
  opacity: Pr,
  originX: Lu,
  originY: Lu,
  originZ: z
}, ml = {
  // Border props
  borderWidth: z,
  borderTopWidth: z,
  borderRightWidth: z,
  borderBottomWidth: z,
  borderLeftWidth: z,
  borderRadius: z,
  borderTopLeftRadius: z,
  borderTopRightRadius: z,
  borderBottomRightRadius: z,
  borderBottomLeftRadius: z,
  // Positioning props
  width: z,
  maxWidth: z,
  height: z,
  maxHeight: z,
  top: z,
  right: z,
  bottom: z,
  left: z,
  inset: z,
  insetBlock: z,
  insetBlockStart: z,
  insetBlockEnd: z,
  insetInline: z,
  insetInlineStart: z,
  insetInlineEnd: z,
  // Spacing props
  padding: z,
  paddingTop: z,
  paddingRight: z,
  paddingBottom: z,
  paddingLeft: z,
  paddingBlock: z,
  paddingBlockStart: z,
  paddingBlockEnd: z,
  paddingInline: z,
  paddingInlineStart: z,
  paddingInlineEnd: z,
  margin: z,
  marginTop: z,
  marginRight: z,
  marginBottom: z,
  marginLeft: z,
  marginBlock: z,
  marginBlockStart: z,
  marginBlockEnd: z,
  marginInline: z,
  marginInlineStart: z,
  marginInlineEnd: z,
  // Typography
  fontSize: z,
  // Misc
  backgroundPositionX: z,
  backgroundPositionY: z,
  ...r1,
  zIndex: Qu,
  // SVG
  fillOpacity: Pr,
  strokeOpacity: Pr,
  numOctaves: Qu
}, a1 = {
  ...ml,
  // Color props
  color: be,
  backgroundColor: be,
  outlineColor: be,
  fill: be,
  stroke: be,
  // Border props
  borderColor: be,
  borderTopColor: be,
  borderRightColor: be,
  borderBottomColor: be,
  borderLeftColor: be,
  filter: ss,
  WebkitFilter: ss,
  mask: ls,
  WebkitMask: ls
}, Pm = (e) => a1[e], i1 = /* @__PURE__ */ new Set([ss, ls]);
function km(e, t) {
  let n = Pm(e);
  return i1.has(n) || (n = rt), n.getAnimatableNone ? n.getAnimatableNone(t) : void 0;
}
const o1 = /* @__PURE__ */ new Set(["auto", "none", "0"]);
function s1(e, t, n) {
  let r = 0, a;
  for (; r < e.length && !a; ) {
    const i = e[r];
    typeof i == "string" && !o1.has(i) && On(i).values.length && (a = e[r]), r++;
  }
  if (a && n)
    for (const i of t)
      e[i] = km(n, a);
}
class l1 extends ol {
  constructor(t, n, r, a, i) {
    super(t, n, r, a, i, !0);
  }
  readKeyframes() {
    const { unresolvedKeyframes: t, element: n, name: r } = this;
    if (!n || !n.current)
      return;
    super.readKeyframes();
    for (let d = 0; d < t.length; d++) {
      let f = t[d];
      if (typeof f == "string" && (f = f.trim(), el(f))) {
        const m = wm(f, n.current);
        m !== void 0 && (t[d] = m), d === t.length - 1 && (this.finalKeyframe = f);
      }
    }
    if (this.resolveNoneKeyframes(), !Dm.has(r) || t.length !== 2)
      return;
    const [a, i] = t, o = Ju(a), s = Ju(i), l = Bu(a), c = Bu(i);
    if (l !== c && zt[r]) {
      this.needsMeasurement = !0;
      return;
    }
    if (o !== s)
      if (Wu(o) && Wu(s))
        for (let d = 0; d < t.length; d++) {
          const f = t[d];
          typeof f == "string" && (t[d] = parseFloat(f));
        }
      else zt[r] && (this.needsMeasurement = !0);
  }
  resolveNoneKeyframes() {
    const { unresolvedKeyframes: t, name: n } = this, r = [];
    for (let a = 0; a < t.length; a++)
      (t[a] === null || Qx(t[a])) && r.push(a);
    r.length && s1(t, r, n);
  }
  measureInitialState() {
    const { element: t, unresolvedKeyframes: n, name: r } = this;
    if (!t || !t.current)
      return;
    r === "height" && (this.suspendedScrollY = window.pageYOffset), this.measuredOrigin = zt[r](t.measureViewportBox(), window.getComputedStyle(t.current)), n[0] = this.measuredOrigin;
    const a = n[n.length - 1];
    a !== void 0 && t.getValue(r, a).jump(a, !1);
  }
  measureEndState() {
    const { element: t, name: n, unresolvedKeyframes: r } = this;
    if (!t || !t.current)
      return;
    const a = t.getValue(n);
    a && a.jump(this.measuredOrigin, !1);
    const i = r.length - 1, o = r[i];
    r[i] = zt[n](t.measureViewportBox(), window.getComputedStyle(t.current)), o !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = o), this.removedTransforms?.length && this.removedTransforms.forEach(([s, l]) => {
      t.getValue(s).set(l);
    }), this.resolveNoneKeyframes();
  }
}
function Di(e, t, n) {
  if (e == null)
    return [];
  if (e instanceof EventTarget)
    return [e];
  if (typeof e == "string") {
    let r = document;
    t && (r = t.current);
    const a = n?.[e] ?? r.querySelectorAll(e);
    return a ? Array.from(a) : [];
  }
  return Array.from(e).filter((r) => r != null);
}
const Nm = (e, t) => t && typeof e == "number" ? t.transform(e) : e;
function Ma(e) {
  return Mf(e) && "offsetHeight" in e && !("ownerSVGElement" in e);
}
const { schedule: hl } = /* @__PURE__ */ qf(queueMicrotask, !1), tt = {
  x: !1,
  y: !1
};
function Am() {
  return tt.x || tt.y;
}
function u1(e) {
  return e === "x" || e === "y" ? tt[e] ? null : (tt[e] = !0, () => {
    tt[e] = !1;
  }) : tt.x || tt.y ? null : (tt.x = tt.y = !0, () => {
    tt.x = tt.y = !1;
  });
}
function jm(e, t) {
  const n = Di(e), r = new AbortController(), a = {
    passive: !0,
    ...t,
    signal: r.signal
  };
  return [n, a, () => r.abort()];
}
function c1(e) {
  return !(e.pointerType === "touch" || Am());
}
function d1(e, t, n = {}) {
  const [r, a, i] = jm(e, n);
  return r.forEach((o) => {
    let s = !1, l = !1, c;
    const d = () => {
      o.removeEventListener("pointerleave", p);
    }, f = (v) => {
      c && (c(v), c = void 0), d();
    }, m = (v) => {
      s = !1, window.removeEventListener("pointerup", m), window.removeEventListener("pointercancel", m), l && (l = !1, f(v));
    }, h = () => {
      s = !0, window.addEventListener("pointerup", m, a), window.addEventListener("pointercancel", m, a);
    }, p = (v) => {
      if (v.pointerType !== "touch") {
        if (s) {
          l = !0;
          return;
        }
        f(v);
      }
    }, g = (v) => {
      if (!c1(v))
        return;
      l = !1;
      const b = t(o, v);
      typeof b == "function" && (c = b, o.addEventListener("pointerleave", p, a));
    };
    o.addEventListener("pointerenter", g, a), o.addEventListener("pointerdown", h, a);
  }), i;
}
const Mm = (e, t) => t ? e === t ? !0 : Mm(e, t.parentElement) : !1, pl = (e) => e.pointerType === "mouse" ? typeof e.button != "number" || e.button <= 0 : e.isPrimary !== !1, f1 = /* @__PURE__ */ new Set([
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "A"
]);
function m1(e) {
  return f1.has(e.tagName) || e.isContentEditable === !0;
}
const h1 = /* @__PURE__ */ new Set(["INPUT", "SELECT", "TEXTAREA"]);
function p1(e) {
  return h1.has(e.tagName) || e.isContentEditable === !0;
}
const Ra = /* @__PURE__ */ new WeakSet();
function ec(e) {
  return (t) => {
    t.key === "Enter" && e(t);
  };
}
function oo(e, t) {
  e.dispatchEvent(new PointerEvent("pointer" + t, { isPrimary: !0, bubbles: !0 }));
}
const g1 = (e, t) => {
  const n = e.currentTarget;
  if (!n)
    return;
  const r = ec(() => {
    if (Ra.has(n))
      return;
    oo(n, "down");
    const a = ec(() => {
      oo(n, "up");
    }), i = () => oo(n, "cancel");
    n.addEventListener("keyup", a, t), n.addEventListener("blur", i, t);
  });
  n.addEventListener("keydown", r, t), n.addEventListener("blur", () => n.removeEventListener("keydown", r), t);
};
function tc(e) {
  return pl(e) && !Am();
}
const nc = /* @__PURE__ */ new WeakSet();
function v1(e, t, n = {}) {
  const [r, a, i] = jm(e, n), o = (s) => {
    const l = s.currentTarget;
    if (!tc(s) || nc.has(s))
      return;
    Ra.add(l), n.stopPropagation && nc.add(s);
    const c = t(l, s), d = (h, p) => {
      window.removeEventListener("pointerup", f), window.removeEventListener("pointercancel", m), Ra.has(l) && Ra.delete(l), tc(h) && typeof c == "function" && c(h, { success: p });
    }, f = (h) => {
      d(h, l === window || l === document || n.useGlobalTarget || Mm(l, h.target));
    }, m = (h) => {
      d(h, !1);
    };
    window.addEventListener("pointerup", f, a), window.addEventListener("pointercancel", m, a);
  };
  return r.forEach((s) => {
    (n.useGlobalTarget ? window : s).addEventListener("pointerdown", o, a), Ma(s) && (s.addEventListener("focus", (c) => g1(c, a)), !m1(s) && !s.hasAttribute("tabindex") && (s.tabIndex = 0));
  }), i;
}
function Ci(e) {
  return Mf(e) && "ownerSVGElement" in e;
}
const Ia = /* @__PURE__ */ new WeakMap();
let Va;
const Rm = (e, t, n) => (r, a) => a && a[0] ? a[0][e + "Size"] : Ci(r) && "getBBox" in r ? r.getBBox()[t] : r[n], b1 = /* @__PURE__ */ Rm("inline", "width", "offsetWidth"), y1 = /* @__PURE__ */ Rm("block", "height", "offsetHeight");
function x1({ target: e, borderBoxSize: t }) {
  Ia.get(e)?.forEach((n) => {
    n(e, {
      get width() {
        return b1(e, t);
      },
      get height() {
        return y1(e, t);
      }
    });
  });
}
function w1(e) {
  e.forEach(x1);
}
function $1() {
  typeof ResizeObserver > "u" || (Va = new ResizeObserver(w1));
}
function D1(e, t) {
  Va || $1();
  const n = Di(e);
  return n.forEach((r) => {
    let a = Ia.get(r);
    a || (a = /* @__PURE__ */ new Set(), Ia.set(r, a)), a.add(t), Va?.observe(r);
  }), () => {
    n.forEach((r) => {
      const a = Ia.get(r);
      a?.delete(t), a?.size || Va?.unobserve(r);
    });
  };
}
const Ba = /* @__PURE__ */ new Set();
let Pn;
function C1() {
  Pn = () => {
    const e = {
      get width() {
        return window.innerWidth;
      },
      get height() {
        return window.innerHeight;
      }
    };
    Ba.forEach((t) => t(e));
  }, window.addEventListener("resize", Pn);
}
function E1(e) {
  return Ba.add(e), Pn || C1(), () => {
    Ba.delete(e), !Ba.size && typeof Pn == "function" && (window.removeEventListener("resize", Pn), Pn = void 0);
  };
}
function rc(e, t) {
  return typeof e == "function" ? E1(e) : D1(e, t);
}
function Im(e) {
  return Ci(e) && e.tagName === "svg";
}
function S1(...e) {
  const t = !Array.isArray(e[0]), n = t ? 0 : -1, r = e[0 + n], a = e[1 + n], i = e[2 + n], o = e[3 + n], s = sm(a, i, o);
  return t ? s(r) : s;
}
function T1(e, t, n = {}) {
  const r = e.get();
  let a = null, i = r, o;
  const s = typeof r == "string" ? r.replace(/[\d.-]/g, "") : void 0, l = () => {
    a && (a.stop(), a = null), e.animation = void 0;
  }, c = () => {
    const f = ac(e.get()), m = ac(i);
    if (f === m) {
      l();
      return;
    }
    const h = a ? a.getGeneratorVelocity() : e.getVelocity();
    l(), a = new Nr({
      keyframes: [f, m],
      velocity: h,
      // Default to spring if no type specified (matches useSpring behavior)
      type: "spring",
      restDelta: 1e-3,
      restSpeed: 0.01,
      ...n,
      onUpdate: o
    });
  }, d = () => {
    c(), e.animation = a ?? void 0, e.events.animationStart?.notify(), a?.then(() => {
      e.animation = void 0, e.events.animationComplete?.notify();
    });
  };
  if (e.attach((f, m) => {
    i = f, o = (h) => m(so(h, s)), ue.postRender(d);
  }, l), ge(t)) {
    let f = n.skipInitialAnimation === !0;
    const m = t.on("change", (p) => {
      f ? (f = !1, e.jump(so(p, s), !1)) : e.set(so(p, s));
    }), h = e.on("destroy", m);
    return () => {
      m(), h();
    };
  }
  return l;
}
function so(e, t) {
  return t ? e + t : e;
}
function ac(e) {
  return typeof e == "number" ? e : parseFloat(e);
}
const P1 = [...Tm, be, rt], k1 = (e) => P1.find(Sm(e)), ic = () => ({
  translate: 0,
  scale: 1,
  origin: 0,
  originPoint: 0
}), kn = () => ({
  x: ic(),
  y: ic()
}), oc = () => ({ min: 0, max: 0 }), ve = () => ({
  x: oc(),
  y: oc()
}), Ar = /* @__PURE__ */ new WeakMap();
function Ei(e) {
  return e !== null && typeof e == "object" && typeof e.start == "function";
}
function jr(e) {
  return typeof e == "string" || Array.isArray(e);
}
const gl = [
  "animate",
  "whileInView",
  "whileFocus",
  "whileHover",
  "whileTap",
  "whileDrag",
  "exit"
], vl = ["initial", ...gl];
function Si(e) {
  return Ei(e.animate) || vl.some((t) => jr(e[t]));
}
function Vm(e) {
  return !!(Si(e) || e.variants);
}
function N1(e, t, n) {
  for (const r in t) {
    const a = t[r], i = n[r];
    if (ge(a))
      e.addValue(r, a);
    else if (ge(i))
      e.addValue(r, Ht(a, { owner: e }));
    else if (i !== a)
      if (e.hasValue(r)) {
        const o = e.getValue(r);
        o.liveStyle === !0 ? o.jump(a) : o.hasAnimated || o.set(a);
      } else {
        const o = e.getStaticValue(r);
        e.addValue(r, Ht(o !== void 0 ? o : a, { owner: e }));
      }
  }
  for (const r in n)
    t[r] === void 0 && e.removeValue(r);
  return t;
}
const us = { current: null }, Bm = { current: !1 }, A1 = typeof window < "u";
function j1() {
  if (Bm.current = !0, !!A1)
    if (window.matchMedia) {
      const e = window.matchMedia("(prefers-reduced-motion)"), t = () => us.current = e.matches;
      e.addEventListener("change", t), t();
    } else
      us.current = !1;
}
const sc = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete"
];
let Za = {};
function Lm(e) {
  Za = e;
}
function M1() {
  return Za;
}
class Fm {
  /**
   * This method takes React props and returns found MotionValues. For example, HTML
   * MotionValues will be found within the style prop, whereas for Three.js within attribute arrays.
   *
   * This isn't an abstract method as it needs calling in the constructor, but it is
   * intended to be one.
   */
  scrapeMotionValuesFromProps(t, n, r) {
    return {};
  }
  constructor({ parent: t, props: n, presenceContext: r, reducedMotionConfig: a, skipAnimations: i, blockInitialAnimation: o, visualState: s }, l = {}) {
    this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.shouldSkipAnimations = !1, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = ol, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.hasBeenMounted = !1, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
      this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
    }, this.renderScheduledAt = 0, this.scheduleRender = () => {
      const h = Ie.now();
      this.renderScheduledAt < h && (this.renderScheduledAt = h, ue.render(this.render, !1, !0));
    };
    const { latestValues: c, renderState: d } = s;
    this.latestValues = c, this.baseTarget = { ...c }, this.initialValues = n.initial ? { ...c } : {}, this.renderState = d, this.parent = t, this.props = n, this.presenceContext = r, this.depth = t ? t.depth + 1 : 0, this.reducedMotionConfig = a, this.skipAnimationsConfig = i, this.options = l, this.blockInitialAnimation = !!o, this.isControllingVariants = Si(n), this.isVariantNode = Vm(n), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(t && t.current);
    const { willChange: f, ...m } = this.scrapeMotionValuesFromProps(n, {}, this);
    for (const h in m) {
      const p = m[h];
      c[h] !== void 0 && ge(p) && p.set(c[h]);
    }
  }
  mount(t) {
    if (this.hasBeenMounted)
      for (const n in this.initialValues)
        this.values.get(n)?.jump(this.initialValues[n]), this.latestValues[n] = this.initialValues[n];
    this.current = t, Ar.set(t, this), this.projection && !this.projection.instance && this.projection.mount(t), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((n, r) => this.bindToMotionValue(r, n)), this.reducedMotionConfig === "never" ? this.shouldReduceMotion = !1 : this.reducedMotionConfig === "always" ? this.shouldReduceMotion = !0 : (Bm.current || j1(), this.shouldReduceMotion = us.current), process.env.NODE_ENV !== "production" && Xs(this.shouldReduceMotion !== !0, "You have Reduced Motion enabled on your device. Animations may not appear as expected.", "reduced-motion-disabled"), this.shouldSkipAnimations = this.skipAnimationsConfig ?? !1, this.parent?.addChild(this), this.update(this.props, this.presenceContext), this.hasBeenMounted = !0;
  }
  unmount() {
    this.projection && this.projection.unmount(), Et(this.notifyUpdate), Et(this.render), this.valueSubscriptions.forEach((t) => t()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), this.parent?.removeChild(this);
    for (const t in this.events)
      this.events[t].clear();
    for (const t in this.features) {
      const n = this.features[t];
      n && (n.unmount(), n.isMounted = !1);
    }
    this.current = null;
  }
  addChild(t) {
    this.children.add(t), this.enteringChildren ?? (this.enteringChildren = /* @__PURE__ */ new Set()), this.enteringChildren.add(t);
  }
  removeChild(t) {
    this.children.delete(t), this.enteringChildren && this.enteringChildren.delete(t);
  }
  bindToMotionValue(t, n) {
    if (this.valueSubscriptions.has(t) && this.valueSubscriptions.get(t)(), n.accelerate && ym.has(t) && this.current instanceof HTMLElement) {
      const { factory: o, keyframes: s, times: l, ease: c, duration: d } = n.accelerate, f = new vm({
        element: this.current,
        name: t,
        keyframes: s,
        times: l,
        ease: c,
        duration: /* @__PURE__ */ Be(d)
      }), m = o(f);
      this.valueSubscriptions.set(t, () => {
        m(), f.cancel();
      });
      return;
    }
    const r = Zn.has(t);
    r && this.onBindTransform && this.onBindTransform();
    const a = n.on("change", (o) => {
      this.latestValues[t] = o, this.props.onUpdate && ue.preRender(this.notifyUpdate), r && this.projection && (this.projection.isTransformDirty = !0), this.scheduleRender();
    });
    let i;
    typeof window < "u" && window.MotionCheckAppearSync && (i = window.MotionCheckAppearSync(this, t, n)), this.valueSubscriptions.set(t, () => {
      a(), i && i(), n.owner && n.stop();
    });
  }
  sortNodePosition(t) {
    return !this.current || !this.sortInstanceNodePosition || this.type !== t.type ? 0 : this.sortInstanceNodePosition(this.current, t.current);
  }
  updateFeatures() {
    let t = "animation";
    for (t in Za) {
      const n = Za[t];
      if (!n)
        continue;
      const { isEnabled: r, Feature: a } = n;
      if (!this.features[t] && a && r(this.props) && (this.features[t] = new a(this)), this.features[t]) {
        const i = this.features[t];
        i.isMounted ? i.update() : (i.mount(), i.isMounted = !0);
      }
    }
  }
  triggerBuild() {
    this.build(this.renderState, this.latestValues, this.props);
  }
  /**
   * Measure the current viewport box with or without transforms.
   * Only measures axis-aligned boxes, rotate and skew must be manually
   * removed with a re-render to work.
   */
  measureViewportBox() {
    return this.current ? this.measureInstanceViewportBox(this.current, this.props) : ve();
  }
  getStaticValue(t) {
    return this.latestValues[t];
  }
  setStaticValue(t, n) {
    this.latestValues[t] = n;
  }
  /**
   * Update the provided props. Ensure any newly-added motion values are
   * added to our map, old ones removed, and listeners updated.
   */
  update(t, n) {
    (t.transformTemplate || this.props.transformTemplate) && this.scheduleRender(), this.prevProps = this.props, this.props = t, this.prevPresenceContext = this.presenceContext, this.presenceContext = n;
    for (let r = 0; r < sc.length; r++) {
      const a = sc[r];
      this.propEventSubscriptions[a] && (this.propEventSubscriptions[a](), delete this.propEventSubscriptions[a]);
      const i = "on" + a, o = t[i];
      o && (this.propEventSubscriptions[a] = this.on(a, o));
    }
    this.prevMotionValues = N1(this, this.scrapeMotionValuesFromProps(t, this.prevProps || {}, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue();
  }
  getProps() {
    return this.props;
  }
  /**
   * Returns the variant definition with a given name.
   */
  getVariant(t) {
    return this.props.variants ? this.props.variants[t] : void 0;
  }
  /**
   * Returns the defined default transition on this component.
   */
  getDefaultTransition() {
    return this.props.transition;
  }
  getTransformPagePoint() {
    return this.props.transformPagePoint;
  }
  getClosestVariantNode() {
    return this.isVariantNode ? this : this.parent ? this.parent.getClosestVariantNode() : void 0;
  }
  /**
   * Add a child visual element to our set of children.
   */
  addVariantChild(t) {
    const n = this.getClosestVariantNode();
    if (n)
      return n.variantChildren && n.variantChildren.add(t), () => n.variantChildren.delete(t);
  }
  /**
   * Add a motion value and bind it to this visual element.
   */
  addValue(t, n) {
    const r = this.values.get(t);
    n !== r && (r && this.removeValue(t), this.bindToMotionValue(t, n), this.values.set(t, n), this.latestValues[t] = n.get());
  }
  /**
   * Remove a motion value and unbind any active subscriptions.
   */
  removeValue(t) {
    this.values.delete(t);
    const n = this.valueSubscriptions.get(t);
    n && (n(), this.valueSubscriptions.delete(t)), delete this.latestValues[t], this.removeValueFromRenderState(t, this.renderState);
  }
  /**
   * Check whether we have a motion value for this key
   */
  hasValue(t) {
    return this.values.has(t);
  }
  getValue(t, n) {
    if (this.props.values && this.props.values[t])
      return this.props.values[t];
    let r = this.values.get(t);
    return r === void 0 && n !== void 0 && (r = Ht(n === null ? void 0 : n, { owner: this }), this.addValue(t, r)), r;
  }
  /**
   * If we're trying to animate to a previously unencountered value,
   * we need to check for it in our state and as a last resort read it
   * directly from the instance (which might have performance implications).
   */
  readValue(t, n) {
    let r = this.latestValues[t] !== void 0 || !this.current ? this.latestValues[t] : this.getBaseTargetFromProps(this.props, t) ?? this.readValueFromInstance(this.current, t, this.options);
    return r != null && (typeof r == "string" && (jf(r) || Rf(r)) ? r = parseFloat(r) : !k1(r) && rt.test(n) && (r = km(t, n)), this.setBaseTarget(t, ge(r) ? r.get() : r)), ge(r) ? r.get() : r;
  }
  /**
   * Set the base target to later animate back to. This is currently
   * only hydrated on creation and when we first read a value.
   */
  setBaseTarget(t, n) {
    this.baseTarget[t] = n;
  }
  /**
   * Find the base target for a value thats been removed from all animation
   * props.
   */
  getBaseTarget(t) {
    const { initial: n } = this.props;
    let r;
    if (typeof n == "string" || typeof n == "object") {
      const i = cl(this.props, n, this.presenceContext?.custom);
      i && (r = i[t]);
    }
    if (n && r !== void 0)
      return r;
    const a = this.getBaseTargetFromProps(this.props, t);
    return a !== void 0 && !ge(a) ? a : this.initialValues[t] !== void 0 && r === void 0 ? void 0 : this.baseTarget[t];
  }
  on(t, n) {
    return this.events[t] || (this.events[t] = new Zs()), this.events[t].add(n);
  }
  notify(t, ...n) {
    this.events[t] && this.events[t].notify(...n);
  }
  scheduleRenderMicrotask() {
    hl.render(this.render);
  }
}
class Om extends Fm {
  constructor() {
    super(...arguments), this.KeyframeResolver = l1;
  }
  sortInstanceNodePosition(t, n) {
    return t.compareDocumentPosition(n) & 2 ? 1 : -1;
  }
  getBaseTargetFromProps(t, n) {
    const r = t.style;
    return r ? r[n] : void 0;
  }
  removeValueFromRenderState(t, { vars: n, style: r }) {
    delete n[t], delete r[t];
  }
  handleChildMotionValue() {
    this.childSubscription && (this.childSubscription(), delete this.childSubscription);
    const { children: t } = this.props;
    ge(t) && (this.childSubscription = t.on("change", (n) => {
      this.current && (this.current.textContent = `${n}`);
    }));
  }
}
class Wt {
  constructor(t) {
    this.isMounted = !1, this.node = t;
  }
  update() {
  }
}
function zm({ top: e, left: t, right: n, bottom: r }) {
  return {
    x: { min: t, max: n },
    y: { min: e, max: r }
  };
}
function R1({ x: e, y: t }) {
  return { top: t.min, right: e.max, bottom: t.max, left: e.min };
}
function I1(e, t) {
  if (!t)
    return e;
  const n = t({ x: e.left, y: e.top }), r = t({ x: e.right, y: e.bottom });
  return {
    top: n.y,
    left: n.x,
    bottom: r.y,
    right: r.x
  };
}
function lo(e) {
  return e === void 0 || e === 1;
}
function cs({ scale: e, scaleX: t, scaleY: n }) {
  return !lo(e) || !lo(t) || !lo(n);
}
function Zt(e) {
  return cs(e) || _m(e) || e.z || e.rotate || e.rotateX || e.rotateY || e.skewX || e.skewY;
}
function _m(e) {
  return lc(e.x) || lc(e.y);
}
function lc(e) {
  return e && e !== "0%";
}
function Xa(e, t, n) {
  const r = e - n, a = t * r;
  return n + a;
}
function uc(e, t, n, r, a) {
  return a !== void 0 && (e = Xa(e, a, r)), Xa(e, n, r) + t;
}
function ds(e, t = 0, n = 1, r, a) {
  e.min = uc(e.min, t, n, r, a), e.max = uc(e.max, t, n, r, a);
}
function Um(e, { x: t, y: n }) {
  ds(e.x, t.translate, t.scale, t.originPoint), ds(e.y, n.translate, n.scale, n.originPoint);
}
const cc = 0.999999999999, dc = 1.0000000000001;
function V1(e, t, n, r = !1) {
  const a = n.length;
  if (!a)
    return;
  t.x = t.y = 1;
  let i, o;
  for (let s = 0; s < a; s++) {
    i = n[s], o = i.projectionDelta;
    const { visualElement: l } = i.options;
    l && l.props.style && l.props.style.display === "contents" || (r && i.options.layoutScroll && i.scroll && i !== i.root && (gt(e.x, -i.scroll.offset.x), gt(e.y, -i.scroll.offset.y)), o && (t.x *= o.x.scale, t.y *= o.y.scale, Um(e, o)), r && Zt(i.latestValues) && La(e, i.latestValues, i.layout?.layoutBox));
  }
  t.x < dc && t.x > cc && (t.x = 1), t.y < dc && t.y > cc && (t.y = 1);
}
function gt(e, t) {
  e.min += t, e.max += t;
}
function fc(e, t, n, r, a = 0.5) {
  const i = ce(e.min, e.max, a);
  ds(e, t, n, i, r);
}
function mc(e, t) {
  return typeof e == "string" ? parseFloat(e) / 100 * (t.max - t.min) : e;
}
function La(e, t, n) {
  const r = n ?? e;
  fc(e.x, mc(t.x, r.x), t.scaleX, t.scale, t.originX), fc(e.y, mc(t.y, r.y), t.scaleY, t.scale, t.originY);
}
function Hm(e, t) {
  return zm(I1(e.getBoundingClientRect(), t));
}
function B1(e, t, n) {
  const r = Hm(e, n), { scroll: a } = t;
  return a && (gt(r.x, a.offset.x), gt(r.y, a.offset.y)), r;
}
const L1 = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}, F1 = qn.length;
function O1(e, t, n) {
  let r = "", a = !0;
  for (let i = 0; i < F1; i++) {
    const o = qn[i], s = e[o];
    if (s === void 0)
      continue;
    let l = !0;
    if (typeof s == "number")
      l = s === (o.startsWith("scale") ? 1 : 0);
    else {
      const c = parseFloat(s);
      l = o.startsWith("scale") ? c === 1 : c === 0;
    }
    if (!l || n) {
      const c = Nm(s, ml[o]);
      if (!l) {
        a = !1;
        const d = L1[o] || o;
        r += `${d}(${c}) `;
      }
      n && (t[o] = c);
    }
  }
  return r = r.trim(), n ? r = n(t, a ? "" : r) : a && (r = "none"), r;
}
function bl(e, t, n) {
  const { style: r, vars: a, transformOrigin: i } = e;
  let o = !1, s = !1;
  for (const l in t) {
    const c = t[l];
    if (Zn.has(l)) {
      o = !0;
      continue;
    } else if (Xf(l)) {
      a[l] = c;
      continue;
    } else {
      const d = Nm(c, ml[l]);
      l.startsWith("origin") ? (s = !0, i[l] = d) : r[l] = d;
    }
  }
  if (t.transform || (o || n ? r.transform = O1(t, e.transform, n) : r.transform && (r.transform = "none")), s) {
    const { originX: l = "50%", originY: c = "50%", originZ: d = 0 } = i;
    r.transformOrigin = `${l} ${c} ${d}`;
  }
}
function Km(e, { style: t, vars: n }, r, a) {
  const i = e.style;
  let o;
  for (o in t)
    i[o] = t[o];
  a?.applyProjectionStyles(i, r);
  for (o in n)
    i.setProperty(o, n[o]);
}
function hc(e, t) {
  return t.max === t.min ? 0 : e / (t.max - t.min) * 100;
}
const ur = {
  correct: (e, t) => {
    if (!t.target)
      return e;
    if (typeof e == "string")
      if (z.test(e))
        e = parseFloat(e);
      else
        return e;
    const n = hc(e, t.target.x), r = hc(e, t.target.y);
    return `${n}% ${r}%`;
  }
}, z1 = {
  correct: (e, { treeScale: t, projectionDelta: n }) => {
    const r = e, a = rt.parse(e);
    if (a.length > 5)
      return r;
    const i = rt.createTransformer(e), o = typeof a[0] != "number" ? 1 : 0, s = n.x.scale * t.x, l = n.y.scale * t.y;
    a[0 + o] /= s, a[1 + o] /= l;
    const c = ce(s, l, 0.5);
    return typeof a[2 + o] == "number" && (a[2 + o] /= c), typeof a[3 + o] == "number" && (a[3 + o] /= c), i(a);
  }
}, fs = {
  borderRadius: {
    ...ur,
    applyTo: [
      "borderTopLeftRadius",
      "borderTopRightRadius",
      "borderBottomLeftRadius",
      "borderBottomRightRadius"
    ]
  },
  borderTopLeftRadius: ur,
  borderTopRightRadius: ur,
  borderBottomLeftRadius: ur,
  borderBottomRightRadius: ur,
  boxShadow: z1
};
function Wm(e, { layout: t, layoutId: n }) {
  return Zn.has(e) || e.startsWith("origin") || (t || n !== void 0) && (!!fs[e] || e === "opacity");
}
function yl(e, t, n) {
  const r = e.style, a = t?.style, i = {};
  if (!r)
    return i;
  for (const o in r)
    (ge(r[o]) || a && ge(a[o]) || Wm(o, e) || n?.getValue(o)?.liveStyle !== void 0) && (i[o] = r[o]);
  return i;
}
function _1(e) {
  return window.getComputedStyle(e);
}
class Gm extends Om {
  constructor() {
    super(...arguments), this.type = "html", this.renderInstance = Km;
  }
  readValueFromInstance(t, n) {
    if (Zn.has(n))
      return this.projection?.isProjecting ? Jo(n) : sx(t, n);
    {
      const r = _1(t), a = (Xf(n) ? r.getPropertyValue(n) : r[n]) || 0;
      return typeof a == "string" ? a.trim() : a;
    }
  }
  measureInstanceViewportBox(t, { transformPagePoint: n }) {
    return Hm(t, n);
  }
  build(t, n, r) {
    bl(t, n, r.transformTemplate);
  }
  scrapeMotionValuesFromProps(t, n, r) {
    return yl(t, n, r);
  }
}
function U1(e, t) {
  return e in t;
}
class H1 extends Fm {
  constructor() {
    super(...arguments), this.type = "object";
  }
  readValueFromInstance(t, n) {
    if (U1(n, t)) {
      const r = t[n];
      if (typeof r == "string" || typeof r == "number")
        return r;
    }
  }
  getBaseTargetFromProps() {
  }
  removeValueFromRenderState(t, n) {
    delete n.output[t];
  }
  measureInstanceViewportBox() {
    return ve();
  }
  build(t, n) {
    Object.assign(t.output, n);
  }
  renderInstance(t, { output: n }) {
    Object.assign(t, n);
  }
  sortInstanceNodePosition() {
    return 0;
  }
}
const K1 = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
}, W1 = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function G1(e, t, n = 1, r = 0, a = !0) {
  e.pathLength = 1;
  const i = a ? K1 : W1;
  e[i.offset] = `${-r}`, e[i.array] = `${t} ${n}`;
}
const Y1 = [
  "offsetDistance",
  "offsetPath",
  "offsetRotate",
  "offsetAnchor"
];
function Ym(e, {
  attrX: t,
  attrY: n,
  attrScale: r,
  pathLength: a,
  pathSpacing: i = 1,
  pathOffset: o = 0,
  // This is object creation, which we try to avoid per-frame.
  ...s
}, l, c, d) {
  if (bl(e, s, c), l) {
    e.style.viewBox && (e.attrs.viewBox = e.style.viewBox);
    return;
  }
  e.attrs = e.style, e.style = {};
  const { attrs: f, style: m } = e;
  f.transform && (m.transform = f.transform, delete f.transform), (m.transform || f.transformOrigin) && (m.transformOrigin = f.transformOrigin ?? "50% 50%", delete f.transformOrigin), m.transform && (m.transformBox = d?.transformBox ?? "fill-box", delete f.transformBox);
  for (const h of Y1)
    f[h] !== void 0 && (m[h] = f[h], delete f[h]);
  t !== void 0 && (f.x = t), n !== void 0 && (f.y = n), r !== void 0 && (f.scale = r), a !== void 0 && G1(f, a, i, o, !1);
}
const qm = /* @__PURE__ */ new Set([
  "baseFrequency",
  "diffuseConstant",
  "kernelMatrix",
  "kernelUnitLength",
  "keySplines",
  "keyTimes",
  "limitingConeAngle",
  "markerHeight",
  "markerWidth",
  "numOctaves",
  "targetX",
  "targetY",
  "surfaceScale",
  "specularConstant",
  "specularExponent",
  "stdDeviation",
  "tableValues",
  "viewBox",
  "gradientTransform",
  "pathLength",
  "startOffset",
  "textLength",
  "lengthAdjust"
]), Zm = (e) => typeof e == "string" && e.toLowerCase() === "svg";
function q1(e, t, n, r) {
  Km(e, t, void 0, r);
  for (const a in t.attrs)
    e.setAttribute(qm.has(a) ? a : dl(a), t.attrs[a]);
}
function Xm(e, t, n) {
  const r = yl(e, t, n);
  for (const a in e)
    if (ge(e[a]) || ge(t[a])) {
      const i = qn.indexOf(a) !== -1 ? "attr" + a.charAt(0).toUpperCase() + a.substring(1) : a;
      r[i] = e[a];
    }
  return r;
}
class Jm extends Om {
  constructor() {
    super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = ve;
  }
  getBaseTargetFromProps(t, n) {
    return t[n];
  }
  readValueFromInstance(t, n) {
    if (Zn.has(n)) {
      const r = Pm(n);
      return r && r.default || 0;
    }
    return n = qm.has(n) ? n : dl(n), t.getAttribute(n);
  }
  scrapeMotionValuesFromProps(t, n, r) {
    return Xm(t, n, r);
  }
  build(t, n, r) {
    Ym(t, n, this.isSVGTag, r.transformTemplate, r.style);
  }
  renderInstance(t, n, r, a) {
    q1(t, n, r, a);
  }
  mount(t) {
    this.isSVGTag = Zm(t.tagName), super.mount(t);
  }
}
const Z1 = vl.length;
function Qm(e) {
  if (!e)
    return;
  if (!e.isControllingVariants) {
    const n = e.parent ? Qm(e.parent) || {} : {};
    return e.props.initial !== void 0 && (n.initial = e.props.initial), n;
  }
  const t = {};
  for (let n = 0; n < Z1; n++) {
    const r = vl[n], a = e.props[r];
    (jr(a) || a === !1) && (t[r] = a);
  }
  return t;
}
function eh(e, t) {
  if (!Array.isArray(t))
    return !1;
  const n = t.length;
  if (n !== e.length)
    return !1;
  for (let r = 0; r < n; r++)
    if (t[r] !== e[r])
      return !1;
  return !0;
}
const X1 = [...gl].reverse(), J1 = gl.length;
function Q1(e) {
  return (t) => Promise.all(t.map(({ animation: n, options: r }) => Xx(e, n, r)));
}
function e4(e) {
  let t = Q1(e), n = pc(), r = !0, a = !1;
  const i = (c) => (d, f) => {
    const m = nn(e, f, c === "exit" ? e.presenceContext?.custom : void 0);
    if (m) {
      const { transition: h, transitionEnd: p, ...g } = m;
      d = { ...d, ...g, ...p };
    }
    return d;
  };
  function o(c) {
    t = c(e);
  }
  function s(c) {
    const { props: d } = e, f = Qm(e.parent) || {}, m = [], h = /* @__PURE__ */ new Set();
    let p = {}, g = 1 / 0;
    for (let b = 0; b < J1; b++) {
      const x = X1[b], C = n[x], w = d[x] !== void 0 ? d[x] : f[x], E = jr(w), k = x === c ? C.isActive : null;
      k === !1 && (g = b);
      let A = w === f[x] && w !== d[x] && E;
      if (A && (r || a) && e.manuallyAnimateOnMount && (A = !1), C.protectedKeys = { ...p }, // If it isn't active and hasn't *just* been set as inactive
      !C.isActive && k === null || // If we didn't and don't have any defined prop for this animation type
      !w && !C.prevProp || // Or if the prop doesn't define an animation
      Ei(w) || typeof w == "boolean")
        continue;
      if (x === "exit" && C.isActive && k !== !0) {
        C.prevResolvedValues && (p = {
          ...p,
          ...C.prevResolvedValues
        });
        continue;
      }
      const P = t4(C.prevProp, w);
      let j = P || // If we're making this variant active, we want to always make it active
      x === c && C.isActive && !A && E || // If we removed a higher-priority variant (i is in reverse order)
      b > g && E, T = !1;
      const M = Array.isArray(w) ? w : [w];
      let L = M.reduce(i(x), {});
      k === !1 && (L = {});
      const { prevResolvedValues: O = {} } = C, Z = {
        ...O,
        ...L
      }, Q = (K) => {
        j = !0, h.has(K) && (T = !0, h.delete(K)), C.needsAnimating[K] = !0;
        const te = e.getValue(K);
        te && (te.liveStyle = !1);
      };
      for (const K in Z) {
        const te = L[K], S = O[K];
        if (p.hasOwnProperty(K))
          continue;
        let $ = !1;
        as(te) && as(S) ? $ = !eh(te, S) : $ = te !== S, $ ? te != null ? Q(K) : h.add(K) : te !== void 0 && h.has(K) ? Q(K) : C.protectedKeys[K] = !0;
      }
      C.prevProp = w, C.prevResolvedValues = L, C.isActive && (p = { ...p, ...L }), (r || a) && e.blockInitialAnimation && (j = !1);
      const J = A && P;
      j && (!J || T) && m.push(...M.map((K) => {
        const te = { type: x };
        if (typeof K == "string" && (r || a) && !J && e.manuallyAnimateOnMount && e.parent) {
          const { parent: S } = e, $ = nn(S, K);
          if (S.enteringChildren && $) {
            const { delayChildren: D } = $.transition || {};
            te.delay = xm(S.enteringChildren, e, D);
          }
        }
        return {
          animation: K,
          options: te
        };
      }));
    }
    if (h.size) {
      const b = {};
      if (typeof d.initial != "boolean") {
        const x = nn(e, Array.isArray(d.initial) ? d.initial[0] : d.initial);
        x && x.transition && (b.transition = x.transition);
      }
      h.forEach((x) => {
        const C = e.getBaseTarget(x), w = e.getValue(x);
        w && (w.liveStyle = !0), b[x] = C ?? null;
      }), m.push({ animation: b });
    }
    let v = !!m.length;
    return r && (d.initial === !1 || d.initial === d.animate) && !e.manuallyAnimateOnMount && (v = !1), r = !1, a = !1, v ? t(m) : Promise.resolve();
  }
  function l(c, d) {
    if (n[c].isActive === d)
      return Promise.resolve();
    e.variantChildren?.forEach((m) => m.animationState?.setActive(c, d)), n[c].isActive = d;
    const f = s(c);
    for (const m in n)
      n[m].protectedKeys = {};
    return f;
  }
  return {
    animateChanges: s,
    setActive: l,
    setAnimateFunction: o,
    getState: () => n,
    reset: () => {
      n = pc(), a = !0;
    }
  };
}
function t4(e, t) {
  return typeof t == "string" ? t !== e : Array.isArray(t) ? !eh(t, e) : !1;
}
function Gt(e = !1) {
  return {
    isActive: e,
    protectedKeys: {},
    needsAnimating: {},
    prevResolvedValues: {}
  };
}
function pc() {
  return {
    animate: Gt(!0),
    whileInView: Gt(),
    whileHover: Gt(),
    whileTap: Gt(),
    whileDrag: Gt(),
    whileFocus: Gt(),
    exit: Gt()
  };
}
function ms(e, t) {
  e.min = t.min, e.max = t.max;
}
function et(e, t) {
  ms(e.x, t.x), ms(e.y, t.y);
}
function gc(e, t) {
  e.translate = t.translate, e.scale = t.scale, e.originPoint = t.originPoint, e.origin = t.origin;
}
const th = 1e-4, n4 = 1 - th, r4 = 1 + th, nh = 0.01, a4 = 0 - nh, i4 = 0 + nh;
function Ve(e) {
  return e.max - e.min;
}
function o4(e, t, n) {
  return Math.abs(e - t) <= n;
}
function vc(e, t, n, r = 0.5) {
  e.origin = r, e.originPoint = ce(t.min, t.max, e.origin), e.scale = Ve(n) / Ve(t), e.translate = ce(n.min, n.max, e.origin) - e.originPoint, (e.scale >= n4 && e.scale <= r4 || isNaN(e.scale)) && (e.scale = 1), (e.translate >= a4 && e.translate <= i4 || isNaN(e.translate)) && (e.translate = 0);
}
function xr(e, t, n, r) {
  vc(e.x, t.x, n.x, r ? r.originX : void 0), vc(e.y, t.y, n.y, r ? r.originY : void 0);
}
function bc(e, t, n, r = 0) {
  const a = r ? ce(n.min, n.max, r) : n.min;
  e.min = a + t.min, e.max = e.min + Ve(t);
}
function s4(e, t, n, r) {
  bc(e.x, t.x, n.x, r?.x), bc(e.y, t.y, n.y, r?.y);
}
function yc(e, t, n, r = 0) {
  const a = r ? ce(n.min, n.max, r) : n.min;
  e.min = t.min - a, e.max = e.min + Ve(t);
}
function Ja(e, t, n, r) {
  yc(e.x, t.x, n.x, r?.x), yc(e.y, t.y, n.y, r?.y);
}
function xc(e, t, n, r, a) {
  return e -= t, e = Xa(e, 1 / n, r), a !== void 0 && (e = Xa(e, 1 / a, r)), e;
}
function l4(e, t = 0, n = 1, r = 0.5, a, i = e, o = e) {
  if (vt.test(t) && (t = parseFloat(t), t = ce(o.min, o.max, t / 100) - o.min), typeof t != "number")
    return;
  let s = ce(i.min, i.max, r);
  e === i && (s -= t), e.min = xc(e.min, t, n, s, a), e.max = xc(e.max, t, n, s, a);
}
function wc(e, t, [n, r, a], i, o) {
  l4(e, t[n], t[r], t[a], t.scale, i, o);
}
const u4 = ["x", "scaleX", "originX"], c4 = ["y", "scaleY", "originY"];
function $c(e, t, n, r) {
  wc(e.x, t, u4, n ? n.x : void 0, r ? r.x : void 0), wc(e.y, t, c4, n ? n.y : void 0, r ? r.y : void 0);
}
function Dc(e) {
  return e.translate === 0 && e.scale === 1;
}
function rh(e) {
  return Dc(e.x) && Dc(e.y);
}
function Cc(e, t) {
  return e.min === t.min && e.max === t.max;
}
function d4(e, t) {
  return Cc(e.x, t.x) && Cc(e.y, t.y);
}
function Ec(e, t) {
  return Math.round(e.min) === Math.round(t.min) && Math.round(e.max) === Math.round(t.max);
}
function ah(e, t) {
  return Ec(e.x, t.x) && Ec(e.y, t.y);
}
function Sc(e) {
  return Ve(e.x) / Ve(e.y);
}
function Tc(e, t) {
  return e.translate === t.translate && e.scale === t.scale && e.originPoint === t.originPoint;
}
function mt(e) {
  return [e("x"), e("y")];
}
function f4(e, t, n) {
  let r = "";
  const a = e.x.translate / t.x, i = e.y.translate / t.y, o = n?.z || 0;
  if ((a || i || o) && (r = `translate3d(${a}px, ${i}px, ${o}px) `), (t.x !== 1 || t.y !== 1) && (r += `scale(${1 / t.x}, ${1 / t.y}) `), n) {
    const { transformPerspective: c, rotate: d, rotateX: f, rotateY: m, skewX: h, skewY: p } = n;
    c && (r = `perspective(${c}px) ${r}`), d && (r += `rotate(${d}deg) `), f && (r += `rotateX(${f}deg) `), m && (r += `rotateY(${m}deg) `), h && (r += `skewX(${h}deg) `), p && (r += `skewY(${p}deg) `);
  }
  const s = e.x.scale * t.x, l = e.y.scale * t.y;
  return (s !== 1 || l !== 1) && (r += `scale(${s}, ${l})`), r || "none";
}
const ih = [
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius"
], m4 = ih.length, Pc = (e) => typeof e == "string" ? parseFloat(e) : e, kc = (e) => typeof e == "number" || z.test(e);
function h4(e, t, n, r, a, i) {
  a ? (e.opacity = ce(0, n.opacity ?? 1, p4(r)), e.opacityExit = ce(t.opacity ?? 1, 0, g4(r))) : i && (e.opacity = ce(t.opacity ?? 1, n.opacity ?? 1, r));
  for (let o = 0; o < m4; o++) {
    const s = ih[o];
    let l = Nc(t, s), c = Nc(n, s);
    if (l === void 0 && c === void 0)
      continue;
    l || (l = 0), c || (c = 0), l === 0 || c === 0 || kc(l) === kc(c) ? (e[s] = Math.max(ce(Pc(l), Pc(c), r), 0), (vt.test(c) || vt.test(l)) && (e[s] += "%")) : e[s] = c;
  }
  (t.rotate || n.rotate) && (e.rotate = ce(t.rotate || 0, n.rotate || 0, r));
}
function Nc(e, t) {
  return e[t] !== void 0 ? e[t] : e.borderRadius;
}
const p4 = /* @__PURE__ */ oh(0, 0.5, Uf), g4 = /* @__PURE__ */ oh(0.5, 0.95, Je);
function oh(e, t, n) {
  return (r) => r < e ? 0 : r > t ? 1 : n(/* @__PURE__ */ Fn(e, t, r));
}
function sh(e, t, n) {
  const r = ge(e) ? e : Ht(e);
  return r.start(ul("", r, t, n)), r.animation;
}
function Mr(e, t, n, r = { passive: !0 }) {
  return e.addEventListener(t, n, r), () => e.removeEventListener(t, n);
}
const v4 = (e, t) => e.depth - t.depth;
class b4 {
  constructor() {
    this.children = [], this.isDirty = !1;
  }
  add(t) {
    qs(this.children, t), this.isDirty = !0;
  }
  remove(t) {
    Ln(this.children, t), this.isDirty = !0;
  }
  forEach(t) {
    this.isDirty && this.children.sort(v4), this.isDirty = !1, this.children.forEach(t);
  }
}
function y4(e, t) {
  const n = Ie.now(), r = ({ timestamp: a }) => {
    const i = a - n;
    i >= t && (Et(r), e(i - t));
  };
  return ue.setup(r, !0), () => Et(r);
}
function Fa(e) {
  return ge(e) ? e.get() : e;
}
class x4 {
  constructor() {
    this.members = [];
  }
  add(t) {
    qs(this.members, t);
    for (let n = this.members.length - 1; n >= 0; n--) {
      const r = this.members[n];
      if (r === t || r === this.lead || r === this.prevLead)
        continue;
      const a = r.instance;
      (!a || a.isConnected === !1) && !r.snapshot && (Ln(this.members, r), r.unmount());
    }
    t.scheduleRender();
  }
  remove(t) {
    if (Ln(this.members, t), t === this.prevLead && (this.prevLead = void 0), t === this.lead) {
      const n = this.members[this.members.length - 1];
      n && this.promote(n);
    }
  }
  relegate(t) {
    for (let n = this.members.indexOf(t) - 1; n >= 0; n--) {
      const r = this.members[n];
      if (r.isPresent !== !1 && r.instance?.isConnected !== !1)
        return this.promote(r), !0;
    }
    return !1;
  }
  promote(t, n) {
    const r = this.lead;
    if (t !== r && (this.prevLead = r, this.lead = t, t.show(), r)) {
      r.updateSnapshot(), t.scheduleRender();
      const { layoutDependency: a } = r.options, { layoutDependency: i } = t.options;
      (a === void 0 || a !== i) && (t.resumeFrom = r, n && (r.preserveOpacity = !0), r.snapshot && (t.snapshot = r.snapshot, t.snapshot.latestValues = r.animationValues || r.latestValues), t.root?.isUpdating && (t.isLayoutDirty = !0)), t.options.crossfade === !1 && r.hide();
    }
  }
  exitAnimationComplete() {
    this.members.forEach((t) => {
      t.options.onExitComplete?.(), t.resumingFrom?.options.onExitComplete?.();
    });
  }
  scheduleRender() {
    this.members.forEach((t) => t.instance && t.scheduleRender(!1));
  }
  removeLeadSnapshot() {
    this.lead?.snapshot && (this.lead.snapshot = void 0);
  }
}
const Oa = {
  /**
   * Global flag as to whether the tree has animated since the last time
   * we resized the window
   */
  hasAnimatedSinceResize: !0,
  /**
   * We set this to true once, on the first update. Any nodes added to the tree beyond that
   * update will be given a `data-projection-id` attribute.
   */
  hasEverUpdated: !1
}, uo = ["", "X", "Y", "Z"], w4 = 1e3;
let $4 = 0;
function co(e, t, n, r) {
  const { latestValues: a } = t;
  a[e] && (n[e] = a[e], t.setStaticValue(e, 0), r && (r[e] = 0));
}
function lh(e) {
  if (e.hasCheckedOptimisedAppear = !0, e.root === e)
    return;
  const { visualElement: t } = e.options;
  if (!t)
    return;
  const n = Em(t);
  if (window.MotionHasOptimisedAnimation(n, "transform")) {
    const { layout: a, layoutId: i } = e.options;
    window.MotionCancelOptimisedAnimation(n, "transform", ue, !(a || i));
  }
  const { parent: r } = e;
  r && !r.hasCheckedOptimisedAppear && lh(r);
}
function uh({ attachResizeListener: e, defaultParent: t, measureScroll: n, checkIsScrollRoot: r, resetTransform: a }) {
  return class {
    constructor(o = {}, s = t?.()) {
      this.id = $4++, this.animationId = 0, this.animationCommitId = 0, this.children = /* @__PURE__ */ new Set(), this.options = {}, this.isTreeAnimating = !1, this.isAnimationBlocked = !1, this.isLayoutDirty = !1, this.isProjectionDirty = !1, this.isSharedProjectionDirty = !1, this.isTransformDirty = !1, this.updateManuallyBlocked = !1, this.updateBlockedByResize = !1, this.isUpdating = !1, this.isSVG = !1, this.needsReset = !1, this.shouldResetTransform = !1, this.hasCheckedOptimisedAppear = !1, this.treeScale = { x: 1, y: 1 }, this.eventHandlers = /* @__PURE__ */ new Map(), this.hasTreeAnimated = !1, this.layoutVersion = 0, this.updateScheduled = !1, this.scheduleUpdate = () => this.update(), this.projectionUpdateScheduled = !1, this.checkUpdateFailed = () => {
        this.isUpdating && (this.isUpdating = !1, this.clearAllSnapshots());
      }, this.updateProjection = () => {
        this.projectionUpdateScheduled = !1, this.nodes.forEach(E4), this.nodes.forEach(A4), this.nodes.forEach(j4), this.nodes.forEach(S4);
      }, this.resolvedRelativeTargetAt = 0, this.linkedParentVersion = 0, this.hasProjected = !1, this.isVisible = !0, this.animationProgress = 0, this.sharedNodes = /* @__PURE__ */ new Map(), this.latestValues = o, this.root = s ? s.root || s : this, this.path = s ? [...s.path, s] : [], this.parent = s, this.depth = s ? s.depth + 1 : 0;
      for (let l = 0; l < this.path.length; l++)
        this.path[l].shouldResetTransform = !0;
      this.root === this && (this.nodes = new b4());
    }
    addEventListener(o, s) {
      return this.eventHandlers.has(o) || this.eventHandlers.set(o, new Zs()), this.eventHandlers.get(o).add(s);
    }
    notifyListeners(o, ...s) {
      const l = this.eventHandlers.get(o);
      l && l.notify(...s);
    }
    hasListeners(o) {
      return this.eventHandlers.has(o);
    }
    /**
     * Lifecycles
     */
    mount(o) {
      if (this.instance)
        return;
      this.isSVG = Ci(o) && !Im(o), this.instance = o;
      const { layoutId: s, layout: l, visualElement: c } = this.options;
      if (c && !c.current && c.mount(o), this.root.nodes.add(this), this.parent && this.parent.children.add(this), this.root.hasTreeAnimated && (l || s) && (this.isLayoutDirty = !0), e) {
        let d, f = 0;
        const m = () => this.root.updateBlockedByResize = !1;
        ue.read(() => {
          f = window.innerWidth;
        }), e(o, () => {
          const h = window.innerWidth;
          h !== f && (f = h, this.root.updateBlockedByResize = !0, d && d(), d = y4(m, 250), Oa.hasAnimatedSinceResize && (Oa.hasAnimatedSinceResize = !1, this.nodes.forEach(Mc)));
        });
      }
      s && this.root.registerSharedNode(s, this), this.options.animate !== !1 && c && (s || l) && this.addEventListener("didUpdate", ({ delta: d, hasLayoutChanged: f, hasRelativeLayoutChanged: m, layout: h }) => {
        if (this.isTreeAnimationBlocked()) {
          this.target = void 0, this.relativeTarget = void 0;
          return;
        }
        const p = this.options.transition || c.getDefaultTransition() || B4, { onLayoutAnimationStart: g, onLayoutAnimationComplete: v } = c.getProps(), b = !this.targetLayout || !ah(this.targetLayout, h), x = !f && m;
        if (this.options.layoutRoot || this.resumeFrom || x || f && (b || !this.currentAnimation)) {
          this.resumeFrom && (this.resumingFrom = this.resumeFrom, this.resumingFrom.resumingFrom = void 0);
          const C = {
            ...ll(p, "layout"),
            onPlay: g,
            onComplete: v
          };
          (c.shouldReduceMotion || this.options.layoutRoot) && (C.delay = 0, C.type = !1), this.startAnimation(C), this.setAnimationOrigin(d, x);
        } else
          f || Mc(this), this.isLead() && this.options.onExitComplete && this.options.onExitComplete();
        this.targetLayout = h;
      });
    }
    unmount() {
      this.options.layoutId && this.willUpdate(), this.root.nodes.remove(this);
      const o = this.getStack();
      o && o.remove(this), this.parent && this.parent.children.delete(this), this.instance = void 0, this.eventHandlers.clear(), Et(this.updateProjection);
    }
    // only on the root
    blockUpdate() {
      this.updateManuallyBlocked = !0;
    }
    unblockUpdate() {
      this.updateManuallyBlocked = !1;
    }
    isUpdateBlocked() {
      return this.updateManuallyBlocked || this.updateBlockedByResize;
    }
    isTreeAnimationBlocked() {
      return this.isAnimationBlocked || this.parent && this.parent.isTreeAnimationBlocked() || !1;
    }
    // Note: currently only running on root node
    startUpdate() {
      this.isUpdateBlocked() || (this.isUpdating = !0, this.nodes && this.nodes.forEach(M4), this.animationId++);
    }
    getTransformTemplate() {
      const { visualElement: o } = this.options;
      return o && o.getProps().transformTemplate;
    }
    willUpdate(o = !0) {
      if (this.root.hasTreeAnimated = !0, this.root.isUpdateBlocked()) {
        this.options.onExitComplete && this.options.onExitComplete();
        return;
      }
      if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && lh(this), !this.root.isUpdating && this.root.startUpdate(), this.isLayoutDirty)
        return;
      this.isLayoutDirty = !0;
      for (let d = 0; d < this.path.length; d++) {
        const f = this.path[d];
        f.shouldResetTransform = !0, (typeof f.latestValues.x == "string" || typeof f.latestValues.y == "string") && (f.isLayoutDirty = !0), f.updateScroll("snapshot"), f.options.layoutRoot && f.willUpdate(!1);
      }
      const { layoutId: s, layout: l } = this.options;
      if (s === void 0 && !l)
        return;
      const c = this.getTransformTemplate();
      this.prevTransformTemplateValue = c ? c(this.latestValues, "") : void 0, this.updateSnapshot(), o && this.notifyListeners("willUpdate");
    }
    update() {
      if (this.updateScheduled = !1, this.isUpdateBlocked()) {
        const l = this.updateBlockedByResize;
        this.unblockUpdate(), this.updateBlockedByResize = !1, this.clearAllSnapshots(), l && this.nodes.forEach(P4), this.nodes.forEach(Ac);
        return;
      }
      if (this.animationId <= this.animationCommitId) {
        this.nodes.forEach(jc);
        return;
      }
      this.animationCommitId = this.animationId, this.isUpdating ? (this.isUpdating = !1, this.nodes.forEach(k4), this.nodes.forEach(N4), this.nodes.forEach(D4), this.nodes.forEach(C4)) : this.nodes.forEach(jc), this.clearAllSnapshots();
      const s = Ie.now();
      Se.delta = yt(0, 1e3 / 60, s - Se.timestamp), Se.timestamp = s, Se.isProcessing = !0, eo.update.process(Se), eo.preRender.process(Se), eo.render.process(Se), Se.isProcessing = !1;
    }
    didUpdate() {
      this.updateScheduled || (this.updateScheduled = !0, hl.read(this.scheduleUpdate));
    }
    clearAllSnapshots() {
      this.nodes.forEach(T4), this.sharedNodes.forEach(R4);
    }
    scheduleUpdateProjection() {
      this.projectionUpdateScheduled || (this.projectionUpdateScheduled = !0, ue.preRender(this.updateProjection, !1, !0));
    }
    scheduleCheckAfterUnmount() {
      ue.postRender(() => {
        this.isLayoutDirty ? this.root.didUpdate() : this.root.checkUpdateFailed();
      });
    }
    /**
     * Update measurements
     */
    updateSnapshot() {
      this.snapshot || !this.instance || (this.snapshot = this.measure(), this.snapshot && !Ve(this.snapshot.measuredBox.x) && !Ve(this.snapshot.measuredBox.y) && (this.snapshot = void 0));
    }
    updateLayout() {
      if (!this.instance || (this.updateScroll(), !(this.options.alwaysMeasureLayout && this.isLead()) && !this.isLayoutDirty))
        return;
      if (this.resumeFrom && !this.resumeFrom.instance)
        for (let l = 0; l < this.path.length; l++)
          this.path[l].updateScroll();
      const o = this.layout;
      this.layout = this.measure(!1), this.layoutVersion++, this.layoutCorrected || (this.layoutCorrected = ve()), this.isLayoutDirty = !1, this.projectionDelta = void 0, this.notifyListeners("measure", this.layout.layoutBox);
      const { visualElement: s } = this.options;
      s && s.notify("LayoutMeasure", this.layout.layoutBox, o ? o.layoutBox : void 0);
    }
    updateScroll(o = "measure") {
      let s = !!(this.options.layoutScroll && this.instance);
      if (this.scroll && this.scroll.animationId === this.root.animationId && this.scroll.phase === o && (s = !1), s && this.instance) {
        const l = r(this.instance);
        this.scroll = {
          animationId: this.root.animationId,
          phase: o,
          isRoot: l,
          offset: n(this.instance),
          wasRoot: this.scroll ? this.scroll.isRoot : l
        };
      }
    }
    resetTransform() {
      if (!a)
        return;
      const o = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout, s = this.projectionDelta && !rh(this.projectionDelta), l = this.getTransformTemplate(), c = l ? l(this.latestValues, "") : void 0, d = c !== this.prevTransformTemplateValue;
      o && this.instance && (s || Zt(this.latestValues) || d) && (a(this.instance, c), this.shouldResetTransform = !1, this.scheduleRender());
    }
    measure(o = !0) {
      const s = this.measurePageBox();
      let l = this.removeElementScroll(s);
      return o && (l = this.removeTransform(l)), L4(l), {
        animationId: this.root.animationId,
        measuredBox: s,
        layoutBox: l,
        latestValues: {},
        source: this.id
      };
    }
    measurePageBox() {
      const { visualElement: o } = this.options;
      if (!o)
        return ve();
      const s = o.measureViewportBox();
      if (!(this.scroll?.wasRoot || this.path.some(F4))) {
        const { scroll: c } = this.root;
        c && (gt(s.x, c.offset.x), gt(s.y, c.offset.y));
      }
      return s;
    }
    removeElementScroll(o) {
      const s = ve();
      if (et(s, o), this.scroll?.wasRoot)
        return s;
      for (let l = 0; l < this.path.length; l++) {
        const c = this.path[l], { scroll: d, options: f } = c;
        c !== this.root && d && f.layoutScroll && (d.wasRoot && et(s, o), gt(s.x, d.offset.x), gt(s.y, d.offset.y));
      }
      return s;
    }
    applyTransform(o, s = !1, l) {
      const c = l || ve();
      et(c, o);
      for (let d = 0; d < this.path.length; d++) {
        const f = this.path[d];
        !s && f.options.layoutScroll && f.scroll && f !== f.root && (gt(c.x, -f.scroll.offset.x), gt(c.y, -f.scroll.offset.y)), Zt(f.latestValues) && La(c, f.latestValues, f.layout?.layoutBox);
      }
      return Zt(this.latestValues) && La(c, this.latestValues, this.layout?.layoutBox), c;
    }
    removeTransform(o) {
      const s = ve();
      et(s, o);
      for (let l = 0; l < this.path.length; l++) {
        const c = this.path[l];
        if (!Zt(c.latestValues))
          continue;
        let d;
        c.instance && (cs(c.latestValues) && c.updateSnapshot(), d = ve(), et(d, c.measurePageBox())), $c(s, c.latestValues, c.snapshot?.layoutBox, d);
      }
      return Zt(this.latestValues) && $c(s, this.latestValues), s;
    }
    setTargetDelta(o) {
      this.targetDelta = o, this.root.scheduleUpdateProjection(), this.isProjectionDirty = !0;
    }
    setOptions(o) {
      this.options = {
        ...this.options,
        ...o,
        crossfade: o.crossfade !== void 0 ? o.crossfade : !0
      };
    }
    clearMeasurements() {
      this.scroll = void 0, this.layout = void 0, this.snapshot = void 0, this.prevTransformTemplateValue = void 0, this.targetDelta = void 0, this.target = void 0, this.isLayoutDirty = !1;
    }
    forceRelativeParentToResolveTarget() {
      this.relativeParent && this.relativeParent.resolvedRelativeTargetAt !== Se.timestamp && this.relativeParent.resolveTargetDelta(!0);
    }
    resolveTargetDelta(o = !1) {
      const s = this.getLead();
      this.isProjectionDirty || (this.isProjectionDirty = s.isProjectionDirty), this.isTransformDirty || (this.isTransformDirty = s.isTransformDirty), this.isSharedProjectionDirty || (this.isSharedProjectionDirty = s.isSharedProjectionDirty);
      const l = !!this.resumingFrom || this !== s;
      if (!(o || l && this.isSharedProjectionDirty || this.isProjectionDirty || this.parent?.isProjectionDirty || this.attemptToResolveRelativeTarget || this.root.updateBlockedByResize))
        return;
      const { layout: d, layoutId: f } = this.options;
      if (!this.layout || !(d || f))
        return;
      this.resolvedRelativeTargetAt = Se.timestamp;
      const m = this.getClosestProjectingParent();
      m && this.linkedParentVersion !== m.layoutVersion && !m.options.layoutRoot && this.removeRelativeTarget(), !this.targetDelta && !this.relativeTarget && (this.options.layoutAnchor !== !1 && m && m.layout ? this.createRelativeTarget(m, this.layout.layoutBox, m.layout.layoutBox) : this.removeRelativeTarget()), !(!this.relativeTarget && !this.targetDelta) && (this.target || (this.target = ve(), this.targetWithTransforms = ve()), this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target ? (this.forceRelativeParentToResolveTarget(), s4(this.target, this.relativeTarget, this.relativeParent.target, this.options.layoutAnchor || void 0)) : this.targetDelta ? (this.resumingFrom ? this.applyTransform(this.layout.layoutBox, !1, this.target) : et(this.target, this.layout.layoutBox), Um(this.target, this.targetDelta)) : et(this.target, this.layout.layoutBox), this.attemptToResolveRelativeTarget && (this.attemptToResolveRelativeTarget = !1, this.options.layoutAnchor !== !1 && m && !!m.resumingFrom == !!this.resumingFrom && !m.options.layoutScroll && m.target && this.animationProgress !== 1 ? this.createRelativeTarget(m, this.target, m.target) : this.relativeParent = this.relativeTarget = void 0));
    }
    getClosestProjectingParent() {
      if (!(!this.parent || cs(this.parent.latestValues) || _m(this.parent.latestValues)))
        return this.parent.isProjecting() ? this.parent : this.parent.getClosestProjectingParent();
    }
    isProjecting() {
      return !!((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout);
    }
    createRelativeTarget(o, s, l) {
      this.relativeParent = o, this.linkedParentVersion = o.layoutVersion, this.forceRelativeParentToResolveTarget(), this.relativeTarget = ve(), this.relativeTargetOrigin = ve(), Ja(this.relativeTargetOrigin, s, l, this.options.layoutAnchor || void 0), et(this.relativeTarget, this.relativeTargetOrigin);
    }
    removeRelativeTarget() {
      this.relativeParent = this.relativeTarget = void 0;
    }
    calcProjection() {
      const o = this.getLead(), s = !!this.resumingFrom || this !== o;
      let l = !0;
      if ((this.isProjectionDirty || this.parent?.isProjectionDirty) && (l = !1), s && (this.isSharedProjectionDirty || this.isTransformDirty) && (l = !1), this.resolvedRelativeTargetAt === Se.timestamp && (l = !1), l)
        return;
      const { layout: c, layoutId: d } = this.options;
      if (this.isTreeAnimating = !!(this.parent && this.parent.isTreeAnimating || this.currentAnimation || this.pendingAnimation), this.isTreeAnimating || (this.targetDelta = this.relativeTarget = void 0), !this.layout || !(c || d))
        return;
      et(this.layoutCorrected, this.layout.layoutBox);
      const f = this.treeScale.x, m = this.treeScale.y;
      V1(this.layoutCorrected, this.treeScale, this.path, s), o.layout && !o.target && (this.treeScale.x !== 1 || this.treeScale.y !== 1) && (o.target = o.layout.layoutBox, o.targetWithTransforms = ve());
      const { target: h } = o;
      if (!h) {
        this.prevProjectionDelta && (this.createProjectionDeltas(), this.scheduleRender());
        return;
      }
      !this.projectionDelta || !this.prevProjectionDelta ? this.createProjectionDeltas() : (gc(this.prevProjectionDelta.x, this.projectionDelta.x), gc(this.prevProjectionDelta.y, this.projectionDelta.y)), xr(this.projectionDelta, this.layoutCorrected, h, this.latestValues), (this.treeScale.x !== f || this.treeScale.y !== m || !Tc(this.projectionDelta.x, this.prevProjectionDelta.x) || !Tc(this.projectionDelta.y, this.prevProjectionDelta.y)) && (this.hasProjected = !0, this.scheduleRender(), this.notifyListeners("projectionUpdate", h));
    }
    hide() {
      this.isVisible = !1;
    }
    show() {
      this.isVisible = !0;
    }
    scheduleRender(o = !0) {
      if (this.options.visualElement?.scheduleRender(), o) {
        const s = this.getStack();
        s && s.scheduleRender();
      }
      this.resumingFrom && !this.resumingFrom.instance && (this.resumingFrom = void 0);
    }
    createProjectionDeltas() {
      this.prevProjectionDelta = kn(), this.projectionDelta = kn(), this.projectionDeltaWithTransform = kn();
    }
    setAnimationOrigin(o, s = !1) {
      const l = this.snapshot, c = l ? l.latestValues : {}, d = { ...this.latestValues }, f = kn();
      (!this.relativeParent || !this.relativeParent.options.layoutRoot) && (this.relativeTarget = this.relativeTargetOrigin = void 0), this.attemptToResolveRelativeTarget = !s;
      const m = ve(), h = l ? l.source : void 0, p = this.layout ? this.layout.source : void 0, g = h !== p, v = this.getStack(), b = !v || v.members.length <= 1, x = !!(g && !b && this.options.crossfade === !0 && !this.path.some(V4));
      this.animationProgress = 0;
      let C;
      this.mixTargetDelta = (w) => {
        const E = w / 1e3;
        Rc(f.x, o.x, E), Rc(f.y, o.y, E), this.setTargetDelta(f), this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout && (Ja(m, this.layout.layoutBox, this.relativeParent.layout.layoutBox, this.options.layoutAnchor || void 0), I4(this.relativeTarget, this.relativeTargetOrigin, m, E), C && d4(this.relativeTarget, C) && (this.isProjectionDirty = !1), C || (C = ve()), et(C, this.relativeTarget)), g && (this.animationValues = d, h4(d, c, this.latestValues, E, x, b)), this.root.scheduleUpdateProjection(), this.scheduleRender(), this.animationProgress = E;
      }, this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0);
    }
    startAnimation(o) {
      this.notifyListeners("animationStart"), this.currentAnimation?.stop(), this.resumingFrom?.currentAnimation?.stop(), this.pendingAnimation && (Et(this.pendingAnimation), this.pendingAnimation = void 0), this.pendingAnimation = ue.update(() => {
        Oa.hasAnimatedSinceResize = !0, this.motionValue || (this.motionValue = Ht(0)), this.motionValue.jump(0, !1), this.currentAnimation = sh(this.motionValue, [0, 1e3], {
          ...o,
          velocity: 0,
          isSync: !0,
          onUpdate: (s) => {
            this.mixTargetDelta(s), o.onUpdate && o.onUpdate(s);
          },
          onStop: () => {
          },
          onComplete: () => {
            o.onComplete && o.onComplete(), this.completeAnimation();
          }
        }), this.resumingFrom && (this.resumingFrom.currentAnimation = this.currentAnimation), this.pendingAnimation = void 0;
      });
    }
    completeAnimation() {
      this.resumingFrom && (this.resumingFrom.currentAnimation = void 0, this.resumingFrom.preserveOpacity = void 0);
      const o = this.getStack();
      o && o.exitAnimationComplete(), this.resumingFrom = this.currentAnimation = this.animationValues = void 0, this.notifyListeners("animationComplete");
    }
    finishAnimation() {
      this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta(w4), this.currentAnimation.stop()), this.completeAnimation();
    }
    applyTransformsToTarget() {
      const o = this.getLead();
      let { targetWithTransforms: s, target: l, layout: c, latestValues: d } = o;
      if (!(!s || !l || !c)) {
        if (this !== o && this.layout && c && ch(this.options.animationType, this.layout.layoutBox, c.layoutBox)) {
          l = this.target || ve();
          const f = Ve(this.layout.layoutBox.x);
          l.x.min = o.target.x.min, l.x.max = l.x.min + f;
          const m = Ve(this.layout.layoutBox.y);
          l.y.min = o.target.y.min, l.y.max = l.y.min + m;
        }
        et(s, l), La(s, d), xr(this.projectionDeltaWithTransform, this.layoutCorrected, s, d);
      }
    }
    registerSharedNode(o, s) {
      this.sharedNodes.has(o) || this.sharedNodes.set(o, new x4()), this.sharedNodes.get(o).add(s);
      const c = s.options.initialPromotionConfig;
      s.promote({
        transition: c ? c.transition : void 0,
        preserveFollowOpacity: c && c.shouldPreserveFollowOpacity ? c.shouldPreserveFollowOpacity(s) : void 0
      });
    }
    isLead() {
      const o = this.getStack();
      return o ? o.lead === this : !0;
    }
    getLead() {
      const { layoutId: o } = this.options;
      return o ? this.getStack()?.lead || this : this;
    }
    getPrevLead() {
      const { layoutId: o } = this.options;
      return o ? this.getStack()?.prevLead : void 0;
    }
    getStack() {
      const { layoutId: o } = this.options;
      if (o)
        return this.root.sharedNodes.get(o);
    }
    promote({ needsReset: o, transition: s, preserveFollowOpacity: l } = {}) {
      const c = this.getStack();
      c && c.promote(this, l), o && (this.projectionDelta = void 0, this.needsReset = !0), s && this.setOptions({ transition: s });
    }
    relegate() {
      const o = this.getStack();
      return o ? o.relegate(this) : !1;
    }
    resetSkewAndRotation() {
      const { visualElement: o } = this.options;
      if (!o)
        return;
      let s = !1;
      const { latestValues: l } = o;
      if ((l.z || l.rotate || l.rotateX || l.rotateY || l.rotateZ || l.skewX || l.skewY) && (s = !0), !s)
        return;
      const c = {};
      l.z && co("z", o, c, this.animationValues);
      for (let d = 0; d < uo.length; d++)
        co(`rotate${uo[d]}`, o, c, this.animationValues), co(`skew${uo[d]}`, o, c, this.animationValues);
      o.render();
      for (const d in c)
        o.setStaticValue(d, c[d]), this.animationValues && (this.animationValues[d] = c[d]);
      o.scheduleRender();
    }
    applyProjectionStyles(o, s) {
      if (!this.instance || this.isSVG)
        return;
      if (!this.isVisible) {
        o.visibility = "hidden";
        return;
      }
      const l = this.getTransformTemplate();
      if (this.needsReset) {
        this.needsReset = !1, o.visibility = "", o.opacity = "", o.pointerEvents = Fa(s?.pointerEvents) || "", o.transform = l ? l(this.latestValues, "") : "none";
        return;
      }
      const c = this.getLead();
      if (!this.projectionDelta || !this.layout || !c.target) {
        this.options.layoutId && (o.opacity = this.latestValues.opacity !== void 0 ? this.latestValues.opacity : 1, o.pointerEvents = Fa(s?.pointerEvents) || ""), this.hasProjected && !Zt(this.latestValues) && (o.transform = l ? l({}, "") : "none", this.hasProjected = !1);
        return;
      }
      o.visibility = "";
      const d = c.animationValues || c.latestValues;
      this.applyTransformsToTarget();
      let f = f4(this.projectionDeltaWithTransform, this.treeScale, d);
      l && (f = l(d, f)), o.transform = f;
      const { x: m, y: h } = this.projectionDelta;
      o.transformOrigin = `${m.origin * 100}% ${h.origin * 100}% 0`, c.animationValues ? o.opacity = c === this ? d.opacity ?? this.latestValues.opacity ?? 1 : this.preserveOpacity ? this.latestValues.opacity : d.opacityExit : o.opacity = c === this ? d.opacity !== void 0 ? d.opacity : "" : d.opacityExit !== void 0 ? d.opacityExit : 0;
      for (const p in fs) {
        if (d[p] === void 0)
          continue;
        const { correct: g, applyTo: v, isCSSVariable: b } = fs[p], x = f === "none" ? d[p] : g(d[p], c);
        if (v) {
          const C = v.length;
          for (let w = 0; w < C; w++)
            o[v[w]] = x;
        } else
          b ? this.options.visualElement.renderState.vars[p] = x : o[p] = x;
      }
      this.options.layoutId && (o.pointerEvents = c === this ? Fa(s?.pointerEvents) || "" : "none");
    }
    clearSnapshot() {
      this.resumeFrom = this.snapshot = void 0;
    }
    // Only run on root
    resetTree() {
      this.root.nodes.forEach((o) => o.currentAnimation?.stop()), this.root.nodes.forEach(Ac), this.root.sharedNodes.clear();
    }
  };
}
function D4(e) {
  e.updateLayout();
}
function C4(e) {
  const t = e.resumeFrom?.snapshot || e.snapshot;
  if (e.isLead() && e.layout && t && e.hasListeners("didUpdate")) {
    const { layoutBox: n, measuredBox: r } = e.layout, { animationType: a } = e.options, i = t.source !== e.layout.source;
    if (a === "size")
      mt((d) => {
        const f = i ? t.measuredBox[d] : t.layoutBox[d], m = Ve(f);
        f.min = n[d].min, f.max = f.min + m;
      });
    else if (a === "x" || a === "y") {
      const d = a === "x" ? "y" : "x";
      ms(i ? t.measuredBox[d] : t.layoutBox[d], n[d]);
    } else ch(a, t.layoutBox, n) && mt((d) => {
      const f = i ? t.measuredBox[d] : t.layoutBox[d], m = Ve(n[d]);
      f.max = f.min + m, e.relativeTarget && !e.currentAnimation && (e.isProjectionDirty = !0, e.relativeTarget[d].max = e.relativeTarget[d].min + m);
    });
    const o = kn();
    xr(o, n, t.layoutBox);
    const s = kn();
    i ? xr(s, e.applyTransform(r, !0), t.measuredBox) : xr(s, n, t.layoutBox);
    const l = !rh(o);
    let c = !1;
    if (!e.resumeFrom) {
      const d = e.getClosestProjectingParent();
      if (d && !d.resumeFrom) {
        const { snapshot: f, layout: m } = d;
        if (f && m) {
          const h = e.options.layoutAnchor || void 0, p = ve();
          Ja(p, t.layoutBox, f.layoutBox, h);
          const g = ve();
          Ja(g, n, m.layoutBox, h), ah(p, g) || (c = !0), d.options.layoutRoot && (e.relativeTarget = g, e.relativeTargetOrigin = p, e.relativeParent = d);
        }
      }
    }
    e.notifyListeners("didUpdate", {
      layout: n,
      snapshot: t,
      delta: s,
      layoutDelta: o,
      hasLayoutChanged: l,
      hasRelativeLayoutChanged: c
    });
  } else if (e.isLead()) {
    const { onExitComplete: n } = e.options;
    n && n();
  }
  e.options.transition = void 0;
}
function E4(e) {
  e.parent && (e.isProjecting() || (e.isProjectionDirty = e.parent.isProjectionDirty), e.isSharedProjectionDirty || (e.isSharedProjectionDirty = !!(e.isProjectionDirty || e.parent.isProjectionDirty || e.parent.isSharedProjectionDirty)), e.isTransformDirty || (e.isTransformDirty = e.parent.isTransformDirty));
}
function S4(e) {
  e.isProjectionDirty = e.isSharedProjectionDirty = e.isTransformDirty = !1;
}
function T4(e) {
  e.clearSnapshot();
}
function Ac(e) {
  e.clearMeasurements();
}
function P4(e) {
  e.isLayoutDirty = !0, e.updateLayout();
}
function jc(e) {
  e.isLayoutDirty = !1;
}
function k4(e) {
  e.isAnimationBlocked && e.layout && !e.isLayoutDirty && (e.snapshot = e.layout, e.isLayoutDirty = !0);
}
function N4(e) {
  const { visualElement: t } = e.options;
  t && t.getProps().onBeforeLayoutMeasure && t.notify("BeforeLayoutMeasure"), e.resetTransform();
}
function Mc(e) {
  e.finishAnimation(), e.targetDelta = e.relativeTarget = e.target = void 0, e.isProjectionDirty = !0;
}
function A4(e) {
  e.resolveTargetDelta();
}
function j4(e) {
  e.calcProjection();
}
function M4(e) {
  e.resetSkewAndRotation();
}
function R4(e) {
  e.removeLeadSnapshot();
}
function Rc(e, t, n) {
  e.translate = ce(t.translate, 0, n), e.scale = ce(t.scale, 1, n), e.origin = t.origin, e.originPoint = t.originPoint;
}
function Ic(e, t, n, r) {
  e.min = ce(t.min, n.min, r), e.max = ce(t.max, n.max, r);
}
function I4(e, t, n, r) {
  Ic(e.x, t.x, n.x, r), Ic(e.y, t.y, n.y, r);
}
function V4(e) {
  return e.animationValues && e.animationValues.opacityExit !== void 0;
}
const B4 = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1]
}, Vc = (e) => typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().includes(e), Bc = Vc("applewebkit/") && !Vc("chrome/") ? Math.round : Je;
function Lc(e) {
  e.min = Bc(e.min), e.max = Bc(e.max);
}
function L4(e) {
  Lc(e.x), Lc(e.y);
}
function ch(e, t, n) {
  return e === "position" || e === "preserve-aspect" && !o4(Sc(t), Sc(n), 0.2);
}
function F4(e) {
  return e !== e.root && e.scroll?.wasRoot;
}
const O4 = uh({
  attachResizeListener: (e, t) => Mr(e, "resize", t),
  measureScroll: () => ({
    x: document.documentElement.scrollLeft || document.body?.scrollLeft || 0,
    y: document.documentElement.scrollTop || document.body?.scrollTop || 0
  }),
  checkIsScrollRoot: () => !0
}), fo = {
  current: void 0
}, dh = uh({
  measureScroll: (e) => ({
    x: e.scrollLeft,
    y: e.scrollTop
  }),
  defaultParent: () => {
    if (!fo.current) {
      const e = new O4({});
      e.mount(window), e.setOptions({ layoutScroll: !0 }), fo.current = e;
    }
    return fo.current;
  },
  resetTransform: (e, t) => {
    e.style.transform = t !== void 0 ? t : "none";
  },
  checkIsScrollRoot: (e) => window.getComputedStyle(e).position === "fixed"
}), Zr = fe({
  transformPagePoint: (e) => e,
  isStatic: !1,
  reducedMotion: "never"
});
function Fc(e, t) {
  if (typeof e == "function")
    return e(t);
  e != null && (e.current = t);
}
function z4(...e) {
  return (t) => {
    let n = !1;
    const r = e.map((a) => {
      const i = Fc(a, t);
      return !n && typeof i == "function" && (n = !0), i;
    });
    if (n)
      return () => {
        for (let a = 0; a < r.length; a++) {
          const i = r[a];
          typeof i == "function" ? i() : Fc(e[a], null);
        }
      };
  };
}
function _4(...e) {
  return R.useCallback(z4(...e), e);
}
class U4 extends R.Component {
  getSnapshotBeforeUpdate(t) {
    const n = this.props.childRef.current;
    if (Ma(n) && t.isPresent && !this.props.isPresent && this.props.pop !== !1) {
      const r = n.offsetParent, a = Ma(r) && r.offsetWidth || 0, i = Ma(r) && r.offsetHeight || 0, o = getComputedStyle(n), s = this.props.sizeRef.current;
      s.height = parseFloat(o.height), s.width = parseFloat(o.width), s.top = n.offsetTop, s.left = n.offsetLeft, s.right = a - s.width - s.left, s.bottom = i - s.height - s.top;
    }
    return null;
  }
  /**
   * Required with getSnapshotBeforeUpdate to stop React complaining.
   */
  componentDidUpdate() {
  }
  render() {
    return this.props.children;
  }
}
function H4({ children: e, isPresent: t, anchorX: n, anchorY: r, root: a, pop: i }) {
  const o = Kr(), s = B(null), l = B({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }), { nonce: c } = ee(Zr), d = e.props?.ref ?? e?.ref, f = _4(s, d);
  return pi(() => {
    const { width: m, height: h, top: p, left: g, right: v, bottom: b } = l.current;
    if (t || i === !1 || !s.current || !m || !h)
      return;
    const x = n === "left" ? `left: ${g}` : `right: ${v}`, C = r === "bottom" ? `bottom: ${b}` : `top: ${p}`;
    s.current.dataset.motionPopId = o;
    const w = document.createElement("style");
    c && (w.nonce = c);
    const E = a ?? document.head;
    return E.appendChild(w), w.sheet && w.sheet.insertRule(`
          [data-motion-pop-id="${o}"] {
            position: absolute !important;
            width: ${m}px !important;
            height: ${h}px !important;
            ${x}px !important;
            ${C}px !important;
          }
        `), () => {
      s.current?.removeAttribute("data-motion-pop-id"), E.contains(w) && E.removeChild(w);
    };
  }, [t]), u.jsx(U4, { isPresent: t, childRef: s, sizeRef: l, pop: i, children: i === !1 ? e : R.cloneElement(e, { ref: f }) });
}
const K4 = ({ children: e, initial: t, isPresent: n, onExitComplete: r, custom: a, presenceAffectsLayout: i, mode: o, anchorX: s, anchorY: l, root: c }) => {
  const d = rn(W4), f = Kr();
  let m = !0, h = F(() => (m = !1, {
    id: f,
    initial: t,
    isPresent: n,
    custom: a,
    onExitComplete: (p) => {
      d.set(p, !0);
      for (const g of d.values())
        if (!g)
          return;
      r && r();
    },
    register: (p) => (d.set(p, !1), () => d.delete(p))
  }), [n, d, r]);
  return i && m && (h = { ...h }), F(() => {
    d.forEach((p, g) => d.set(g, !1));
  }, [n]), R.useEffect(() => {
    !n && !d.size && r && r();
  }, [n]), e = u.jsx(H4, { pop: o === "popLayout", isPresent: n, anchorX: s, anchorY: l, root: c, children: e }), u.jsx(wi.Provider, { value: h, children: e });
};
function W4() {
  return /* @__PURE__ */ new Map();
}
function fh(e = !0) {
  const t = ee(wi);
  if (t === null)
    return [!0, null];
  const { isPresent: n, onExitComplete: r, register: a } = t, i = Kr();
  U(() => {
    if (e)
      return a(i);
  }, [e]);
  const o = G(() => e && r && r(i), [i, r, e]);
  return !n && r ? [!1, o] : [!0];
}
const va = (e) => e.key || "";
function Oc(e) {
  const t = [];
  return ob.forEach(e, (n) => {
    $f(n) && t.push(n);
  }), t;
}
const G4 = ({ children: e, custom: t, initial: n = !0, onExitComplete: r, presenceAffectsLayout: a = !0, mode: i = "sync", propagate: o = !1, anchorX: s = "left", anchorY: l = "top", root: c }) => {
  const [d, f] = fh(o), m = F(() => Oc(e), [e]), h = o && !d ? [] : m.map(va), p = B(!0), g = B(m), v = rn(() => /* @__PURE__ */ new Map()), b = B(/* @__PURE__ */ new Set()), [x, C] = _(m), [w, E] = _(m);
  Ys(() => {
    p.current = !1, g.current = m;
    for (let P = 0; P < w.length; P++) {
      const j = va(w[P]);
      h.includes(j) ? (v.delete(j), b.current.delete(j)) : v.get(j) !== !0 && v.set(j, !1);
    }
  }, [w, h.length, h.join("-")]);
  const k = [];
  if (m !== x) {
    let P = [...m];
    for (let j = 0; j < w.length; j++) {
      const T = w[j], M = va(T);
      h.includes(M) || (P.splice(j, 0, T), k.push(T));
    }
    return i === "wait" && k.length && (P = k), E(Oc(P)), C(m), null;
  }
  process.env.NODE_ENV !== "production" && i === "wait" && w.length > 1 && console.warn(`You're attempting to animate multiple children within AnimatePresence, but its mode is set to "wait". This will lead to odd visual behaviour.`);
  const { forceRender: A } = ee(Gs);
  return u.jsx(u.Fragment, { children: w.map((P) => {
    const j = va(P), T = o && !d ? !1 : m === w || h.includes(j), M = () => {
      if (b.current.has(j))
        return;
      if (v.has(j))
        b.current.add(j), v.set(j, !0);
      else
        return;
      let L = !0;
      v.forEach((O) => {
        O || (L = !1);
      }), L && (A?.(), E(g.current), o && f?.(), r && r());
    };
    return u.jsx(K4, { isPresent: T, initial: !p.current || n ? void 0 : !1, custom: t, presenceAffectsLayout: a, mode: i, root: c, onExitComplete: T ? void 0 : M, anchorX: s, anchorY: l, children: P }, j);
  }) });
}, mh = fe({ strict: !1 }), zc = {
  animation: [
    "animate",
    "variants",
    "whileHover",
    "whileTap",
    "exit",
    "whileInView",
    "whileFocus",
    "whileDrag"
  ],
  exit: ["exit"],
  drag: ["drag", "dragControls"],
  focus: ["whileFocus"],
  hover: ["whileHover", "onHoverStart", "onHoverEnd"],
  tap: ["whileTap", "onTap", "onTapStart", "onTapCancel"],
  pan: ["onPan", "onPanStart", "onPanSessionStart", "onPanEnd"],
  inView: ["whileInView", "onViewportEnter", "onViewportLeave"],
  layout: ["layout", "layoutId"]
};
let _c = !1;
function Y4() {
  if (_c)
    return;
  const e = {};
  for (const t in zc)
    e[t] = {
      isEnabled: (n) => zc[t].some((r) => !!n[r])
    };
  Lm(e), _c = !0;
}
function hh() {
  return Y4(), M1();
}
function q4(e) {
  const t = hh();
  for (const n in e)
    t[n] = {
      ...t[n],
      ...e[n]
    };
  Lm(t);
}
const Z4 = /* @__PURE__ */ new Set([
  "animate",
  "exit",
  "variants",
  "initial",
  "style",
  "values",
  "variants",
  "transition",
  "transformTemplate",
  "custom",
  "inherit",
  "onBeforeLayoutMeasure",
  "onAnimationStart",
  "onAnimationComplete",
  "onUpdate",
  "onDragStart",
  "onDrag",
  "onDragEnd",
  "onMeasureDragConstraints",
  "onDirectionLock",
  "onDragTransitionEnd",
  "_dragX",
  "_dragY",
  "onHoverStart",
  "onHoverEnd",
  "onViewportEnter",
  "onViewportLeave",
  "globalTapTarget",
  "propagate",
  "ignoreStrict",
  "viewport"
]);
function Qa(e) {
  return e.startsWith("while") || e.startsWith("drag") && e !== "draggable" || e.startsWith("layout") || e.startsWith("onTap") || e.startsWith("onPan") || e.startsWith("onLayout") || Z4.has(e);
}
let ph = (e) => !Qa(e);
function X4(e) {
  typeof e == "function" && (ph = (t) => t.startsWith("on") ? !Qa(t) : e(t));
}
try {
  X4(require("@emotion/is-prop-valid").default);
} catch {
}
function J4(e, t, n) {
  const r = {};
  for (const a in e)
    a === "values" && typeof e.values == "object" || ge(e[a]) || (ph(a) || n === !0 && Qa(a) || !t && !Qa(a) || // If trying to use native HTML drag events, forward drag listeners
    e.draggable && a.startsWith("onDrag")) && (r[a] = e[a]);
  return r;
}
const Ti = /* @__PURE__ */ fe({});
function Q4(e, t) {
  if (Si(e)) {
    const { initial: n, animate: r } = e;
    return {
      initial: n === !1 || jr(n) ? n : void 0,
      animate: jr(r) ? r : void 0
    };
  }
  return e.inherit !== !1 ? t : {};
}
function e3(e) {
  const { initial: t, animate: n } = Q4(e, ee(Ti));
  return F(() => ({ initial: t, animate: n }), [Uc(t), Uc(n)]);
}
function Uc(e) {
  return Array.isArray(e) ? e.join(" ") : e;
}
const xl = () => ({
  style: {},
  transform: {},
  transformOrigin: {},
  vars: {}
});
function gh(e, t, n) {
  for (const r in t)
    !ge(t[r]) && !Wm(r, n) && (e[r] = t[r]);
}
function t3({ transformTemplate: e }, t) {
  return F(() => {
    const n = xl();
    return bl(n, t, e), Object.assign({}, n.vars, n.style);
  }, [t]);
}
function n3(e, t) {
  const n = e.style || {}, r = {};
  return gh(r, n, e), Object.assign(r, t3(e, t)), r;
}
function r3(e, t) {
  const n = {}, r = n3(e, t);
  return e.drag && e.dragListener !== !1 && (n.draggable = !1, r.userSelect = r.WebkitUserSelect = r.WebkitTouchCallout = "none", r.touchAction = e.drag === !0 ? "none" : `pan-${e.drag === "x" ? "y" : "x"}`), e.tabIndex === void 0 && (e.onTap || e.onTapStart || e.whileTap) && (n.tabIndex = 0), n.style = r, n;
}
const vh = () => ({
  ...xl(),
  attrs: {}
});
function a3(e, t, n, r) {
  const a = F(() => {
    const i = vh();
    return Ym(i, t, Zm(r), e.transformTemplate, e.style), {
      ...i.attrs,
      style: { ...i.style }
    };
  }, [t]);
  if (e.style) {
    const i = {};
    gh(i, e.style, e), a.style = { ...i, ...a.style };
  }
  return a;
}
const i3 = [
  "animate",
  "circle",
  "defs",
  "desc",
  "ellipse",
  "g",
  "image",
  "line",
  "filter",
  "marker",
  "mask",
  "metadata",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "rect",
  "stop",
  "switch",
  "symbol",
  "svg",
  "text",
  "tspan",
  "use",
  "view"
];
function wl(e) {
  return (
    /**
     * If it's not a string, it's a custom React component. Currently we only support
     * HTML custom React components.
     */
    typeof e != "string" || /**
     * If it contains a dash, the element is a custom HTML webcomponent.
     */
    e.includes("-") ? !1 : (
      /**
       * If it's in our list of lowercase SVG tags, it's an SVG component
       */
      !!(i3.indexOf(e) > -1 || /**
       * If it contains a capital letter, it's an SVG component
       */
      /[A-Z]/u.test(e))
    )
  );
}
function o3(e, t, n, { latestValues: r }, a, i = !1, o) {
  const l = (o ?? wl(e) ? a3 : r3)(t, r, a, e), c = J4(t, typeof e == "string", i), d = e !== gi ? { ...c, ...l, ref: n } : {}, { children: f } = t, m = F(() => ge(f) ? f.get() : f, [f]);
  return sb(e, {
    ...d,
    children: m
  });
}
function s3({ scrapeMotionValuesFromProps: e, createRenderState: t }, n, r, a) {
  return {
    latestValues: l3(n, r, a, e),
    renderState: t()
  };
}
function l3(e, t, n, r) {
  const a = {}, i = r(e, {});
  for (const m in i)
    a[m] = Fa(i[m]);
  let { initial: o, animate: s } = e;
  const l = Si(e), c = Vm(e);
  t && c && !l && e.inherit !== !1 && (o === void 0 && (o = t.initial), s === void 0 && (s = t.animate));
  let d = n ? n.initial === !1 : !1;
  d = d || o === !1;
  const f = d ? s : o;
  if (f && typeof f != "boolean" && !Ei(f)) {
    const m = Array.isArray(f) ? f : [f];
    for (let h = 0; h < m.length; h++) {
      const p = cl(e, m[h]);
      if (p) {
        const { transitionEnd: g, transition: v, ...b } = p;
        for (const x in b) {
          let C = b[x];
          if (Array.isArray(C)) {
            const w = d ? C.length - 1 : 0;
            C = C[w];
          }
          C !== null && (a[x] = C);
        }
        for (const x in g)
          a[x] = g[x];
      }
    }
  }
  return a;
}
const bh = (e) => (t, n) => {
  const r = ee(Ti), a = ee(wi), i = () => s3(e, t, r, a);
  return n ? i() : rn(i);
}, u3 = /* @__PURE__ */ bh({
  scrapeMotionValuesFromProps: yl,
  createRenderState: xl
}), c3 = /* @__PURE__ */ bh({
  scrapeMotionValuesFromProps: Xm,
  createRenderState: vh
}), d3 = Symbol.for("motionComponentSymbol");
function f3(e, t, n) {
  const r = B(n);
  pi(() => {
    r.current = n;
  });
  const a = B(null);
  return G((i) => {
    i && e.onMount?.(i);
    const o = r.current;
    if (typeof o == "function")
      if (i) {
        const s = o(i);
        typeof s == "function" && (a.current = s);
      } else a.current ? (a.current(), a.current = null) : o(i);
    else o && (o.current = i);
    t && (i ? t.mount(i) : t.unmount());
  }, [t]);
}
const yh = fe({});
function En(e) {
  return e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "current");
}
function m3(e, t, n, r, a, i) {
  const { visualElement: o } = ee(Ti), s = ee(mh), l = ee(wi), c = ee(Zr), d = c.reducedMotion, f = c.skipAnimations, m = B(null), h = B(!1);
  r = r || s.renderer, !m.current && r && (m.current = r(e, {
    visualState: t,
    parent: o,
    props: n,
    presenceContext: l,
    blockInitialAnimation: l ? l.initial === !1 : !1,
    reducedMotionConfig: d,
    skipAnimations: f,
    isSVG: i
  }), h.current && m.current && (m.current.manuallyAnimateOnMount = !0));
  const p = m.current, g = ee(yh);
  p && !p.projection && a && (p.type === "html" || p.type === "svg") && h3(m.current, n, a, g);
  const v = B(!1);
  pi(() => {
    p && v.current && p.update(n, l);
  });
  const b = n[Cm], x = B(!!b && typeof window < "u" && !window.MotionHandoffIsComplete?.(b) && window.MotionHasOptimisedAnimation?.(b));
  return Ys(() => {
    h.current = !0, p && (v.current = !0, window.MotionIsMounted = !0, p.updateFeatures(), p.scheduleRenderMicrotask(), x.current && p.animationState && p.animationState.animateChanges());
  }), U(() => {
    p && (!x.current && p.animationState && p.animationState.animateChanges(), x.current && (queueMicrotask(() => {
      window.MotionHandoffMarkAsComplete?.(b);
    }), x.current = !1), p.enteringChildren = void 0);
  }), p;
}
function h3(e, t, n, r) {
  const { layoutId: a, layout: i, drag: o, dragConstraints: s, layoutScroll: l, layoutRoot: c, layoutAnchor: d, layoutCrossfade: f } = t;
  e.projection = new n(e.latestValues, t["data-framer-portal-id"] ? void 0 : xh(e.parent)), e.projection.setOptions({
    layoutId: a,
    layout: i,
    alwaysMeasureLayout: !!o || s && En(s),
    visualElement: e,
    /**
     * TODO: Update options in an effect. This could be tricky as it'll be too late
     * to update by the time layout animations run.
     * We also need to fix this safeToRemove by linking it up to the one returned by usePresence,
     * ensuring it gets called if there's no potential layout animations.
     *
     */
    animationType: typeof i == "string" ? i : "both",
    initialPromotionConfig: r,
    crossfade: f,
    layoutScroll: l,
    layoutRoot: c,
    layoutAnchor: d
  });
}
function xh(e) {
  if (e)
    return e.options.allowProjection !== !1 ? e.projection : xh(e.parent);
}
function mo(e, { forwardMotionProps: t = !1, type: n } = {}, r, a) {
  r && q4(r);
  const i = n ? n === "svg" : wl(e), o = i ? c3 : u3;
  function s(c, d) {
    let f;
    const m = {
      ...ee(Zr),
      ...c,
      layoutId: p3(c)
    }, { isStatic: h } = m, p = e3(c), g = o(c, h);
    if (!h && typeof window < "u") {
      g3(m, r);
      const v = v3(m);
      f = v.MeasureLayout, p.visualElement = m3(e, g, m, a, v.ProjectionNode, i);
    }
    return u.jsxs(Ti.Provider, { value: p, children: [f && p.visualElement ? u.jsx(f, { visualElement: p.visualElement, ...m }) : null, o3(e, c, f3(g, p.visualElement, d), g, h, t, i)] });
  }
  s.displayName = `motion.${typeof e == "string" ? e : `create(${e.displayName ?? e.name ?? ""})`}`;
  const l = ut(s);
  return l[d3] = e, l;
}
function p3({ layoutId: e }) {
  const t = ee(Gs).id;
  return t && e !== void 0 ? t + "-" + e : e;
}
function g3(e, t) {
  const n = ee(mh).strict;
  if (process.env.NODE_ENV !== "production" && t && n) {
    const r = "You have rendered a `motion` component within a `LazyMotion` component. This will break tree shaking. Import and render a `m` component instead.";
    e.ignoreStrict ? Gn(!1, r, "lazy-strict-mode") : at(!1, r, "lazy-strict-mode");
  }
}
function v3(e) {
  const t = hh(), { drag: n, layout: r } = t;
  if (!n && !r)
    return {};
  const a = { ...n, ...r };
  return {
    MeasureLayout: n?.isEnabled(e) || r?.isEnabled(e) ? a.MeasureLayout : void 0,
    ProjectionNode: a.ProjectionNode
  };
}
function b3(e, t) {
  if (typeof Proxy > "u")
    return mo;
  const n = /* @__PURE__ */ new Map(), r = (i, o) => mo(i, o, e, t), a = (i, o) => (process.env.NODE_ENV !== "production" && Xs(!1, "motion() is deprecated. Use motion.create() instead."), r(i, o));
  return new Proxy(a, {
    /**
     * Called when `motion` is referenced with a prop: `motion.div`, `motion.input` etc.
     * The prop name is passed through as `key` and we can use that to generate a `motion`
     * DOM component with that name.
     */
    get: (i, o) => o === "create" ? r : (n.has(o) || n.set(o, mo(o, void 0, e, t)), n.get(o))
  });
}
const y3 = (e, t) => t.isSVG ?? wl(e) ? new Jm(t) : new Gm(t, {
  allowProjection: e !== gi
});
class x3 extends Wt {
  /**
   * We dynamically generate the AnimationState manager as it contains a reference
   * to the underlying animation library. We only want to load that if we load this,
   * so people can optionally code split it out using the `m` component.
   */
  constructor(t) {
    super(t), t.animationState || (t.animationState = e4(t));
  }
  updateAnimationControlsSubscription() {
    const { animate: t } = this.node.getProps();
    Ei(t) && (this.unmountControls = t.subscribe(this.node));
  }
  /**
   * Subscribe any provided AnimationControls to the component's VisualElement
   */
  mount() {
    this.updateAnimationControlsSubscription();
  }
  update() {
    const { animate: t } = this.node.getProps(), { animate: n } = this.node.prevProps || {};
    t !== n && this.updateAnimationControlsSubscription();
  }
  unmount() {
    this.node.animationState.reset(), this.unmountControls?.();
  }
}
let w3 = 0;
class $3 extends Wt {
  constructor() {
    super(...arguments), this.id = w3++, this.isExitComplete = !1;
  }
  update() {
    if (!this.node.presenceContext)
      return;
    const { isPresent: t, onExitComplete: n } = this.node.presenceContext, { isPresent: r } = this.node.prevPresenceContext || {};
    if (!this.node.animationState || t === r)
      return;
    if (t && r === !1) {
      if (this.isExitComplete) {
        const { initial: i, custom: o } = this.node.getProps();
        if (typeof i == "string") {
          const s = nn(this.node, i, o);
          if (s) {
            const { transition: l, transitionEnd: c, ...d } = s;
            for (const f in d)
              this.node.getValue(f)?.jump(d[f]);
          }
        }
        this.node.animationState.reset(), this.node.animationState.animateChanges();
      } else
        this.node.animationState.setActive("exit", !1);
      this.isExitComplete = !1;
      return;
    }
    const a = this.node.animationState.setActive("exit", !t);
    n && !t && a.then(() => {
      this.isExitComplete = !0, n(this.id);
    });
  }
  mount() {
    const { register: t, onExitComplete: n } = this.node.presenceContext || {};
    n && n(this.id), t && (this.unmount = t(this.id));
  }
  unmount() {
  }
}
const D3 = {
  animation: {
    Feature: x3
  },
  exit: {
    Feature: $3
  }
};
function Xr(e) {
  return {
    point: {
      x: e.pageX,
      y: e.pageY
    }
  };
}
const C3 = (e) => (t) => pl(t) && e(t, Xr(t));
function wr(e, t, n, r) {
  return Mr(e, t, C3(n), r);
}
const wh = ({ current: e }) => e ? e.ownerDocument.defaultView : null, Hc = (e, t) => Math.abs(e - t);
function E3(e, t) {
  const n = Hc(e.x, t.x), r = Hc(e.y, t.y);
  return Math.sqrt(n ** 2 + r ** 2);
}
const Kc = /* @__PURE__ */ new Set(["auto", "scroll"]);
class $h {
  constructor(t, n, { transformPagePoint: r, contextWindow: a = window, dragSnapToOrigin: i = !1, distanceThreshold: o = 3, element: s } = {}) {
    if (this.startEvent = null, this.lastMoveEvent = null, this.lastMoveEventInfo = null, this.lastRawMoveEventInfo = null, this.handlers = {}, this.contextWindow = window, this.scrollPositions = /* @__PURE__ */ new Map(), this.removeScrollListeners = null, this.onElementScroll = (h) => {
      this.handleScroll(h.target);
    }, this.onWindowScroll = () => {
      this.handleScroll(window);
    }, this.updatePoint = () => {
      if (!(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      this.lastRawMoveEventInfo && (this.lastMoveEventInfo = ba(this.lastRawMoveEventInfo, this.transformPagePoint));
      const h = ho(this.lastMoveEventInfo, this.history), p = this.startEvent !== null, g = E3(h.offset, { x: 0, y: 0 }) >= this.distanceThreshold;
      if (!p && !g)
        return;
      const { point: v } = h, { timestamp: b } = Se;
      this.history.push({ ...v, timestamp: b });
      const { onStart: x, onMove: C } = this.handlers;
      p || (x && x(this.lastMoveEvent, h), this.startEvent = this.lastMoveEvent), C && C(this.lastMoveEvent, h);
    }, this.handlePointerMove = (h, p) => {
      this.lastMoveEvent = h, this.lastRawMoveEventInfo = p, this.lastMoveEventInfo = ba(p, this.transformPagePoint), ue.update(this.updatePoint, !0);
    }, this.handlePointerUp = (h, p) => {
      this.end();
      const { onEnd: g, onSessionEnd: v, resumeAnimation: b } = this.handlers;
      if ((this.dragSnapToOrigin || !this.startEvent) && b && b(), !(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const x = ho(h.type === "pointercancel" ? this.lastMoveEventInfo : ba(p, this.transformPagePoint), this.history);
      this.startEvent && g && g(h, x), v && v(h, x);
    }, !pl(t))
      return;
    this.dragSnapToOrigin = i, this.handlers = n, this.transformPagePoint = r, this.distanceThreshold = o, this.contextWindow = a || window;
    const l = Xr(t), c = ba(l, this.transformPagePoint), { point: d } = c, { timestamp: f } = Se;
    this.history = [{ ...d, timestamp: f }];
    const { onSessionStart: m } = n;
    m && m(t, ho(c, this.history)), this.removeListeners = Gr(wr(this.contextWindow, "pointermove", this.handlePointerMove), wr(this.contextWindow, "pointerup", this.handlePointerUp), wr(this.contextWindow, "pointercancel", this.handlePointerUp)), s && this.startScrollTracking(s);
  }
  /**
   * Start tracking scroll on ancestors and window.
   */
  startScrollTracking(t) {
    let n = t.parentElement;
    for (; n; ) {
      const r = getComputedStyle(n);
      (Kc.has(r.overflowX) || Kc.has(r.overflowY)) && this.scrollPositions.set(n, {
        x: n.scrollLeft,
        y: n.scrollTop
      }), n = n.parentElement;
    }
    this.scrollPositions.set(window, {
      x: window.scrollX,
      y: window.scrollY
    }), window.addEventListener("scroll", this.onElementScroll, {
      capture: !0
    }), window.addEventListener("scroll", this.onWindowScroll), this.removeScrollListeners = () => {
      window.removeEventListener("scroll", this.onElementScroll, {
        capture: !0
      }), window.removeEventListener("scroll", this.onWindowScroll);
    };
  }
  /**
   * Handle scroll compensation during drag.
   *
   * For element scroll: adjusts history origin since pageX/pageY doesn't change.
   * For window scroll: adjusts lastMoveEventInfo since pageX/pageY would change.
   */
  handleScroll(t) {
    const n = this.scrollPositions.get(t);
    if (!n)
      return;
    const r = t === window, a = r ? { x: window.scrollX, y: window.scrollY } : {
      x: t.scrollLeft,
      y: t.scrollTop
    }, i = { x: a.x - n.x, y: a.y - n.y };
    i.x === 0 && i.y === 0 || (r ? this.lastMoveEventInfo && (this.lastMoveEventInfo.point.x += i.x, this.lastMoveEventInfo.point.y += i.y) : this.history.length > 0 && (this.history[0].x -= i.x, this.history[0].y -= i.y), this.scrollPositions.set(t, a), ue.update(this.updatePoint, !0));
  }
  updateHandlers(t) {
    this.handlers = t;
  }
  end() {
    this.removeListeners && this.removeListeners(), this.removeScrollListeners && this.removeScrollListeners(), this.scrollPositions.clear(), Et(this.updatePoint);
  }
}
function ba(e, t) {
  return t ? { point: t(e.point) } : e;
}
function Wc(e, t) {
  return { x: e.x - t.x, y: e.y - t.y };
}
function ho({ point: e }, t) {
  return {
    point: e,
    delta: Wc(e, Dh(t)),
    offset: Wc(e, S3(t)),
    velocity: T3(t, 0.1)
  };
}
function S3(e) {
  return e[0];
}
function Dh(e) {
  return e[e.length - 1];
}
function T3(e, t) {
  if (e.length < 2)
    return { x: 0, y: 0 };
  let n = e.length - 1, r = null;
  const a = Dh(e);
  for (; n >= 0 && (r = e[n], !(a.timestamp - r.timestamp > /* @__PURE__ */ Be(t))); )
    n--;
  if (!r)
    return { x: 0, y: 0 };
  r === e[0] && e.length > 2 && a.timestamp - r.timestamp > /* @__PURE__ */ Be(t) * 2 && (r = e[1]);
  const i = /* @__PURE__ */ Xe(a.timestamp - r.timestamp);
  if (i === 0)
    return { x: 0, y: 0 };
  const o = {
    x: (a.x - r.x) / i,
    y: (a.y - r.y) / i
  };
  return o.x === 1 / 0 && (o.x = 0), o.y === 1 / 0 && (o.y = 0), o;
}
function P3(e, { min: t, max: n }, r) {
  return t !== void 0 && e < t ? e = r ? ce(t, e, r.min) : Math.max(e, t) : n !== void 0 && e > n && (e = r ? ce(n, e, r.max) : Math.min(e, n)), e;
}
function Gc(e, t, n) {
  return {
    min: t !== void 0 ? e.min + t : void 0,
    max: n !== void 0 ? e.max + n - (e.max - e.min) : void 0
  };
}
function k3(e, { top: t, left: n, bottom: r, right: a }) {
  return {
    x: Gc(e.x, n, a),
    y: Gc(e.y, t, r)
  };
}
function Yc(e, t) {
  let n = t.min - e.min, r = t.max - e.max;
  return t.max - t.min < e.max - e.min && ([n, r] = [r, n]), { min: n, max: r };
}
function N3(e, t) {
  return {
    x: Yc(e.x, t.x),
    y: Yc(e.y, t.y)
  };
}
function A3(e, t) {
  let n = 0.5;
  const r = Ve(e), a = Ve(t);
  return a > r ? n = /* @__PURE__ */ Fn(t.min, t.max - r, e.min) : r > a && (n = /* @__PURE__ */ Fn(e.min, e.max - a, t.min)), yt(0, 1, n);
}
function j3(e, t) {
  const n = {};
  return t.min !== void 0 && (n.min = t.min - e.min), t.max !== void 0 && (n.max = t.max - e.min), n;
}
const hs = 0.35;
function M3(e = hs) {
  return e === !1 ? e = 0 : e === !0 && (e = hs), {
    x: qc(e, "left", "right"),
    y: qc(e, "top", "bottom")
  };
}
function qc(e, t, n) {
  return {
    min: Zc(e, t),
    max: Zc(e, n)
  };
}
function Zc(e, t) {
  return typeof e == "number" ? e : e[t] || 0;
}
const R3 = /* @__PURE__ */ new WeakMap();
class I3 {
  constructor(t) {
    this.openDragLock = null, this.isDragging = !1, this.currentDirection = null, this.originPoint = { x: 0, y: 0 }, this.constraints = !1, this.hasMutatedConstraints = !1, this.elastic = ve(), this.latestPointerEvent = null, this.latestPanInfo = null, this.visualElement = t;
  }
  start(t, { snapToCursor: n = !1, distanceThreshold: r } = {}) {
    const { presenceContext: a } = this.visualElement;
    if (a && a.isPresent === !1)
      return;
    const i = (f) => {
      n && this.snapToCursor(Xr(f).point), this.stopAnimation();
    }, o = (f, m) => {
      const { drag: h, dragPropagation: p, onDragStart: g } = this.getProps();
      if (h && !p && (this.openDragLock && this.openDragLock(), this.openDragLock = u1(h), !this.openDragLock))
        return;
      this.latestPointerEvent = f, this.latestPanInfo = m, this.isDragging = !0, this.currentDirection = null, this.resolveConstraints(), this.visualElement.projection && (this.visualElement.projection.isAnimationBlocked = !0, this.visualElement.projection.target = void 0), mt((b) => {
        let x = this.getAxisMotionValue(b).get() || 0;
        if (vt.test(x)) {
          const { projection: C } = this.visualElement;
          if (C && C.layout) {
            const w = C.layout.layoutBox[b];
            w && (x = Ve(w) * (parseFloat(x) / 100));
          }
        }
        this.originPoint[b] = x;
      }), g && ue.update(() => g(f, m), !1, !0), is(this.visualElement, "transform");
      const { animationState: v } = this.visualElement;
      v && v.setActive("whileDrag", !0);
    }, s = (f, m) => {
      this.latestPointerEvent = f, this.latestPanInfo = m;
      const { dragPropagation: h, dragDirectionLock: p, onDirectionLock: g, onDrag: v } = this.getProps();
      if (!h && !this.openDragLock)
        return;
      const { offset: b } = m;
      if (p && this.currentDirection === null) {
        this.currentDirection = B3(b), this.currentDirection !== null && g && g(this.currentDirection);
        return;
      }
      this.updateAxis("x", m.point, b), this.updateAxis("y", m.point, b), this.visualElement.render(), v && ue.update(() => v(f, m), !1, !0);
    }, l = (f, m) => {
      this.latestPointerEvent = f, this.latestPanInfo = m, this.stop(f, m), this.latestPointerEvent = null, this.latestPanInfo = null;
    }, c = () => {
      const { dragSnapToOrigin: f } = this.getProps();
      (f || this.constraints) && this.startAnimation({ x: 0, y: 0 });
    }, { dragSnapToOrigin: d } = this.getProps();
    this.panSession = new $h(t, {
      onSessionStart: i,
      onStart: o,
      onMove: s,
      onSessionEnd: l,
      resumeAnimation: c
    }, {
      transformPagePoint: this.visualElement.getTransformPagePoint(),
      dragSnapToOrigin: d,
      distanceThreshold: r,
      contextWindow: wh(this.visualElement),
      element: this.visualElement.current
    });
  }
  /**
   * @internal
   */
  stop(t, n) {
    const r = t || this.latestPointerEvent, a = n || this.latestPanInfo, i = this.isDragging;
    if (this.cancel(), !i || !a || !r)
      return;
    const { velocity: o } = a;
    this.startAnimation(o);
    const { onDragEnd: s } = this.getProps();
    s && ue.postRender(() => s(r, a));
  }
  /**
   * @internal
   */
  cancel() {
    this.isDragging = !1;
    const { projection: t, animationState: n } = this.visualElement;
    t && (t.isAnimationBlocked = !1), this.endPanSession();
    const { dragPropagation: r } = this.getProps();
    !r && this.openDragLock && (this.openDragLock(), this.openDragLock = null), n && n.setActive("whileDrag", !1);
  }
  /**
   * Clean up the pan session without modifying other drag state.
   * This is used during unmount to ensure event listeners are removed
   * without affecting projection animations or drag locks.
   * @internal
   */
  endPanSession() {
    this.panSession && this.panSession.end(), this.panSession = void 0;
  }
  updateAxis(t, n, r) {
    const { drag: a } = this.getProps();
    if (!r || !ya(t, a, this.currentDirection))
      return;
    const i = this.getAxisMotionValue(t);
    let o = this.originPoint[t] + r[t];
    this.constraints && this.constraints[t] && (o = P3(o, this.constraints[t], this.elastic[t])), i.set(o);
  }
  resolveConstraints() {
    const { dragConstraints: t, dragElastic: n } = this.getProps(), r = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(!1) : this.visualElement.projection?.layout, a = this.constraints;
    t && En(t) ? this.constraints || (this.constraints = this.resolveRefConstraints()) : t && r ? this.constraints = k3(r.layoutBox, t) : this.constraints = !1, this.elastic = M3(n), a !== this.constraints && !En(t) && r && this.constraints && !this.hasMutatedConstraints && mt((i) => {
      this.constraints !== !1 && this.getAxisMotionValue(i) && (this.constraints[i] = j3(r.layoutBox[i], this.constraints[i]));
    });
  }
  resolveRefConstraints() {
    const { dragConstraints: t, onMeasureDragConstraints: n } = this.getProps();
    if (!t || !En(t))
      return !1;
    const r = t.current;
    at(r !== null, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.", "drag-constraints-ref");
    const { projection: a } = this.visualElement;
    if (!a || !a.layout)
      return !1;
    const i = B1(r, a.root, this.visualElement.getTransformPagePoint());
    let o = N3(a.layout.layoutBox, i);
    if (n) {
      const s = n(R1(o));
      this.hasMutatedConstraints = !!s, s && (o = zm(s));
    }
    return o;
  }
  startAnimation(t) {
    const { drag: n, dragMomentum: r, dragElastic: a, dragTransition: i, dragSnapToOrigin: o, onDragTransitionEnd: s } = this.getProps(), l = this.constraints || {}, c = mt((d) => {
      if (!ya(d, n, this.currentDirection))
        return;
      let f = l && l[d] || {};
      (o === !0 || o === d) && (f = { min: 0, max: 0 });
      const m = a ? 200 : 1e6, h = a ? 40 : 1e7, p = {
        type: "inertia",
        velocity: r ? t[d] : 0,
        bounceStiffness: m,
        bounceDamping: h,
        timeConstant: 750,
        restDelta: 1,
        restSpeed: 10,
        ...i,
        ...f
      };
      return this.startAxisValueAnimation(d, p);
    });
    return Promise.all(c).then(s);
  }
  startAxisValueAnimation(t, n) {
    const r = this.getAxisMotionValue(t);
    return is(this.visualElement, t), r.start(ul(t, r, 0, n, this.visualElement, !1));
  }
  stopAnimation() {
    mt((t) => this.getAxisMotionValue(t).stop());
  }
  /**
   * Drag works differently depending on which props are provided.
   *
   * - If _dragX and _dragY are provided, we output the gesture delta directly to those motion values.
   * - Otherwise, we apply the delta to the x/y motion values.
   */
  getAxisMotionValue(t) {
    const n = `_drag${t.toUpperCase()}`, r = this.visualElement.getProps(), a = r[n];
    return a || this.visualElement.getValue(t, (r.initial ? r.initial[t] : void 0) || 0);
  }
  snapToCursor(t) {
    mt((n) => {
      const { drag: r } = this.getProps();
      if (!ya(n, r, this.currentDirection))
        return;
      const { projection: a } = this.visualElement, i = this.getAxisMotionValue(n);
      if (a && a.layout) {
        const { min: o, max: s } = a.layout.layoutBox[n], l = i.get() || 0;
        i.set(t[n] - ce(o, s, 0.5) + l);
      }
    });
  }
  /**
   * When the viewport resizes we want to check if the measured constraints
   * have changed and, if so, reposition the element within those new constraints
   * relative to where it was before the resize.
   */
  scalePositionWithinConstraints() {
    if (!this.visualElement.current)
      return;
    const { drag: t, dragConstraints: n } = this.getProps(), { projection: r } = this.visualElement;
    if (!En(n) || !r || !this.constraints)
      return;
    this.stopAnimation();
    const a = { x: 0, y: 0 };
    mt((o) => {
      const s = this.getAxisMotionValue(o);
      if (s && this.constraints !== !1) {
        const l = s.get();
        a[o] = A3({ min: l, max: l }, this.constraints[o]);
      }
    });
    const { transformTemplate: i } = this.visualElement.getProps();
    this.visualElement.current.style.transform = i ? i({}, "") : "none", r.root && r.root.updateScroll(), r.updateLayout(), this.constraints = !1, this.resolveConstraints(), mt((o) => {
      if (!ya(o, t, null))
        return;
      const s = this.getAxisMotionValue(o), { min: l, max: c } = this.constraints[o];
      s.set(ce(l, c, a[o]));
    }), this.visualElement.render();
  }
  addListeners() {
    if (!this.visualElement.current)
      return;
    R3.set(this.visualElement, this);
    const t = this.visualElement.current, n = wr(t, "pointerdown", (c) => {
      const { drag: d, dragListener: f = !0 } = this.getProps(), m = c.target, h = m !== t && p1(m);
      d && f && !h && this.start(c);
    });
    let r;
    const a = () => {
      const { dragConstraints: c } = this.getProps();
      En(c) && c.current && (this.constraints = this.resolveRefConstraints(), r || (r = V3(t, c.current, () => this.scalePositionWithinConstraints())));
    }, { projection: i } = this.visualElement, o = i.addEventListener("measure", a);
    i && !i.layout && (i.root && i.root.updateScroll(), i.updateLayout()), ue.read(a);
    const s = Mr(window, "resize", () => this.scalePositionWithinConstraints()), l = i.addEventListener("didUpdate", (({ delta: c, hasLayoutChanged: d }) => {
      this.isDragging && d && (mt((f) => {
        const m = this.getAxisMotionValue(f);
        m && (this.originPoint[f] += c[f].translate, m.set(m.get() + c[f].translate));
      }), this.visualElement.render());
    }));
    return () => {
      s(), n(), o(), l && l(), r && r();
    };
  }
  getProps() {
    const t = this.visualElement.getProps(), { drag: n = !1, dragDirectionLock: r = !1, dragPropagation: a = !1, dragConstraints: i = !1, dragElastic: o = hs, dragMomentum: s = !0 } = t;
    return {
      ...t,
      drag: n,
      dragDirectionLock: r,
      dragPropagation: a,
      dragConstraints: i,
      dragElastic: o,
      dragMomentum: s
    };
  }
}
function Xc(e) {
  let t = !0;
  return () => {
    if (t) {
      t = !1;
      return;
    }
    e();
  };
}
function V3(e, t, n) {
  const r = rc(e, Xc(n)), a = rc(t, Xc(n));
  return () => {
    r(), a();
  };
}
function ya(e, t, n) {
  return (t === !0 || t === e) && (n === null || n === e);
}
function B3(e, t = 10) {
  let n = null;
  return Math.abs(e.y) > t ? n = "y" : Math.abs(e.x) > t && (n = "x"), n;
}
class L3 extends Wt {
  constructor(t) {
    super(t), this.removeGroupControls = Je, this.removeListeners = Je, this.controls = new I3(t);
  }
  mount() {
    const { dragControls: t } = this.node.getProps();
    t && (this.removeGroupControls = t.subscribe(this.controls)), this.removeListeners = this.controls.addListeners() || Je;
  }
  update() {
    const { dragControls: t } = this.node.getProps(), { dragControls: n } = this.node.prevProps || {};
    t !== n && (this.removeGroupControls(), t && (this.removeGroupControls = t.subscribe(this.controls)));
  }
  unmount() {
    this.removeGroupControls(), this.removeListeners(), this.controls.isDragging || this.controls.endPanSession();
  }
}
const po = (e) => (t, n) => {
  e && ue.update(() => e(t, n), !1, !0);
};
class F3 extends Wt {
  constructor() {
    super(...arguments), this.removePointerDownListener = Je;
  }
  onPointerDown(t) {
    this.session = new $h(t, this.createPanHandlers(), {
      transformPagePoint: this.node.getTransformPagePoint(),
      contextWindow: wh(this.node)
    });
  }
  createPanHandlers() {
    const { onPanSessionStart: t, onPanStart: n, onPan: r, onPanEnd: a } = this.node.getProps();
    return {
      onSessionStart: po(t),
      onStart: po(n),
      onMove: po(r),
      onEnd: (i, o) => {
        delete this.session, a && ue.postRender(() => a(i, o));
      }
    };
  }
  mount() {
    this.removePointerDownListener = wr(this.node.current, "pointerdown", (t) => this.onPointerDown(t));
  }
  update() {
    this.session && this.session.updateHandlers(this.createPanHandlers());
  }
  unmount() {
    this.removePointerDownListener(), this.session && this.session.end();
  }
}
let go = !1;
class O3 extends lb {
  /**
   * This only mounts projection nodes for components that
   * need measuring, we might want to do it for all components
   * in order to incorporate transforms
   */
  componentDidMount() {
    const { visualElement: t, layoutGroup: n, switchLayoutGroup: r, layoutId: a } = this.props, { projection: i } = t;
    i && (n.group && n.group.add(i), r && r.register && a && r.register(i), go && i.root.didUpdate(), i.addEventListener("animationComplete", () => {
      this.safeToRemove();
    }), i.setOptions({
      ...i.options,
      layoutDependency: this.props.layoutDependency,
      onExitComplete: () => this.safeToRemove()
    })), Oa.hasEverUpdated = !0;
  }
  getSnapshotBeforeUpdate(t) {
    const { layoutDependency: n, visualElement: r, drag: a, isPresent: i } = this.props, { projection: o } = r;
    return o && (o.isPresent = i, t.layoutDependency !== n && o.setOptions({
      ...o.options,
      layoutDependency: n
    }), go = !0, a || t.layoutDependency !== n || n === void 0 || t.isPresent !== i ? o.willUpdate() : this.safeToRemove(), t.isPresent !== i && (i ? o.promote() : o.relegate() || ue.postRender(() => {
      const s = o.getStack();
      (!s || !s.members.length) && this.safeToRemove();
    }))), null;
  }
  componentDidUpdate() {
    const { visualElement: t, layoutAnchor: n } = this.props, { projection: r } = t;
    r && (r.options.layoutAnchor = n, r.root.didUpdate(), hl.postRender(() => {
      !r.currentAnimation && r.isLead() && this.safeToRemove();
    }));
  }
  componentWillUnmount() {
    const { visualElement: t, layoutGroup: n, switchLayoutGroup: r } = this.props, { projection: a } = t;
    go = !0, a && (a.scheduleCheckAfterUnmount(), n && n.group && n.group.remove(a), r && r.deregister && r.deregister(a));
  }
  safeToRemove() {
    const { safeToRemove: t } = this.props;
    t && t();
  }
  render() {
    return null;
  }
}
function Ch(e) {
  const [t, n] = fh(), r = ee(Gs);
  return u.jsx(O3, { ...e, layoutGroup: r, switchLayoutGroup: ee(yh), isPresent: t, safeToRemove: n });
}
const z3 = {
  pan: {
    Feature: F3
  },
  drag: {
    Feature: L3,
    ProjectionNode: dh,
    MeasureLayout: Ch
  }
};
function Jc(e, t, n) {
  const { props: r } = e;
  e.animationState && r.whileHover && e.animationState.setActive("whileHover", n === "Start");
  const a = "onHover" + n, i = r[a];
  i && ue.postRender(() => i(t, Xr(t)));
}
class _3 extends Wt {
  mount() {
    const { current: t } = this.node;
    t && (this.unmount = d1(t, (n, r) => (Jc(this.node, r, "Start"), (a) => Jc(this.node, a, "End"))));
  }
  unmount() {
  }
}
class U3 extends Wt {
  constructor() {
    super(...arguments), this.isActive = !1;
  }
  onFocus() {
    let t = !1;
    try {
      t = this.node.current.matches(":focus-visible");
    } catch {
      t = !0;
    }
    !t || !this.node.animationState || (this.node.animationState.setActive("whileFocus", !0), this.isActive = !0);
  }
  onBlur() {
    !this.isActive || !this.node.animationState || (this.node.animationState.setActive("whileFocus", !1), this.isActive = !1);
  }
  mount() {
    this.unmount = Gr(Mr(this.node.current, "focus", () => this.onFocus()), Mr(this.node.current, "blur", () => this.onBlur()));
  }
  unmount() {
  }
}
function Qc(e, t, n) {
  const { props: r } = e;
  if (e.current instanceof HTMLButtonElement && e.current.disabled)
    return;
  e.animationState && r.whileTap && e.animationState.setActive("whileTap", n === "Start");
  const a = "onTap" + (n === "End" ? "" : n), i = r[a];
  i && ue.postRender(() => i(t, Xr(t)));
}
class H3 extends Wt {
  mount() {
    const { current: t } = this.node;
    if (!t)
      return;
    const { globalTapTarget: n, propagate: r } = this.node.props;
    this.unmount = v1(t, (a, i) => (Qc(this.node, i, "Start"), (o, { success: s }) => Qc(this.node, o, s ? "End" : "Cancel")), {
      useGlobalTarget: n,
      stopPropagation: r?.tap === !1
    });
  }
  unmount() {
  }
}
const ps = /* @__PURE__ */ new WeakMap(), vo = /* @__PURE__ */ new WeakMap(), K3 = (e) => {
  const t = ps.get(e.target);
  t && t(e);
}, W3 = (e) => {
  e.forEach(K3);
};
function G3({ root: e, ...t }) {
  const n = e || document;
  vo.has(n) || vo.set(n, {});
  const r = vo.get(n), a = JSON.stringify(t);
  return r[a] || (r[a] = new IntersectionObserver(W3, { root: e, ...t })), r[a];
}
function Y3(e, t, n) {
  const r = G3(t);
  return ps.set(e, n), r.observe(e), () => {
    ps.delete(e), r.unobserve(e);
  };
}
const q3 = {
  some: 0,
  all: 1
};
class Z3 extends Wt {
  constructor() {
    super(...arguments), this.hasEnteredView = !1, this.isInView = !1;
  }
  startObserver() {
    this.stopObserver?.();
    const { viewport: t = {} } = this.node.getProps(), { root: n, margin: r, amount: a = "some", once: i } = t, o = {
      root: n ? n.current : void 0,
      rootMargin: r,
      threshold: typeof a == "number" ? a : q3[a]
    }, s = (l) => {
      const { isIntersecting: c } = l;
      if (this.isInView === c || (this.isInView = c, i && !c && this.hasEnteredView))
        return;
      c && (this.hasEnteredView = !0), this.node.animationState && this.node.animationState.setActive("whileInView", c);
      const { onViewportEnter: d, onViewportLeave: f } = this.node.getProps(), m = c ? d : f;
      m && m(l);
    };
    this.stopObserver = Y3(this.node.current, o, s);
  }
  mount() {
    this.startObserver();
  }
  update() {
    if (typeof IntersectionObserver > "u")
      return;
    const { props: t, prevProps: n } = this.node;
    ["amount", "margin", "root"].some(X3(t, n)) && this.startObserver();
  }
  unmount() {
    this.stopObserver?.(), this.hasEnteredView = !1, this.isInView = !1;
  }
}
function X3({ viewport: e = {} }, { viewport: t = {} } = {}) {
  return (n) => e[n] !== t[n];
}
const J3 = {
  inView: {
    Feature: Z3
  },
  tap: {
    Feature: H3
  },
  focus: {
    Feature: U3
  },
  hover: {
    Feature: _3
  }
}, Q3 = {
  layout: {
    ProjectionNode: dh,
    MeasureLayout: Ch
  }
}, ew = {
  ...D3,
  ...J3,
  ...z3,
  ...Q3
}, de = /* @__PURE__ */ b3(ew, y3);
function zn(e) {
  const t = rn(() => Ht(e)), { isStatic: n } = ee(Zr);
  if (n) {
    const [, r] = _(e);
    U(() => t.on("change", r), []);
  }
  return t;
}
function Eh(e, t) {
  const n = zn(t()), r = () => n.set(t());
  return r(), Ys(() => {
    const a = () => ue.preRender(r, !1, !0), i = e.map((o) => o.on("change", a));
    return () => {
      i.forEach((o) => o()), Et(r);
    };
  }), n;
}
function tw(e) {
  yr.current = [], e();
  const t = Eh(yr.current, e);
  return yr.current = void 0, t;
}
function Rr(e, t, n, r) {
  if (typeof e == "function")
    return tw(e);
  if (n !== void 0 && !Array.isArray(n) && typeof t != "function")
    return nw(e, t, n, r);
  const o = typeof t == "function" ? t : S1(t, n, r), s = Array.isArray(e) ? ed(e, o) : ed([e], ([c]) => o(c)), l = Array.isArray(e) ? void 0 : e.accelerate;
  return l && !l.isTransformed && typeof t != "function" && Array.isArray(n) && r?.clamp !== !1 && (s.accelerate = {
    ...l,
    times: t,
    keyframes: n,
    isTransformed: !0
  }), s;
}
function ed(e, t) {
  const n = rn(() => []);
  return Eh(e, () => {
    n.length = 0;
    const r = e.length;
    for (let a = 0; a < r; a++)
      n[a] = e[a].get();
    return t(n);
  });
}
function nw(e, t, n, r) {
  const a = rn(() => Object.keys(n)), i = rn(() => ({}));
  for (const o of a)
    i[o] = Rr(e, t, n[o], r);
  return i;
}
function rw(e, t = {}) {
  const { isStatic: n } = ee(Zr), r = () => ge(e) ? e.get() : e;
  if (n)
    return Rr(r);
  const a = zn(r());
  return pi(() => T1(a, e, t), [a, JSON.stringify(t)]), a;
}
function Ir(e, t = {}) {
  return rw(e, { type: "spring", ...t });
}
function $l(e) {
  return typeof e == "object" && !Array.isArray(e);
}
function Sh(e, t, n, r) {
  return e == null ? [] : typeof e == "string" && $l(t) ? Di(e, n, r) : e instanceof NodeList ? Array.from(e) : Array.isArray(e) ? e.filter((a) => a != null) : [e];
}
function aw(e, t, n) {
  return e * (t + 1);
}
function td(e, t, n, r) {
  return typeof t == "number" ? t : t.startsWith("-") || t.startsWith("+") ? Math.max(0, e + parseFloat(t)) : t === "<" ? n : t.startsWith("<") ? Math.max(0, n + parseFloat(t.slice(1))) : r.get(t) ?? e;
}
function iw(e, t, n) {
  for (let r = 0; r < e.length; r++) {
    const a = e[r];
    a.at > t && a.at < n && (Ln(e, a), r--);
  }
}
function ow(e, t, n, r, a, i) {
  iw(e, a, i);
  for (let o = 0; o < t.length; o++)
    e.push({
      value: t[o],
      at: ce(a, i, r[o]),
      easing: Gf(n, o)
    });
}
function sw(e, t) {
  for (let n = 0; n < e.length; n++)
    e[n] = e[n] / (t + 1);
}
function lw(e, t) {
  return e.at === t.at ? e.value === null ? 1 : t.value === null ? -1 : 0 : e.at - t.at;
}
const uw = "easeInOut", cw = 20;
function dw(e, { defaultTransition: t = {}, ...n } = {}, r, a) {
  const i = t.duration || 0.3, o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map(), l = {}, c = /* @__PURE__ */ new Map();
  let d = 0, f = 0, m = 0;
  for (let h = 0; h < e.length; h++) {
    const p = e[h];
    if (typeof p == "string") {
      c.set(p, f);
      continue;
    } else if (!Array.isArray(p)) {
      c.set(p.name, td(f, p.at, d, c));
      continue;
    }
    let [g, v, b = {}] = p;
    b.at !== void 0 && (f = td(f, b.at, d, c));
    let x = 0;
    const C = (w, E, k, A = 0, P = 0) => {
      const j = fw(w), { delay: T = 0, times: M = um(j), type: L = t.type || "keyframes", repeat: O, repeatType: Z, repeatDelay: Q = 0, ...J } = E;
      let { ease: Y = t.ease || "easeOut", duration: K } = E;
      const te = typeof T == "function" ? T(A, P) : T, S = j.length, $ = sl(L) ? L : a?.[L || "keyframes"];
      if (S <= 2 && $) {
        let H = 100;
        if (S === 2 && pw(j)) {
          const oe = j[1] - j[0];
          H = Math.abs(oe);
        }
        const ne = {
          ...t,
          ...J
        };
        K !== void 0 && (ne.duration = /* @__PURE__ */ Be(K));
        const X = im(ne, H, $);
        Y = X.ease, K = X.duration;
      }
      K ?? (K = i);
      const D = f + te;
      M.length === 1 && M[0] === 0 && (M[1] = 1);
      const N = M.length - j.length;
      if (N > 0 && lm(M, N), j.length === 1 && j.unshift(null), O) {
        at(O < cw, "Repeat count too high, must be less than 20", "repeat-count-high"), K = aw(K, O);
        const H = [...j], ne = [...M];
        Y = Array.isArray(Y) ? [...Y] : [Y];
        const X = [...Y];
        for (let oe = 0; oe < O; oe++) {
          j.push(...H);
          for (let le = 0; le < H.length; le++)
            M.push(ne[le] + (oe + 1)), Y.push(le === 0 ? "linear" : Gf(X, le - 1));
        }
        sw(M, O);
      }
      const I = D + K;
      ow(k, j, Y, M, D, I), x = Math.max(te + K, x), m = Math.max(I, m);
    };
    if (ge(g)) {
      const w = nd(g, s);
      C(v, b, rd("default", w));
    } else {
      const w = Sh(g, v, r, l), E = w.length;
      for (let k = 0; k < E; k++) {
        v = v, b = b;
        const A = w[k], P = nd(A, s);
        for (const j in v)
          C(v[j], mw(b, j), rd(j, P), k, E);
      }
    }
    d = f, f += x;
  }
  return s.forEach((h, p) => {
    for (const g in h) {
      const v = h[g];
      v.sort(lw);
      const b = [], x = [], C = [];
      for (let A = 0; A < v.length; A++) {
        const { at: P, value: j, easing: T } = v[A];
        b.push(j), x.push(/* @__PURE__ */ Fn(0, m, P)), C.push(T || "easeOut");
      }
      x[0] !== 0 && (x.unshift(0), b.unshift(b[0]), C.unshift(uw)), x[x.length - 1] !== 1 && (x.push(1), b.push(null)), o.has(p) || o.set(p, {
        keyframes: {},
        transition: {}
      });
      const w = o.get(p);
      w.keyframes[g] = b;
      const { type: E, ...k } = t;
      w.transition[g] = {
        ...k,
        duration: m,
        ease: C,
        times: x,
        ...n
      };
    }
  }), o;
}
function nd(e, t) {
  return !t.has(e) && t.set(e, {}), t.get(e);
}
function rd(e, t) {
  return t[e] || (t[e] = []), t[e];
}
function fw(e) {
  return Array.isArray(e) ? e : [e];
}
function mw(e, t) {
  return e && e[t] ? {
    ...e,
    ...e[t]
  } : { ...e };
}
const hw = (e) => typeof e == "number", pw = (e) => e.every(hw);
function gw(e) {
  const t = {
    presenceContext: null,
    props: {},
    visualState: {
      renderState: {
        transform: {},
        transformOrigin: {},
        style: {},
        vars: {},
        attrs: {}
      },
      latestValues: {}
    }
  }, n = Ci(e) && !Im(e) ? new Jm(t) : new Gm(t);
  n.mount(e), Ar.set(e, n);
}
function vw(e) {
  const t = {
    presenceContext: null,
    props: {},
    visualState: {
      renderState: {
        output: {}
      },
      latestValues: {}
    }
  }, n = new H1(t);
  n.mount(e), Ar.set(e, n);
}
function bw(e, t) {
  return ge(e) || typeof e == "number" || typeof e == "string" && !$l(t);
}
function Th(e, t, n, r) {
  const a = [];
  if (bw(e, t))
    a.push(sh(e, $l(t) && t.default || t, n && (n.default || n)));
  else {
    if (e == null)
      return a;
    const i = Sh(e, t, r), o = i.length;
    at(!!o, "No valid elements provided.", "no-valid-elements");
    for (let s = 0; s < o; s++) {
      const l = i[s], c = l instanceof Element ? gw : vw;
      Ar.has(l) || c(l);
      const d = Ar.get(l), f = { ...n };
      "delay" in f && typeof f.delay == "function" && (f.delay = f.delay(s, o)), a.push(...fl(d, { ...t, transition: f }, {}));
    }
  }
  return a;
}
function yw(e, t, n) {
  const r = [], a = e.map((o) => {
    if (Array.isArray(o) && typeof o[0] == "function") {
      const s = o[0], l = Ht(0);
      return l.on("change", s), o.length === 1 ? [l, [0, 1]] : o.length === 2 ? [l, [0, 1], o[1]] : [l, o[1], o[2]];
    }
    return o;
  });
  return dw(a, t, n, { spring: kr }).forEach(({ keyframes: o, transition: s }, l) => {
    r.push(...Th(l, o, s));
  }), r;
}
function xw(e) {
  return Array.isArray(e) && e.some(Array.isArray);
}
function ww(e = {}) {
  const { scope: t, reduceMotion: n } = e;
  function r(a, i, o) {
    let s = [], l;
    if (xw(a)) {
      const { onComplete: d, ...f } = i || {};
      typeof d == "function" && (l = d), s = yw(a, n !== void 0 ? { reduceMotion: n, ...f } : f, t);
    } else {
      const { onComplete: d, ...f } = o || {};
      typeof d == "function" && (l = d), s = Th(a, i, n !== void 0 ? { reduceMotion: n, ...f } : f, t);
    }
    const c = new Ax(s);
    return l && c.finished.then(l), t && (t.animations.push(c), c.finished.then(() => {
      Ln(t.animations, c);
    })), c;
  }
  return r;
}
const $w = ww(), Dw = {
  some: 0,
  all: 1
};
function Cw(e, t, { root: n, margin: r, amount: a = "some" } = {}) {
  const i = Di(e), o = /* @__PURE__ */ new WeakMap(), s = (c) => {
    c.forEach((d) => {
      const f = o.get(d.target);
      if (d.isIntersecting !== !!f)
        if (d.isIntersecting) {
          const m = t(d.target, d);
          typeof m == "function" ? o.set(d.target, m) : l.unobserve(d.target);
        } else typeof f == "function" && (f(d), o.delete(d.target));
    });
  }, l = new IntersectionObserver(s, {
    root: n,
    rootMargin: r,
    threshold: typeof a == "number" ? a : Dw[a]
  });
  return i.forEach((c) => l.observe(c)), () => l.disconnect();
}
function cn(e, { root: t, margin: n, amount: r, once: a = !1, initial: i = !1 } = {}) {
  const [o, s] = _(i);
  return U(() => {
    if (!e.current || a && o)
      return;
    const l = () => (s(!0), a ? void 0 : () => s(!1)), c = {
      root: t && t.current || void 0,
      margin: n,
      amount: r
    };
    return Cw(e.current, l, c);
  }, [t, e, n, a, r]), o;
}
const Ph = R.createContext(null), Ew = ({ content: e }) => {
  const t = R.Children.toArray(e);
  return /* @__PURE__ */ u.jsx(
    de.div,
    {
      initial: "initial",
      animate: "animate",
      exit: "exit",
      variants: {
        animate: { transition: { staggerChildren: 0.08 } }
      },
      children: t.map((n, r) => /* @__PURE__ */ u.jsx(
        de.div,
        {
          variants: {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
            exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } }
          },
          children: n
        },
        r
      ))
    }
  );
};
function gS({ children: e, className: t, tooltipClassName: n, animation: r = "default" }) {
  const a = {
    tooltipClassName: n,
    animation: r
  };
  return /* @__PURE__ */ u.jsx(Ph.Provider, { value: a, children: /* @__PURE__ */ u.jsx("div", { className: y("flex -space-x-2.5", t), children: e }) });
}
function vS({
  children: e,
  className: t,
  tooltipClassName: n,
  animation: r
}) {
  const a = R.useContext(Ph), [i, o] = R.useState(!1), s = { stiffness: 100, damping: 5 }, l = zn(0), c = r || a?.animation || "default", d = n || a?.tooltipClassName, f = Ir(Rr(l, [-100, 100], [-45, 45]), s), m = Ir(Rr(l, [-100, 100], [-50, 50]), s), h = R.Children.toArray(e).find(
    (C) => R.isValidElement(C) && C.type === ad
  ), p = R.Children.toArray(e).filter(
    (C) => !(R.isValidElement(C) && C.type === ad)
  ), g = h && R.isValidElement(h) ? h.props.children : null, v = (C) => {
    const w = C.target.offsetWidth / 2;
    l.set(C.nativeEvent.offsetX - w);
  }, x = {
    default: {
      initial: { opacity: 0, y: 20, scale: 0.6 },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 260,
          damping: 10
        }
      },
      exit: {
        opacity: 0,
        y: 20,
        scale: 0.6,
        transition: {
          duration: 0.2,
          ease: "easeInOut"
        }
      }
    },
    flip: {
      initial: { opacity: 0, rotateX: -90 },
      animate: {
        opacity: 1,
        rotateX: 0,
        transition: {
          type: "spring",
          stiffness: 180,
          damping: 25
        }
      },
      exit: {
        opacity: 0,
        rotateX: -90,
        transition: {
          duration: 0.3,
          ease: "easeInOut"
        }
      }
    },
    reveal: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: "easeOut" } },
      exit: { opacity: 0, scale: 0.95, transition: { duration: 0.1, ease: "easeIn" } }
    }
  }[c];
  return /* @__PURE__ */ u.jsxs(
    "div",
    {
      className: y("group relative", t),
      onMouseEnter: () => o(!0),
      onMouseLeave: () => o(!1),
      children: [
        /* @__PURE__ */ u.jsx(G4, { mode: "wait", children: i && g && /* @__PURE__ */ u.jsxs(
          de.div,
          {
            initial: x.initial,
            animate: x.animate,
            exit: x.exit,
            style: {
              translateX: c === "reveal" ? 0 : m,
              rotate: c === "reveal" ? 0 : f,
              whiteSpace: "nowrap",
              transformOrigin: "center"
            },
            className: y(
              "absolute -top-16 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-md bg-black px-4 py-2 text-xs font-medium text-white shadow-xl",
              d
            ),
            children: [
              /* @__PURE__ */ u.jsx(
                de.div,
                {
                  className: "absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-emerald-500 dark:via-emerald-900 to-transparent",
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  exit: { opacity: 0 },
                  transition: { duration: 0.15 }
                }
              ),
              /* @__PURE__ */ u.jsx(
                de.div,
                {
                  className: "absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-sky-500 dark:via-sky-900 to-transparent",
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  exit: { opacity: 0 },
                  transition: { duration: 0.15 }
                }
              ),
              c === "reveal" ? /* @__PURE__ */ u.jsx(Ew, { content: g }) : g
            ]
          }
        ) }),
        /* @__PURE__ */ u.jsx(
          de.div,
          {
            className: "relative cursor-pointer",
            whileHover: {
              zIndex: 30
            },
            whileTap: { scale: 0.95 },
            transition: {
              duration: 0.5
            },
            onMouseMove: v,
            children: p
          }
        )
      ]
    }
  );
}
function ad({ children: e, className: t }) {
  return /* @__PURE__ */ u.jsx(
    de.div,
    {
      initial: { opacity: 0, y: 20, scale: 0.6 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15 },
      className: y("hidden relative z-30", t),
      children: e
    }
  );
}
const Sw = re(
  "inline-flex items-center justify-center border border-transparent font-medium focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 [&_svg]:-ms-px [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        success: "bg-[var(--color-success-accent,var(--color-green-500))] text-[var(--color-success-foreground,var(--color-white))]",
        warning: "bg-[var(--color-warning-accent,var(--color-yellow-500))] text-[var(--color-warning-foreground,var(--color-white))]",
        info: "bg-[var(--color-info-accent,var(--color-violet-500))] text-[var(--color-info-foreground,var(--color-white))]",
        outline: "bg-transparent border border-border text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground"
      },
      appearance: {
        default: "",
        light: "",
        outline: "",
        ghost: "border-transparent bg-transparent"
      },
      disabled: {
        true: "opacity-50 pointer-events-none"
      },
      size: {
        lg: "rounded-md px-[0.5rem] h-7 min-w-7 gap-1.5 text-xs [&_svg]:size-3.5",
        md: "rounded-md px-[0.45rem] h-6 min-w-6 gap-1.5 text-xs [&_svg]:size-3.5 ",
        sm: "rounded-sm px-[0.325rem] h-5 min-w-5 gap-1 text-[0.6875rem] leading-[0.75rem] [&_svg]:size-3",
        xs: "rounded-sm px-[0.25rem] h-4 min-w-4 gap-1 text-[0.625rem] leading-[0.5rem] [&_svg]:size-3"
      },
      shape: {
        default: "",
        circle: "rounded-full"
      }
    },
    compoundVariants: [
      /* Light */
      {
        variant: "primary",
        appearance: "light",
        className: "text-[var(--color-primary-accent,var(--color-blue-700))] bg-[var(--color-primary-soft,var(--color-blue-50))] dark:bg-[var(--color-primary-soft,var(--color-blue-950))] dark:text-[var(--color-primary-soft,var(--color-blue-600))]"
      },
      {
        variant: "secondary",
        appearance: "light",
        className: "bg-secondary dark:bg-secondary/50 text-secondary-foreground"
      },
      {
        variant: "success",
        appearance: "light",
        className: "text-[var(--color-success-accent,var(--color-green-800))] bg-[var(--color-success-soft,var(--color-green-100))] dark:bg-[var(--color-success-soft,var(--color-green-950))] dark:text-[var(--color-success-soft,var(--color-green-600))]"
      },
      {
        variant: "warning",
        appearance: "light",
        className: "text-[var(--color-warning-accent,var(--color-yellow-700))] bg-[var(--color-warning-soft,var(--color-yellow-100))] dark:bg-[var(--color-warning-soft,var(--color-yellow-950))] dark:text-[var(--color-warning-soft,var(--color-yellow-600))]"
      },
      {
        variant: "info",
        appearance: "light",
        className: "text-[var(--color-info-accent,var(--color-violet-700))] bg-[var(--color-info-soft,var(--color-violet-100))] dark:bg-[var(--color-info-soft,var(--color-violet-950))] dark:text-[var(--color-info-soft,var(--color-violet-400))]"
      },
      {
        variant: "destructive",
        appearance: "light",
        className: "text-[var(--color-destructive-accent,var(--color-red-700))] bg-[var(--color-destructive-soft,var(--color-red-50))] dark:bg-[var(--color-destructive-soft,var(--color-red-950))] dark:text-[var(--color-destructive-soft,var(--color-red-600))]"
      },
      /* Outline */
      {
        variant: "primary",
        appearance: "outline",
        className: "text-[var(--color-primary-accent,var(--color-blue-700))] border-[var(--color-primary-soft,var(--color-blue-100))] bg-[var(--color-primary-soft,var(--color-blue-50))] dark:bg-[var(--color-primary-soft,var(--color-blue-950))] dark:border-[var(--color-primary-soft,var(--color-blue-900))] dark:text-[var(--color-primary-soft,var(--color-blue-600))]"
      },
      {
        variant: "success",
        appearance: "outline",
        className: "text-[var(--color-success-accent,var(--color-green-700))] border-[var(--color-success-soft,var(--color-green-200))] bg-[var(--color-success-soft,var(--color-green-50))] dark:bg-[var(--color-success-soft,var(--color-green-950))] dark:border-[var(--color-success-soft,var(--color-green-900))] dark:text-[var(--color-success-soft,var(--color-green-600))]"
      },
      {
        variant: "warning",
        appearance: "outline",
        className: "text-[var(--color-warning-accent,var(--color-yellow-700))] border-[var(--color-warning-soft,var(--color-yellow-200))] bg-[var(--color-warning-soft,var(--color-yellow-50))] dark:bg-[var(--color-warning-soft,var(--color-yellow-950))] dark:border-[var(--color-warning-soft,var(--color-yellow-900))] dark:text-[var(--color-warning-soft,var(--color-yellow-600))]"
      },
      {
        variant: "info",
        appearance: "outline",
        className: "text-[var(--color-info-accent,var(--color-violet-700))] border-[var(--color-info-soft,var(--color-violet-100))] bg-[var(--color-info-soft,var(--color-violet-50))] dark:bg-[var(--color-info-soft,var(--color-violet-950))] dark:border-[var(--color-info-soft,var(--color-violet-900))] dark:text-[var(--color-info-soft,var(--color-violet-400))]"
      },
      {
        variant: "destructive",
        appearance: "outline",
        className: "text-[var(--color-destructive-accent,var(--color-red-700))] border-[var(--color-destructive-soft,var(--color-red-100))] bg-[var(--color-destructive-soft,var(--color-red-50))] dark:bg-[var(--color-destructive-soft,var(--color-red-950))] dark:border-[var(--color-destructive-soft,var(--color-red-900))] dark:text-[var(--color-destructive-soft,var(--color-red-600))]"
      },
      /* Ghost */
      {
        variant: "primary",
        appearance: "ghost",
        className: "text-primary"
      },
      {
        variant: "secondary",
        appearance: "ghost",
        className: "text-secondary-foreground"
      },
      {
        variant: "success",
        appearance: "ghost",
        className: "text-[var(--color-success-accent,var(--color-green-500))]"
      },
      {
        variant: "warning",
        appearance: "ghost",
        className: "text-[var(--color-warning-accent,var(--color-yellow-500))]"
      },
      {
        variant: "info",
        appearance: "ghost",
        className: "text-[var(--color-info-accent,var(--color-violet-500))]"
      },
      {
        variant: "destructive",
        appearance: "ghost",
        className: "text-destructive"
      },
      { size: "lg", appearance: "ghost", className: "px-0" },
      { size: "md", appearance: "ghost", className: "px-0" },
      { size: "sm", appearance: "ghost", className: "px-0" },
      { size: "xs", appearance: "ghost", className: "px-0" }
    ],
    defaultVariants: {
      variant: "primary",
      appearance: "default",
      size: "md"
    }
  }
), Tw = re(
  "cursor-pointer transition-all inline-flex items-center justify-center leading-none size-3.5 [&>svg]:opacity-100! [&>svg]:size-3.5! p-0 rounded-md -me-0.5 opacity-60 hover:opacity-100",
  {
    variants: {
      variant: {
        default: ""
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function bo({
  className: e,
  variant: t,
  size: n,
  appearance: r,
  shape: a,
  asChild: i = !1,
  disabled: o,
  ...s
}) {
  const l = i ? Qe : "span";
  return /* @__PURE__ */ u.jsx(
    l,
    {
      "data-slot": "badge",
      className: y(Sw({ variant: t, size: n, appearance: r, shape: a, disabled: o }), e),
      ...s
    }
  );
}
function bS({
  className: e,
  variant: t,
  asChild: n = !1,
  ...r
}) {
  const a = n ? Qe : "span";
  return /* @__PURE__ */ u.jsx(
    a,
    {
      "data-slot": "badge-button",
      className: y(Tw({ variant: t, className: e })),
      role: "button",
      ...r
    }
  );
}
function yS({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    "span",
    {
      "data-slot": "badge-dot",
      className: y("size-1.5 rounded-full bg-[currentColor] opacity-75", e),
      ...t
    }
  );
}
function xS({
  ...e
}) {
  return /* @__PURE__ */ u.jsx("nav", { "data-slot": "breadcrumb", "aria-label": "breadcrumb", ...e });
}
function wS({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    "ol",
    {
      "data-slot": "breadcrumb-list",
      className: y("flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground", e),
      ...t
    }
  );
}
function $S({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx("li", { "data-slot": "breadcrumb-item", className: y("inline-flex items-center gap-1.5", e), ...t });
}
function DS({
  asChild: e,
  className: t,
  ...n
}) {
  const r = e ? Qe : "a";
  return /* @__PURE__ */ u.jsx(r, { "data-slot": "breadcrumb-link", className: y("transition-colors hover:text-foreground", t), ...n });
}
function CS({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    "span",
    {
      "data-slot": "breadcrumb-page",
      role: "link",
      "aria-disabled": "true",
      "aria-current": "page",
      className: y("font-normal text-foreground", e),
      ...t
    }
  );
}
const ES = ({ children: e, className: t, ...n }) => /* @__PURE__ */ u.jsx(
  "li",
  {
    "data-slot": "breadcrumb-separator",
    role: "presentation",
    "aria-hidden": "true",
    className: y("[&>svg]:w-3.5 [&>svg]:h-3.5", t),
    ...n,
    children: e ?? /* @__PURE__ */ u.jsx(vi, { className: "rtl:rotate-180" })
  }
), SS = ({ className: e, ...t }) => /* @__PURE__ */ u.jsxs(
  "span",
  {
    "data-slot": "breadcrumb-ellipsis",
    role: "presentation",
    "aria-hidden": "true",
    className: y("flex h-9 w-9 items-center justify-center", e),
    ...t,
    children: [
      /* @__PURE__ */ u.jsx(Ef, { className: "h-4 w-4" }),
      /* @__PURE__ */ u.jsx("span", { className: "sr-only", children: "More" })
    ]
  }
);
function TS({ className: e, classNames: t, showOutsideDays: n = !0, ...r }) {
  return /* @__PURE__ */ u.jsx(
    Nb,
    {
      showOutsideDays: n,
      className: y("p-3", e),
      classNames: {
        months: "relative flex flex-col sm:flex-row gap-4",
        month: "w-full",
        month_caption: "relative mx-10 mb-1 flex h-8 items-center justify-center z-20",
        caption_label: "text-sm font-medium",
        nav: "absolute top-0 flex w-full justify-between z-10",
        button_previous: y(
          Tr({ variant: "ghost" }),
          "size-8 text-muted-foreground/80 hover:text-foreground p-0"
        ),
        button_next: y(
          Tr({ variant: "ghost" }),
          "size-8 text-muted-foreground/80 hover:text-foreground p-0"
        ),
        weekday: "size-8 p-0 text-xs font-medium text-muted-foreground/80",
        day_button: "cursor-pointer relative flex size-8 items-center justify-center whitespace-nowrap rounded-md p-0 text-foreground transition-200 group-[[data-selected]:not(.range-middle)]:[transition-property:color,background-color,border-radius,box-shadow] group-[[data-selected]:not(.range-middle)]:duration-150 group-data-disabled:pointer-events-none focus-visible:z-10 hover:not-in-data-selected:bg-accent group-data-selected:bg-primary hover:not-in-data-selected:text-foreground group-data-selected:text-primary-foreground group-data-disabled:text-foreground/30 group-data-disabled:line-through group-data-outside:text-foreground/30 group-data-selected:group-data-outside:text-primary-foreground outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] group-[.range-start:not(.range-end)]:rounded-e-none group-[.range-end:not(.range-start)]:rounded-s-none group-[.range-middle]:rounded-none group-[.range-middle]:group-data-selected:bg-accent group-[.range-middle]:group-data-selected:text-foreground",
        day: "group size-8 px-0 py-px text-sm",
        range_start: "range-start",
        range_end: "range-end",
        range_middle: "range-middle",
        today: "*:after:pointer-events-none *:after:absolute *:after:bottom-1 *:after:start-1/2 *:after:z-10 *:after:size-[3px] *:after:-translate-x-1/2 rtl:*:after:translate-x-1/2 *:after:rounded-full *:after:bg-primary [&[data-selected]:not(.range-middle)>*]:after:bg-background [&[data-disabled]>*]:after:bg-foreground/30 *:after:transition-colors",
        outside: "text-muted-foreground data-selected:bg-accent/50 data-selected:text-muted-foreground",
        hidden: "invisible",
        week_number: "size-8 p-0 text-xs font-medium text-muted-foreground/80",
        ...t
      },
      components: {
        Chevron: (a) => a.orientation === "left" ? /* @__PURE__ */ u.jsx(db, { className: "h-4 w-4 rtl:rotate-180" }) : /* @__PURE__ */ u.jsx(vi, { className: "h-4 w-4 rtl:rotate-180" })
      },
      ...r
    }
  );
}
const kh = R.createContext({
  variant: "default"
  // Default value
}), Pi = () => {
  const e = R.useContext(kh);
  if (!e)
    throw new Error("useCardContext must be used within a Card component");
  return e;
}, Pw = re("flex flex-col items-stretch text-card-foreground rounded-xl", {
  variants: {
    variant: {
      default: "bg-card border border-border shadow-xs black/5",
      accent: "bg-muted shadow-xs p-1"
    }
  },
  defaultVariants: {
    variant: "default"
  }
}), kw = re("flex items-center justify-between flex-wrap px-5 min-h-14 gap-2.5", {
  variants: {
    variant: {
      default: "border-b border-border",
      accent: ""
    }
  },
  defaultVariants: {
    variant: "default"
  }
}), Nw = re("grow p-5", {
  variants: {
    variant: {
      default: "",
      accent: "bg-card rounded-t-xl [&:last-child]:rounded-b-xl"
    }
  },
  defaultVariants: {
    variant: "default"
  }
}), Aw = re("grid grow", {
  variants: {
    variant: {
      default: "",
      accent: "bg-card rounded-xl"
    }
  },
  defaultVariants: {
    variant: "default"
  }
}), jw = re("flex items-center px-5 min-h-14", {
  variants: {
    variant: {
      default: "border-t border-border",
      accent: "bg-card rounded-b-xl mt-[2px]"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
function PS({
  className: e,
  variant: t = "default",
  ...n
}) {
  return /* @__PURE__ */ u.jsx(kh.Provider, { value: { variant: t || "default" }, children: /* @__PURE__ */ u.jsx("div", { "data-slot": "card", className: y(Pw({ variant: t }), e), ...n }) });
}
function kS({ className: e, ...t }) {
  const { variant: n } = Pi();
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "card-header", className: y(kw({ variant: n }), e), ...t });
}
function NS({ className: e, ...t }) {
  const { variant: n } = Pi();
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "card-content", className: y(Nw({ variant: n }), e), ...t });
}
function AS({ className: e, ...t }) {
  const { variant: n } = Pi();
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "card-table", className: y(Aw({ variant: n }), e), ...t });
}
function jS({ className: e, ...t }) {
  const { variant: n } = Pi();
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "card-footer", className: y(jw({ variant: n }), e), ...t });
}
function MS({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "card-heading", className: y("space-y-1", e), ...t });
}
function RS({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "card-toolbar", className: y("flex items-center gap-2.5", e), ...t });
}
function IS({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    "h3",
    {
      "data-slot": "card-title",
      className: y("text-base font-semibold leading-none tracking-tight", e),
      ...t
    }
  );
}
function VS({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "card-description", className: y("text-sm text-muted-foreground", e), ...t });
}
const Nh = R.createContext(null);
function ki() {
  const e = R.useContext(Nh);
  if (!e)
    throw new Error("useCarousel must be used within a <Carousel />");
  return e;
}
function BS({
  orientation: e = "horizontal",
  opts: t,
  setApi: n,
  plugins: r,
  className: a,
  children: i,
  ...o
}) {
  const [s, l] = Ab(
    {
      ...t,
      axis: e === "horizontal" ? "x" : "y"
    },
    r
  ), [c, d] = R.useState(!1), [f, m] = R.useState(!1), h = R.useCallback((b) => {
    b && (d(b.canScrollPrev()), m(b.canScrollNext()));
  }, []), p = R.useCallback(() => {
    l?.scrollPrev();
  }, [l]), g = R.useCallback(() => {
    l?.scrollNext();
  }, [l]), v = R.useCallback(
    (b) => {
      b.key === "ArrowLeft" ? (b.preventDefault(), p()) : b.key === "ArrowRight" && (b.preventDefault(), g());
    },
    [p, g]
  );
  return R.useEffect(() => {
    !l || !n || n(l);
  }, [l, n]), R.useEffect(() => {
    if (l)
      return h(l), l.on("reInit", h), l.on("select", h), () => {
        l?.off("select", h);
      };
  }, [l, h]), /* @__PURE__ */ u.jsx(
    Nh.Provider,
    {
      value: {
        carouselRef: s,
        api: l,
        opts: t,
        orientation: e || (t?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev: p,
        scrollNext: g,
        canScrollPrev: c,
        canScrollNext: f
      },
      children: /* @__PURE__ */ u.jsx(
        "div",
        {
          onKeyDownCapture: v,
          className: y("relative", a),
          role: "region",
          "aria-roledescription": "carousel",
          "data-slot": "carousel",
          ...o,
          children: i
        }
      )
    }
  );
}
function LS({ className: e, ...t }) {
  const { carouselRef: n, orientation: r } = ki();
  return /* @__PURE__ */ u.jsx("div", { ref: n, className: "overflow-hidden", "data-slot": "carousel-content", children: /* @__PURE__ */ u.jsx("div", { className: y("flex", r === "horizontal" ? "-ml-4" : "-mt-4 flex-col", e), ...t }) });
}
function FS({ className: e, ...t }) {
  const { orientation: n } = ki();
  return /* @__PURE__ */ u.jsx(
    "div",
    {
      role: "group",
      "aria-roledescription": "slide",
      "data-slot": "carousel-item",
      className: y("min-w-0 shrink-0 grow-0 basis-full", n === "horizontal" ? "pl-4" : "pt-4", e),
      ...t
    }
  );
}
function OS({
  className: e,
  variant: t = "outline",
  size: n = "icon",
  ...r
}) {
  const { orientation: a, scrollPrev: i, canScrollPrev: o } = ki();
  return /* @__PURE__ */ u.jsxs(
    Re,
    {
      "data-slot": "carousel-previous",
      variant: t,
      size: n,
      className: y(
        "absolute size-8 rounded-full",
        a === "horizontal" ? "top-1/2 -left-12 -translate-y-1/2" : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        e
      ),
      disabled: !o,
      onClick: i,
      ...r,
      children: [
        /* @__PURE__ */ u.jsx(Tf, {}),
        /* @__PURE__ */ u.jsx("span", { className: "sr-only", children: "Previous slide" })
      ]
    }
  );
}
function zS({
  className: e,
  variant: t = "outline",
  size: n = "icon",
  ...r
}) {
  const { orientation: a, scrollNext: i, canScrollNext: o } = ki();
  return /* @__PURE__ */ u.jsxs(
    Re,
    {
      "data-slot": "carousel-next",
      variant: t,
      size: n,
      className: y(
        "absolute size-8 rounded-full",
        a === "horizontal" ? "top-1/2 -right-12 -translate-y-1/2" : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        e
      ),
      disabled: !o,
      onClick: i,
      ...r,
      children: [
        /* @__PURE__ */ u.jsx(Sf, {}),
        /* @__PURE__ */ u.jsx("span", { className: "sr-only", children: "Next slide" })
      ]
    }
  );
}
const Mw = { light: "", dark: ".dark" }, Ah = R.createContext(null);
function jh() {
  const e = R.useContext(Ah);
  if (!e)
    throw new Error("useChart must be used within a <ChartContainer />");
  return e;
}
function _S({
  id: e,
  className: t,
  children: n,
  config: r,
  ...a
}) {
  const i = R.useId(), o = `chart-${e || i.replace(/:/g, "")}`;
  return /* @__PURE__ */ u.jsx(Ah.Provider, { value: { config: r }, children: /* @__PURE__ */ u.jsxs(
    "div",
    {
      "data-slot": "chart",
      "data-chart": o,
      className: y(
        "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
        t
      ),
      ...a,
      children: [
        /* @__PURE__ */ u.jsx(Rw, { id: o, config: r }),
        /* @__PURE__ */ u.jsx(Us.ResponsiveContainer, { children: n })
      ]
    }
  ) });
}
const Rw = ({ id: e, config: t }) => {
  const n = Object.entries(t).filter(([, r]) => r.theme || r.color);
  return n.length ? /* @__PURE__ */ u.jsx(
    "style",
    {
      dangerouslySetInnerHTML: {
        __html: Object.entries(Mw).map(
          ([r, a]) => `
${a} [data-chart=${e}] {
${n.map(([i, o]) => {
            const s = o.theme?.[r] || o.color;
            return s ? `  --color-${i}: ${s};` : null;
          }).join(`
`)}
}
`
        ).join(`
`)
      }
    }
  ) : null;
}, US = Us.Tooltip;
function HS({
  active: e,
  payload: t,
  className: n,
  indicator: r = "dot",
  hideLabel: a = !1,
  hideIndicator: i = !1,
  label: o,
  labelFormatter: s,
  labelClassName: l,
  formatter: c,
  color: d,
  nameKey: f,
  labelKey: m
}) {
  const { config: h } = jh(), p = R.useMemo(() => {
    if (a || !t?.length)
      return null;
    const [v] = t, b = `${m || v?.dataKey || v?.name || "value"}`, x = gs(h, v, b), C = !m && typeof o == "string" ? h[o]?.label || o : x?.label;
    return s ? /* @__PURE__ */ u.jsx("div", { className: y("font-medium", l), children: s(C, t) }) : C ? /* @__PURE__ */ u.jsx("div", { className: y("font-medium", l), children: C }) : null;
  }, [o, s, t, a, l, h, m]);
  if (!e || !t?.length)
    return null;
  const g = t.length === 1 && r !== "dot";
  return /* @__PURE__ */ u.jsxs(
    "div",
    {
      className: y(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        n
      ),
      children: [
        g ? null : p,
        /* @__PURE__ */ u.jsx("div", { className: "grid gap-1.5", children: t.map((v, b) => {
          const x = `${f || v.name || v.dataKey || "value"}`, C = gs(h, v, x), w = d || v.payload.fill || v.color;
          return /* @__PURE__ */ u.jsx(
            "div",
            {
              className: y(
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                r === "dot" && "items-center"
              ),
              children: c && v?.value !== void 0 && v.name ? c(v.value, v.name, v, b, v.payload) : /* @__PURE__ */ u.jsxs(u.Fragment, { children: [
                C?.icon ? /* @__PURE__ */ u.jsx(C.icon, {}) : !i && /* @__PURE__ */ u.jsx(
                  "div",
                  {
                    className: y("shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)", {
                      "h-2.5 w-2.5": r === "dot",
                      "w-1": r === "line",
                      "w-0 border-[1.5px] border-dashed bg-transparent": r === "dashed",
                      "my-0.5": g && r === "dashed"
                    }),
                    style: {
                      "--color-bg": w,
                      "--color-border": w
                    }
                  }
                ),
                /* @__PURE__ */ u.jsxs(
                  "div",
                  {
                    className: y("flex flex-1 justify-between leading-none", g ? "items-end" : "items-center"),
                    children: [
                      /* @__PURE__ */ u.jsxs("div", { className: "grid gap-1.5", children: [
                        g ? p : null,
                        /* @__PURE__ */ u.jsx("span", { className: "text-muted-foreground", children: C?.label || v.name })
                      ] }),
                      v.value && /* @__PURE__ */ u.jsx("span", { className: "text-foreground font-mono font-medium tabular-nums", children: v.value.toLocaleString() })
                    ]
                  }
                )
              ] })
            },
            v.dataKey
          );
        }) })
      ]
    }
  );
}
const KS = Us.Legend;
function WS({
  className: e,
  hideIcon: t = !1,
  payload: n,
  verticalAlign: r = "bottom",
  nameKey: a
}) {
  const { config: i } = jh();
  return n?.length ? /* @__PURE__ */ u.jsx("div", { className: y("flex items-center justify-center gap-4", r === "top" ? "pb-3" : "pt-3", e), children: n.map((o) => {
    const s = `${a || o.dataKey || "value"}`, l = gs(i, o, s);
    return /* @__PURE__ */ u.jsxs(
      "div",
      {
        className: y("[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"),
        children: [
          l?.icon && !t ? /* @__PURE__ */ u.jsx(l.icon, {}) : /* @__PURE__ */ u.jsx(
            "div",
            {
              className: "h-2 w-2 shrink-0 rounded-[2px]",
              style: {
                backgroundColor: o.color
              }
            }
          ),
          l?.label
        ]
      },
      o.value
    );
  }) }) : null;
}
function gs(e, t, n) {
  if (typeof t != "object" || t === null)
    return;
  const r = "payload" in t && typeof t.payload == "object" && t.payload !== null ? t.payload : void 0;
  let a = n;
  return n in t && typeof t[n] == "string" ? a = t[n] : r && n in r && typeof r[n] == "string" && (a = r[n]), a in e ? e[a] : e[n];
}
const Iw = re(
  `
    group peer bg-background shrink-0 rounded-md border border-input ring-offset-background focus-visible:outline-none 
    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 
    aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/20
    [[data-invalid=true]_&]:border-destructive/60 [[data-invalid=true]_&]:ring-destructive/10  dark:[[data-invalid=true]_&]:border-destructive dark:[[data-invalid=true]_&]:ring-destructive/20,
    data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-foreground
    `,
  {
    variants: {
      size: {
        sm: "size-4.5 [&_svg]:size-3",
        md: "size-5 [&_svg]:size-3.5",
        lg: "size-5.5 [&_svg]:size-4"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);
function Mh({
  className: e,
  size: t,
  ...n
}) {
  return /* @__PURE__ */ u.jsx(Pu.Root, { "data-slot": "checkbox", className: y(Iw({ size: t }), e), ...n, children: /* @__PURE__ */ u.jsxs(Pu.Indicator, { className: y("flex items-center justify-center text-current"), children: [
    /* @__PURE__ */ u.jsx(nt, { className: "group-data-[state=indeterminate]:hidden" }),
    /* @__PURE__ */ u.jsx(fb, { className: "hidden group-data-[state=indeterminate]:block" })
  ] }) });
}
function Vw({
  timeout: e = 2e3,
  onCopy: t
} = {}) {
  const [n, r] = R.useState(!1);
  return { isCopied: n, copyToClipboard: (i) => {
    typeof window > "u" || !navigator.clipboard.writeText || i && navigator.clipboard.writeText(i).then(() => {
      r(!0), t && t(), setTimeout(() => {
        r(!1);
      }, e);
    }, console.error);
  } };
}
const Bw = re("relative rounded-md bg-muted font-mono text-sm font-medium", {
  variants: {
    variant: {
      default: "bg-muted text-muted-foreground",
      destructive: "bg-destructive/10 text-destructive",
      outline: "border border-border bg-background text-foreground"
    },
    size: {
      default: "text-sm px-2.5 py-1.5",
      sm: "text-xs px-2 py-1.5",
      lg: "text-base px-3 py-1.5"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
function GS({
  className: e,
  variant: t,
  size: n,
  asChild: r = !1,
  showCopyButton: a = !1,
  copyText: i,
  children: o,
  ...s
}) {
  const { copyToClipboard: l, isCopied: c } = Vw(), d = r ? Qe : "code", f = i || (typeof o == "string" ? o : "");
  return /* @__PURE__ */ u.jsxs("span", { className: y("inline-flex items-center gap-2", e), "data-slot": "code", children: [
    /* @__PURE__ */ u.jsx(d, { "data-slot": "code-panel", className: y(Bw({ variant: t, size: n })), ...s, children: o }),
    a && f && /* @__PURE__ */ u.jsx(
      Re,
      {
        mode: "icon",
        size: "sm",
        variant: "ghost",
        className: "h-4 w-4 p-0 opacity-60 hover:opacity-100",
        onClick: () => l(f),
        children: c ? /* @__PURE__ */ u.jsx(nt, { className: "h-3 w-3" }) : /* @__PURE__ */ u.jsx(mb, { className: "h-3 w-3" })
      }
    )
  ] });
}
function YS({ ...e }) {
  return /* @__PURE__ */ u.jsx(Hs.Root, { "data-slot": "collapsible", ...e });
}
function qS({ ...e }) {
  return /* @__PURE__ */ u.jsx(Hs.Trigger, { "data-slot": "collapsible-trigger", ...e });
}
function ZS({
  className: e,
  children: t,
  ...n
}) {
  return /* @__PURE__ */ u.jsx(
    Hs.Content,
    {
      "data-slot": "collapsible-content",
      className: y(
        "overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        e
      ),
      ...n,
      children: t
    }
  );
}
const Lw = re(
  "flex flex-col fixed outline-0 z-50 border border-border bg-background p-6 shadow-lg shadow-black/5 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
  {
    variants: {
      variant: {
        default: "left-[50%] top-[50%] max-w-lg translate-x-[-50%] translate-y-[-50%] w-full",
        fullscreen: "inset-5"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Fw({ ...e }) {
  return /* @__PURE__ */ u.jsx(ye.Root, { "data-slot": "dialog", ...e });
}
function XS({ ...e }) {
  return /* @__PURE__ */ u.jsx(ye.Trigger, { "data-slot": "dialog-trigger", ...e });
}
function Ow({ ...e }) {
  return /* @__PURE__ */ u.jsx(ye.Portal, { "data-slot": "dialog-portal", ...e });
}
function zw({ ...e }) {
  return /* @__PURE__ */ u.jsx(ye.Close, { "data-slot": "dialog-close", ...e });
}
function _w({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    ye.Overlay,
    {
      "data-slot": "dialog-overlay",
      className: y(
        "fixed inset-0 z-50 bg-black/30 [backdrop-filter:blur(4px)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        e
      ),
      ...t
    }
  );
}
function Uw({
  className: e,
  children: t,
  showCloseButton: n = !0,
  overlay: r = !0,
  variant: a,
  ...i
}) {
  return /* @__PURE__ */ u.jsxs(Ow, { children: [
    r && /* @__PURE__ */ u.jsx(_w, {}),
    /* @__PURE__ */ u.jsxs(
      ye.Content,
      {
        "data-slot": "dialog-content",
        className: y(Lw({ variant: a }), e),
        ...i,
        children: [
          t,
          n && /* @__PURE__ */ u.jsxs(zw, { className: "cursor-pointer outline-0 absolute end-5 top-5 rounded-sm opacity-60 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
            /* @__PURE__ */ u.jsx(Os, { className: "size-4" }),
            /* @__PURE__ */ u.jsx("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] });
}
const JS = ({ className: e, ...t }) => /* @__PURE__ */ u.jsx(
  "div",
  {
    "data-slot": "dialog-header",
    className: y("flex flex-col space-y-1 text-center sm:text-start mb-5", e),
    ...t
  }
), QS = ({ className: e, ...t }) => /* @__PURE__ */ u.jsx(
  "div",
  {
    "data-slot": "dialog-footer",
    className: y("flex flex-col-reverse sm:flex-row sm:justify-end pt-5 sm:space-x-2.5", e),
    ...t
  }
);
function Hw({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    ye.Title,
    {
      "data-slot": "dialog-title",
      className: y("text-lg font-semibold leading-none tracking-tight", e),
      ...t
    }
  );
}
const eT = ({ className: e, ...t }) => /* @__PURE__ */ u.jsx("div", { "data-slot": "dialog-body", className: y("grow", e), ...t });
function tT({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    ye.Description,
    {
      "data-slot": "dialog-description",
      className: y("text-sm text-muted-foreground", e),
      ...t
    }
  );
}
function Rh({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    un,
    {
      className: y(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        e
      ),
      ...t
    }
  );
}
const nT = ({ children: e, className: t, ...n }) => /* @__PURE__ */ u.jsx(Fw, { ...n, children: /* @__PURE__ */ u.jsxs(Uw, { className: y("overflow-hidden p-0 shadow-lg", t), children: [
  /* @__PURE__ */ u.jsx(Hw, { className: "hidden" }),
  /* @__PURE__ */ u.jsx(Rh, { className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5", children: e })
] }) });
function Kw({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsxs("div", { className: "flex items-center border-border border-b px-3", "cmdk-input-wrapper": "", "data-slot": "command-input", children: [
    /* @__PURE__ */ u.jsx(hb, { className: "me-2 h-4 w-4 shrink-0 opacity-50" }),
    /* @__PURE__ */ u.jsx(
      un.Input,
      {
        className: y(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-hidden text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          e
        ),
        ...t
      }
    )
  ] });
}
function Ww({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    un.List,
    {
      "data-slot": "command-list",
      className: y("max-h-[300px] overflow-y-auto overflow-x-hidden", e),
      ...t
    }
  );
}
function Gw({ ...e }) {
  return /* @__PURE__ */ u.jsx(un.Empty, { "data-slot": "command-empty", className: "py-6 text-center text-sm", ...e });
}
function id({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    un.Group,
    {
      "data-slot": "command-group",
      className: y(
        "overflow-hidden p-1.5 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
        e
      ),
      ...t
    }
  );
}
function Yw({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    un.Separator,
    {
      "data-slot": "command-separator",
      className: y("-mx-1.5 h-px bg-border", e),
      ...t
    }
  );
}
function od({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    un.Item,
    {
      "data-slot": "command-item",
      className: y(
        "relative flex text-foreground cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        e
      ),
      ...t
    }
  );
}
const rT = ({ className: e, ...t }) => /* @__PURE__ */ u.jsx(
  "span",
  {
    "data-slot": "command-shortcut",
    className: y("ms-auto text-xs tracking-widest text-muted-foreground", e),
    ...t
  }
);
function aT({ icon: e = nt, className: t, ...n }) {
  return /* @__PURE__ */ u.jsx(
    e,
    {
      "data-slot": "command-check",
      "data-check": "true",
      className: y("size-4 ms-auto text-primary", t),
      ...n
    }
  );
}
function iT({ ...e }) {
  return /* @__PURE__ */ u.jsx(Te.Root, { "data-slot": "context-menu", ...e });
}
function oT({ ...e }) {
  return /* @__PURE__ */ u.jsx(Te.Trigger, { "data-slot": "context-menu-trigger", ...e });
}
function sT({ ...e }) {
  return /* @__PURE__ */ u.jsx(Te.Group, { "data-slot": "context-menu-group", ...e });
}
function lT({ ...e }) {
  return /* @__PURE__ */ u.jsx(Te.Portal, { "data-slot": "context-menu-portal", ...e });
}
function uT({ ...e }) {
  return /* @__PURE__ */ u.jsx(Te.Sub, { "data-slot": "context-menu-sub", ...e });
}
function cT({ ...e }) {
  return /* @__PURE__ */ u.jsx(Te.RadioGroup, { "data-slot": "context-menu-radio-group", ...e });
}
function dT({
  className: e,
  inset: t,
  children: n,
  ...r
}) {
  return /* @__PURE__ */ u.jsxs(
    Te.SubTrigger,
    {
      "data-slot": "context-menu-sub-trigger",
      "data-inset": t,
      className: y(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        e
      ),
      ...r,
      children: [
        n,
        /* @__PURE__ */ u.jsx(Pf, { className: "ml-auto" })
      ]
    }
  );
}
function fT({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    Te.SubContent,
    {
      "data-slot": "context-menu-sub-content",
      className: y(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        e
      ),
      ...t
    }
  );
}
function mT({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(Te.Portal, { children: /* @__PURE__ */ u.jsx(
    Te.Content,
    {
      "data-slot": "context-menu-content",
      className: y(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
        e
      ),
      ...t
    }
  ) });
}
function hT({
  className: e,
  inset: t,
  variant: n = "default",
  ...r
}) {
  return /* @__PURE__ */ u.jsx(
    Te.Item,
    {
      "data-slot": "context-menu-item",
      "data-inset": t,
      "data-variant": n,
      className: y(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        e
      ),
      ...r
    }
  );
}
function pT({
  className: e,
  children: t,
  checked: n,
  ...r
}) {
  return /* @__PURE__ */ u.jsxs(
    Te.CheckboxItem,
    {
      "data-slot": "context-menu-checkbox-item",
      className: y(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pe-2 ps-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        e
      ),
      checked: n,
      ...r,
      children: [
        /* @__PURE__ */ u.jsx("span", { className: "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center", children: /* @__PURE__ */ u.jsx(Te.ItemIndicator, { children: /* @__PURE__ */ u.jsx(pb, { className: "size-4" }) }) }),
        t
      ]
    }
  );
}
function gT({
  className: e,
  children: t,
  ...n
}) {
  return /* @__PURE__ */ u.jsxs(
    Te.RadioItem,
    {
      "data-slot": "context-menu-radio-item",
      className: y(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pe-2 ps-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        e
      ),
      ...n,
      children: [
        /* @__PURE__ */ u.jsx("span", { className: "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center", children: /* @__PURE__ */ u.jsx(Te.ItemIndicator, { children: /* @__PURE__ */ u.jsx(gb, { className: "size-2 fill-current" }) }) }),
        t
      ]
    }
  );
}
function vT({
  className: e,
  inset: t,
  ...n
}) {
  return /* @__PURE__ */ u.jsx(
    Te.Label,
    {
      "data-slot": "context-menu-label",
      "data-inset": t,
      className: y("text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", e),
      ...n
    }
  );
}
function bT({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    Te.Separator,
    {
      "data-slot": "context-menu-separator",
      className: y("bg-border -mx-1 my-1 h-px", e),
      ...t
    }
  );
}
function yT({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    "span",
    {
      "data-slot": "context-menu-shortcut",
      className: y("text-muted-foreground ml-auto text-xs tracking-widest", e),
      ...t
    }
  );
}
function xT({
  from: e = 0,
  to: t = 100,
  duration: n = 2,
  delay: r = 0,
  className: a,
  startOnView: i = !0,
  once: o = !1,
  inViewMargin: s,
  onComplete: l,
  format: c,
  ...d
}) {
  const f = B(null), m = cn(f, { once: o, margin: s }), [h, p] = _(!1), [g, v] = _(e), b = zn(e), x = !i || m && (!o || !h);
  return U(() => {
    if (!x) return;
    p(!0);
    const C = setTimeout(() => {
      const w = $w(b, t, {
        duration: n,
        onUpdate: (E) => v(E),
        onComplete: l
      });
      return () => w.stop();
    }, r);
    return () => clearTimeout(C);
  }, [x, e, t, n, r]), /* @__PURE__ */ u.jsx(de.span, { ref: f, className: y("inline-block", a), ...d, children: c ? c(g) : Math.round(g) });
}
const Ih = fe(void 0);
function $e() {
  const e = ee(Ih);
  if (!e)
    throw new Error("useDataGrid must be used within a DataGridProvider");
  return e;
}
function qw({
  children: e,
  table: t,
  ...n
}) {
  return /* @__PURE__ */ u.jsx(
    Ih.Provider,
    {
      value: {
        props: n,
        table: t,
        recordCount: n.recordCount,
        isLoading: n.isLoading || !1
      },
      children: e
    }
  );
}
function wT({ children: e, table: t, ...n }) {
  const r = {
    loadingMode: "skeleton",
    tableLayout: {
      dense: !1,
      cellBorder: !1,
      rowBorder: !0,
      rowRounded: !1,
      stripped: !1,
      headerSticky: !1,
      headerBackground: !0,
      headerBorder: !0,
      width: "fixed",
      columnsVisibility: !1,
      columnsResizable: !1,
      columnsPinnable: !1,
      columnsMovable: !1,
      columnsDraggable: !1,
      rowsDraggable: !1
    },
    tableClassNames: {
      base: "",
      header: "",
      headerRow: "",
      headerSticky: "sticky top-0 z-10 bg-background/90 backdrop-blur-xs",
      body: "",
      bodyRow: "",
      footer: "",
      edgeCell: ""
    }
  }, a = {
    ...r,
    ...n,
    tableLayout: {
      ...r.tableLayout,
      ...n.tableLayout || {}
    },
    tableClassNames: {
      ...r.tableClassNames,
      ...n.tableClassNames || {}
    }
  };
  if (!t)
    throw new Error('DataGrid requires a "table" prop');
  return /* @__PURE__ */ u.jsx(qw, { table: t, ...a, children: e });
}
function $T({
  children: e,
  className: t,
  border: n = !0
}) {
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "data-grid", className: y("grid w-full", n && "border border-border rounded-lg", t), children: e });
}
function Zw({ ...e }) {
  return /* @__PURE__ */ u.jsx(Ks.Root, { "data-slot": "popover", ...e });
}
function Xw({ ...e }) {
  return /* @__PURE__ */ u.jsx(Ks.Trigger, { "data-slot": "popover-trigger", ...e });
}
function Jw({
  className: e,
  align: t = "center",
  sideOffset: n = 4,
  ...r
}) {
  return /* @__PURE__ */ u.jsx(
    Ks.Content,
    {
      "data-slot": "popover-content",
      align: t,
      sideOffset: n,
      className: y(
        "z-50 w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md shadow-black/5 outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        e
      ),
      ...r
    }
  );
}
function Qw({
  className: e,
  orientation: t = "horizontal",
  decorative: n = !0,
  ...r
}) {
  return /* @__PURE__ */ u.jsx(
    jb.Root,
    {
      "data-slot": "separator",
      decorative: n,
      orientation: t,
      className: y("shrink-0 bg-border", t === "horizontal" ? "h-px w-full" : "h-full w-px", e),
      ...r
    }
  );
}
function DT({ column: e, title: t, options: n }) {
  const r = e?.getFacetedUniqueValues(), a = new Set(e?.getFilterValue());
  return /* @__PURE__ */ u.jsxs(Zw, { children: [
    /* @__PURE__ */ u.jsx(Xw, { asChild: !0, children: /* @__PURE__ */ u.jsxs(Re, { variant: "outline", size: "sm", children: [
      /* @__PURE__ */ u.jsx(vb, { className: "size-4" }),
      t,
      a?.size > 0 && /* @__PURE__ */ u.jsxs(u.Fragment, { children: [
        /* @__PURE__ */ u.jsx(Qw, { orientation: "vertical", className: "mx-2 h-4" }),
        /* @__PURE__ */ u.jsx(bo, { variant: "secondary", className: "rounded-sm px-1 font-normal lg:hidden", children: a.size }),
        /* @__PURE__ */ u.jsx("div", { className: "hidden space-x-1 lg:flex", children: a.size > 2 ? /* @__PURE__ */ u.jsxs(bo, { variant: "secondary", className: "rounded-sm px-1 font-normal", children: [
          a.size,
          " selected"
        ] }) : n.filter((i) => a.has(i.value)).map((i) => /* @__PURE__ */ u.jsx(bo, { variant: "secondary", className: "rounded-sm px-1 font-normal", children: i.label }, i.value)) })
      ] })
    ] }) }),
    /* @__PURE__ */ u.jsx(Jw, { className: "w-[200px] p-0", align: "start", children: /* @__PURE__ */ u.jsxs(Rh, { children: [
      /* @__PURE__ */ u.jsx(Kw, { placeholder: t }),
      /* @__PURE__ */ u.jsxs(Ww, { children: [
        /* @__PURE__ */ u.jsx(Gw, { children: "No results found." }),
        /* @__PURE__ */ u.jsx(id, { children: n.map((i) => {
          const o = a.has(i.value);
          return /* @__PURE__ */ u.jsxs(
            od,
            {
              onSelect: () => {
                o ? a.delete(i.value) : a.add(i.value);
                const s = Array.from(a);
                e?.setFilterValue(s.length ? s : void 0);
              },
              children: [
                /* @__PURE__ */ u.jsx(
                  "div",
                  {
                    className: y(
                      "me-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      o ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                    ),
                    children: /* @__PURE__ */ u.jsx(nt, { className: y("h-4 w-4") })
                  }
                ),
                i.icon && /* @__PURE__ */ u.jsx(i.icon, { className: "mr-2 h-4 w-4 text-muted-foreground" }),
                /* @__PURE__ */ u.jsx("span", { children: i.label }),
                r?.get(i.value) && /* @__PURE__ */ u.jsx("span", { className: "ms-auto flex h-4 w-4 items-center justify-center font-mono text-xs", children: r.get(i.value) })
              ]
            },
            i.value
          );
        }) }),
        a.size > 0 && /* @__PURE__ */ u.jsxs(u.Fragment, { children: [
          /* @__PURE__ */ u.jsx(Yw, {}),
          /* @__PURE__ */ u.jsx(id, { children: /* @__PURE__ */ u.jsx(
            od,
            {
              onSelect: () => e?.setFilterValue(void 0),
              className: "justify-center text-center",
              children: "Clear filters"
            }
          ) })
        ] })
      ] })
    ] }) })
  ] });
}
function Vh({ ...e }) {
  return /* @__PURE__ */ u.jsx(Pe.Root, { "data-slot": "dropdown-menu", ...e });
}
function e5({ ...e }) {
  return /* @__PURE__ */ u.jsx(Pe.Portal, { "data-slot": "dropdown-menu-portal", ...e });
}
function Bh({ ...e }) {
  return /* @__PURE__ */ u.jsx(Pe.Trigger, { className: "select-none", "data-slot": "dropdown-menu-trigger", ...e });
}
function t5({
  className: e,
  inset: t,
  children: n,
  ...r
}) {
  return /* @__PURE__ */ u.jsxs(
    Pe.SubTrigger,
    {
      "data-slot": "dropdown-menu-sub-trigger",
      className: y(
        "flex cursor-default gap-2 select-none items-center rounded-md px-2 py-1.5 text-sm outline-hidden",
        "focus:bg-accent focus:text-foreground",
        "data-[state=open]:bg-accent data-[state=open]:text-foreground",
        "data-[here=true]:bg-accent data-[here=true]:text-foreground",
        "[&>svg]:pointer-events-none [&_svg:not([role=img]):not([class*=text-])]:opacity-60 [&>svg]:size-4 [&>svg]:shrink-0",
        t && "ps-8",
        e
      ),
      ...r,
      children: [
        n,
        /* @__PURE__ */ u.jsx(vi, { "data-slot": "dropdown-menu-sub-trigger-indicator", className: "ms-auto size-3.5! rtl:rotate-180" })
      ]
    }
  );
}
function n5({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ u.jsx(
    Pe.SubContent,
    {
      "data-slot": "dropdown-menu-sub-content",
      className: y(
        "space-y-0.5 z-50 min-w-[8rem] overflow-hidden shadow-md shadow-black/5 rounded-md border border-border bg-popover text-popover-foreground p-2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        e
      ),
      ...t
    }
  );
}
function Lh({
  className: e,
  sideOffset: t = 4,
  ...n
}) {
  return /* @__PURE__ */ u.jsx(Pe.Portal, { children: /* @__PURE__ */ u.jsx(
    Pe.Content,
    {
      "data-slot": "dropdown-menu-content",
      sideOffset: t,
      className: y(
        "space-y-0.5 z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-md shadow-black/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        e
      ),
      ...n
    }
  ) });
}
function CT({ ...e }) {
  return /* @__PURE__ */ u.jsx(Pe.Group, { "data-slot": "dropdown-menu-group", ...e });
}
function yn({
  className: e,
  inset: t,
  variant: n,
  ...r
}) {
  return /* @__PURE__ */ u.jsx(
    Pe.Item,
    {
      "data-slot": "dropdown-menu-item",
      className: y(
        "text-foreground relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden transition-colors data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([role=img]):not([class*=text-])]:opacity-60 [&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0",
        "focus:bg-accent focus:text-foreground",
        "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
        t && "ps-8",
        n === "destructive" && "text-destructive hover:text-destructive focus:text-destructive hover:bg-destructive/5 focus:bg-destructive/5 data-[active=true]:bg-destructive/5",
        e
      ),
      ...r
    }
  );
}
function Fh({
  className: e,
  children: t,
  checked: n,
  ...r
}) {
  return /* @__PURE__ */ u.jsxs(
    Pe.CheckboxItem,
    {
      "data-slot": "dropdown-menu-checkbox-item",
      className: y(
        "relative flex cursor-default select-none items-center rounded-md py-1.5 ps-8 pe-2 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        e
      ),
      checked: n,
      ...r,
      children: [
        /* @__PURE__ */ u.jsx("span", { className: "absolute start-2 flex h-3.5 w-3.5 items-center text-muted-foreground justify-center", children: /* @__PURE__ */ u.jsx(Pe.ItemIndicator, { children: /* @__PURE__ */ u.jsx(nt, { className: "h-4 w-4 text-primary" }) }) }),
        t
      ]
    }
  );
}
function ET({
  className: e,
  children: t,
  ...n
}) {
  return /* @__PURE__ */ u.jsxs(
    Pe.RadioItem,
    {
      "data-slot": "dropdown-menu-radio-item",
      className: y(
        "relative flex cursor-default select-none items-center rounded-md py-1.5 ps-6 pe-2 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        e
      ),
      ...n,
      children: [
        /* @__PURE__ */ u.jsx("span", { className: "absolute start-1.5 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ u.jsx(Pe.ItemIndicator, { children: /* @__PURE__ */ u.jsx(zs, { className: "h-1.5 w-1.5 fill-primary stroke-primary" }) }) }),
        t
      ]
    }
  );
}
function Oh({
  className: e,
  inset: t,
  ...n
}) {
  return /* @__PURE__ */ u.jsx(
    Pe.Label,
    {
      "data-slot": "dropdown-menu-label",
      className: y("px-2 py-1.5 text-xs text-muted-foreground font-medium", t && "ps-8", e),
      ...n
    }
  );
}
function ST({ ...e }) {
  return /* @__PURE__ */ u.jsx(Pe.RadioGroup, { "data-slot": "dropdown-menu-radio-group", ...e });
}
function xa({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    Pe.Separator,
    {
      "data-slot": "dropdown-menu-separator",
      className: y("-mx-2 my-1.5 h-px bg-muted", e),
      ...t
    }
  );
}
function TT({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    "span",
    {
      "data-slot": "dropdown-menu-shortcut",
      className: y("ms-auto text-xs tracking-widest opacity-60", e),
      ...t
    }
  );
}
function r5({ ...e }) {
  return /* @__PURE__ */ u.jsx(Pe.Sub, { "data-slot": "dropdown-menu-sub", ...e });
}
function PT({
  column: e,
  title: t = "",
  icon: n,
  className: r,
  filter: a,
  visibility: i = !1
}) {
  const { isLoading: o, table: s, props: l, recordCount: c } = $e(), d = (v) => {
    const b = [...s.getState().columnOrder], x = b.indexOf(e.id);
    if (v === "left" && x > 0) {
      const C = [...b], [w] = C.splice(x, 1);
      C.splice(x - 1, 0, w), s.setColumnOrder(C);
    }
    if (v === "right" && x < b.length - 1) {
      const C = [...b], [w] = C.splice(x, 1);
      C.splice(x + 1, 0, w), s.setColumnOrder(C);
    }
  }, f = (v) => {
    const b = s.getState().columnOrder, x = b.indexOf(e.id);
    return v === "left" ? x > 0 : x < b.length - 1;
  }, m = () => /* @__PURE__ */ u.jsxs(
    "div",
    {
      className: y(
        "text-accent-foreground font-normal inline-flex h-full items-center gap-1.5 text-[0.8125rem] leading-[calc(1.125/0.8125)] [&_svg]:size-3.5 [&_svg]:opacity-60",
        r
      ),
      children: [
        n && n,
        t
      ]
    }
  ), h = () => /* @__PURE__ */ u.jsxs(
    Re,
    {
      variant: "ghost",
      className: y(
        "text-secondary-foreground rounded-md font-normal -ms-2 px-2 h-7 hover:bg-secondary data-[state=open]:bg-secondary hover:text-foreground data-[state=open]:text-foreground",
        r
      ),
      disabled: o || c === 0,
      onClick: () => {
        const v = e.getIsSorted();
        v === "asc" ? e.toggleSorting(!0) : v === "desc" ? e.clearSorting() : e.toggleSorting(!1);
      },
      children: [
        n && n,
        t,
        e.getCanSort() && (e.getIsSorted() === "desc" ? /* @__PURE__ */ u.jsx(Su, { className: "size-[0.7rem]! mt-px" }) : e.getIsSorted() === "asc" ? /* @__PURE__ */ u.jsx(Eu, { className: "size-[0.7rem]! mt-px" }) : /* @__PURE__ */ u.jsx(wb, { className: "size-[0.7rem]! mt-px" }))
      ]
    }
  ), p = () => /* @__PURE__ */ u.jsx(
    Re,
    {
      mode: "icon",
      size: "sm",
      variant: "ghost",
      className: "-me-1 size-7 rounded-md",
      onClick: () => e.pin(!1),
      "aria-label": `Unpin ${t} column`,
      title: `Unpin ${t} column`,
      children: /* @__PURE__ */ u.jsx($b, { className: "size-3.5! opacity-50!", "aria-hidden": "true" })
    }
  ), g = () => /* @__PURE__ */ u.jsxs("div", { className: "flex items-center h-full gap-1.5 justify-between", children: [
    /* @__PURE__ */ u.jsxs(Vh, { children: [
      /* @__PURE__ */ u.jsx(Bh, { asChild: !0, children: h() }),
      /* @__PURE__ */ u.jsxs(Lh, { className: "w-40", align: "start", children: [
        a && /* @__PURE__ */ u.jsx(Oh, { children: a }),
        a && (e.getCanSort() || e.getCanPin() || i) && /* @__PURE__ */ u.jsx(xa, {}),
        e.getCanSort() && /* @__PURE__ */ u.jsxs(u.Fragment, { children: [
          /* @__PURE__ */ u.jsxs(
            yn,
            {
              onClick: () => {
                e.getIsSorted() === "asc" ? e.clearSorting() : e.toggleSorting(!1);
              },
              disabled: !e.getCanSort(),
              children: [
                /* @__PURE__ */ u.jsx(Eu, { className: "size-3.5!" }),
                /* @__PURE__ */ u.jsx("span", { className: "grow", children: "Asc" }),
                e.getIsSorted() === "asc" && /* @__PURE__ */ u.jsx(nt, { className: "size-4 opacity-100! text-primary" })
              ]
            }
          ),
          /* @__PURE__ */ u.jsxs(
            yn,
            {
              onClick: () => {
                e.getIsSorted() === "desc" ? e.clearSorting() : e.toggleSorting(!0);
              },
              disabled: !e.getCanSort(),
              children: [
                /* @__PURE__ */ u.jsx(Su, { className: "size-3.5!" }),
                /* @__PURE__ */ u.jsx("span", { className: "grow", children: "Desc" }),
                e.getIsSorted() === "desc" && /* @__PURE__ */ u.jsx(nt, { className: "size-4 opacity-100! text-primary" })
              ]
            }
          )
        ] }),
        (a || e.getCanSort()) && (e.getCanSort() || e.getCanPin() || i) && /* @__PURE__ */ u.jsx(xa, {}),
        l.tableLayout?.columnsPinnable && e.getCanPin() && /* @__PURE__ */ u.jsxs(u.Fragment, { children: [
          /* @__PURE__ */ u.jsxs(yn, { onClick: () => e.pin(e.getIsPinned() === "left" ? !1 : "left"), children: [
            /* @__PURE__ */ u.jsx(bb, { className: "size-3.5!", "aria-hidden": "true" }),
            /* @__PURE__ */ u.jsx("span", { className: "grow", children: "Pin to left" }),
            e.getIsPinned() === "left" && /* @__PURE__ */ u.jsx(nt, { className: "size-4 opacity-100! text-primary" })
          ] }),
          /* @__PURE__ */ u.jsxs(yn, { onClick: () => e.pin(e.getIsPinned() === "right" ? !1 : "right"), children: [
            /* @__PURE__ */ u.jsx(yb, { className: "size-3.5!", "aria-hidden": "true" }),
            /* @__PURE__ */ u.jsx("span", { className: "grow", children: "Pin to right" }),
            e.getIsPinned() === "right" && /* @__PURE__ */ u.jsx(nt, { className: "size-4 opacity-100! text-primary" })
          ] })
        ] }),
        l.tableLayout?.columnsMovable && /* @__PURE__ */ u.jsxs(u.Fragment, { children: [
          /* @__PURE__ */ u.jsx(xa, {}),
          /* @__PURE__ */ u.jsxs(
            yn,
            {
              onClick: () => d("left"),
              disabled: !f("left") || e.getIsPinned() !== !1,
              children: [
                /* @__PURE__ */ u.jsx(Tf, { className: "size-3.5!", "aria-hidden": "true" }),
                /* @__PURE__ */ u.jsx("span", { children: "Move to Left" })
              ]
            }
          ),
          /* @__PURE__ */ u.jsxs(
            yn,
            {
              onClick: () => d("right"),
              disabled: !f("right") || e.getIsPinned() !== !1,
              children: [
                /* @__PURE__ */ u.jsx(Sf, { className: "size-3.5!", "aria-hidden": "true" }),
                /* @__PURE__ */ u.jsx("span", { children: "Move to Right" })
              ]
            }
          )
        ] }),
        l.tableLayout?.columnsVisibility && i && (e.getCanSort() || e.getCanPin() || a) && /* @__PURE__ */ u.jsx(xa, {}),
        l.tableLayout?.columnsVisibility && i && /* @__PURE__ */ u.jsxs(r5, { children: [
          /* @__PURE__ */ u.jsxs(t5, { children: [
            /* @__PURE__ */ u.jsx(xb, { className: "size-3.5!" }),
            /* @__PURE__ */ u.jsx("span", { children: "Columns" })
          ] }),
          /* @__PURE__ */ u.jsx(e5, { children: /* @__PURE__ */ u.jsx(n5, { children: s.getAllColumns().filter((v) => typeof v.accessorFn < "u" && v.getCanHide()).map((v) => /* @__PURE__ */ u.jsx(
            Fh,
            {
              checked: v.getIsVisible(),
              onSelect: (b) => b.preventDefault(),
              onCheckedChange: (b) => v.toggleVisibility(!!b),
              className: "capitalize",
              children: v.columnDef.meta?.headerTitle || v.id
            },
            v.id
          )) }) })
        ] })
      ] })
    ] }),
    l.tableLayout?.columnsPinnable && e.getCanPin() && e.getIsPinned() && p()
  ] });
  return l.tableLayout?.columnsMovable || l.tableLayout?.columnsVisibility && i || l.tableLayout?.columnsPinnable && e.getCanPin() || a ? g() : e.getCanSort() || l.tableLayout?.columnsResizable && e.getCanResize() ? /* @__PURE__ */ u.jsx("div", { className: "flex items-center h-full", children: h() }) : m();
}
function kT({ table: e, trigger: t }) {
  return /* @__PURE__ */ u.jsxs(Vh, { children: [
    /* @__PURE__ */ u.jsx(Bh, { asChild: !0, children: t }),
    /* @__PURE__ */ u.jsxs(Lh, { align: "end", className: "min-w-[150px]", children: [
      /* @__PURE__ */ u.jsx(Oh, { className: "font-medium", children: "Toggle Columns" }),
      e.getAllColumns().filter((n) => typeof n.accessorFn < "u" && n.getCanHide()).map((n) => /* @__PURE__ */ u.jsx(
        Fh,
        {
          className: "capitalize",
          checked: n.getIsVisible(),
          onSelect: (r) => r.preventDefault(),
          onCheckedChange: (r) => n.toggleVisibility(!!r),
          children: n.columnDef.meta?.headerTitle || n.id
        },
        n.id
      ))
    ] })
  ] });
}
const Dl = R.createContext({ indicatorPosition: "left", indicator: null, indicatorVisibility: !0 }), a5 = ({
  indicatorPosition: e = "left",
  indicatorVisibility: t = !0,
  indicator: n,
  ...r
}) => /* @__PURE__ */ u.jsx(Dl.Provider, { value: { indicatorPosition: e, indicatorVisibility: t, indicator: n }, children: /* @__PURE__ */ u.jsx(Me.Root, { ...r }) });
function NT({ ...e }) {
  return /* @__PURE__ */ u.jsx(Me.Group, { "data-slot": "select-group", ...e });
}
function i5({ ...e }) {
  return /* @__PURE__ */ u.jsx(Me.Value, { "data-slot": "select-value", ...e });
}
const o5 = re(
  `
    flex bg-background w-full items-center justify-between outline-none border border-input shadow-xs shadow-black/5 transition-shadow 
    text-foreground data-placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] 
    focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 
    aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/20
    [[data-invalid=true]_&]:border-destructive/60 [[data-invalid=true]_&]:ring-destructive/10  dark:[[data-invalid=true]_&]:border-destructive dark:[[data-invalid=true]_&]:ring-destructive/20
  `,
  {
    variants: {
      size: {
        sm: "h-7 px-2.5 text-xs gap-1 rounded-md",
        md: "h-8.5 px-3 text-[0.8125rem] leading-(--text-sm--line-height) gap-1 rounded-md",
        lg: "h-10 px-4 text-sm gap-1.5 rounded-md"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);
function s5({ className: e, children: t, size: n, ...r }) {
  return /* @__PURE__ */ u.jsxs(
    Me.Trigger,
    {
      "data-slot": "select-trigger",
      className: y(o5({ size: n }), e),
      ...r,
      children: [
        t,
        /* @__PURE__ */ u.jsx(Me.Icon, { asChild: !0, children: /* @__PURE__ */ u.jsx(Wr, { className: "h-4 w-4 opacity-60 -me-0.5" }) })
      ]
    }
  );
}
function l5({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    Me.ScrollUpButton,
    {
      "data-slot": "select-scroll-up-button",
      className: y("flex cursor-default items-center justify-center py-1", e),
      ...t,
      children: /* @__PURE__ */ u.jsx(Db, { className: "h-4 w-4" })
    }
  );
}
function u5({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ u.jsx(
    Me.ScrollDownButton,
    {
      "data-slot": "select-scroll-down-button",
      className: y("flex cursor-default items-center justify-center py-1", e),
      ...t,
      children: /* @__PURE__ */ u.jsx(Wr, { className: "h-4 w-4" })
    }
  );
}
function c5({
  className: e,
  children: t,
  position: n = "popper",
  ...r
}) {
  return /* @__PURE__ */ u.jsx(Me.Portal, { children: /* @__PURE__ */ u.jsxs(
    Me.Content,
    {
      "data-slot": "select-content",
      className: y(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover shadow-md shadow-black/5 text-secondary-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        n === "popper" && "data-[side=bottom]:translate-y-1.5 data-[side=left]:-translate-x-1.5 data-[side=right]:translate-x-1.5 data-[side=top]:-translate-y-1.5",
        e
      ),
      position: n,
      ...r,
      children: [
        /* @__PURE__ */ u.jsx(l5, {}),
        /* @__PURE__ */ u.jsx(
          Me.Viewport,
          {
            className: y(
              "p-1.5",
              n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
            ),
            children: t
          }
        ),
        /* @__PURE__ */ u.jsx(u5, {})
      ]
    }
  ) });
}
function AT({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    Me.Label,
    {
      "data-slot": "select-label",
      className: y("py-1.5 ps-8 pe-2 text-xs text-muted-foreground font-medium", e),
      ...t
    }
  );
}
function d5({ className: e, children: t, ...n }) {
  const { indicatorPosition: r, indicatorVisibility: a, indicator: i } = R.useContext(Dl);
  return /* @__PURE__ */ u.jsxs(
    Me.Item,
    {
      "data-slot": "select-item",
      className: y(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 text-sm outline-hidden text-foreground hover:bg-accent focus:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50",
        r === "left" ? "ps-8 pe-2" : "pe-8 ps-2",
        e
      ),
      ...n,
      children: [
        a && (i && $f(i) ? i : /* @__PURE__ */ u.jsx(
          "span",
          {
            className: y(
              "absolute flex h-3.5 w-3.5 items-center justify-center",
              r === "left" ? "start-2" : "end-2"
            ),
            children: /* @__PURE__ */ u.jsx(Me.ItemIndicator, { children: /* @__PURE__ */ u.jsx(nt, { className: "h-4 w-4 text-primary" }) })
          }
        )),
        /* @__PURE__ */ u.jsx(Me.ItemText, { children: t })
      ]
    }
  );
}
function jT({
  children: e,
  className: t,
  ...n
}) {
  const { indicatorPosition: r } = R.useContext(Dl);
  return /* @__PURE__ */ u.jsx(
    "span",
    {
      "data-slot": "select-indicator",
      className: y(
        "absolute flex top-1/2 -translate-y-1/2 items-center justify-center",
        r === "left" ? "start-2" : "end-2",
        t
      ),
      ...n,
      children: /* @__PURE__ */ u.jsx(Me.ItemIndicator, { children: e })
    }
  );
}
function MT({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    Me.Separator,
    {
      "data-slot": "select-separator",
      className: y("-mx-1.5 my-1.5 h-px bg-border", e),
      ...t
    }
  );
}
function sd({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "skeleton", className: y("animate-pulse rounded-md bg-accent", e), ...t });
}
function RT(e) {
  const { table: t, recordCount: n, isLoading: r } = $e(), i = { ...{
    sizes: [5, 10, 25, 50, 100],
    sizesLabel: "Show",
    sizesDescription: "per page",
    sizesSkeleton: /* @__PURE__ */ u.jsx(sd, { className: "h-8 w-44" }),
    moreLimit: 5,
    more: !1,
    info: "{from} - {to} of {count}",
    infoSkeleton: /* @__PURE__ */ u.jsx(sd, { className: "h-8 w-60" })
  }, ...e }, o = "size-7 p-0 text-sm", s = o + " rtl:transform rtl:rotate-180", l = t.getState().pagination.pageIndex, c = t.getState().pagination.pageSize, d = l * c + 1, f = Math.min((l + 1) * c, n), m = t.getPageCount(), h = i?.info ? i.info.replace("{from}", d.toString()).replace("{to}", f.toString()).replace("{count}", n.toString()) : `${d} - ${f} of ${n}`, p = i?.moreLimit || 5, g = Math.floor(l / p) * p, v = Math.min(g + p, m), b = () => {
    const w = [];
    for (let E = g; E < v; E++)
      w.push(
        /* @__PURE__ */ u.jsx(
          Re,
          {
            size: "sm",
            mode: "icon",
            variant: "ghost",
            className: y(o, "text-muted-foreground", {
              "bg-accent text-accent-foreground": l === E
            }),
            onClick: () => {
              l !== E && t.setPageIndex(E);
            },
            children: E + 1
          },
          E
        )
      );
    return w;
  }, x = () => g > 0 ? /* @__PURE__ */ u.jsx(
    Re,
    {
      size: "sm",
      mode: "icon",
      className: o,
      variant: "ghost",
      onClick: () => t.setPageIndex(g - 1),
      children: "..."
    }
  ) : null, C = () => v < m ? /* @__PURE__ */ u.jsx(
    Re,
    {
      className: o,
      variant: "ghost",
      size: "sm",
      mode: "icon",
      onClick: () => t.setPageIndex(v),
      children: "..."
    }
  ) : null;
  return /* @__PURE__ */ u.jsxs(
    "div",
    {
      "data-slot": "data-grid-pagination",
      className: y(
        "flex flex-wrap flex-col sm:flex-row justify-between items-center gap-2.5 py-2.5 sm:py-0 grow",
        i?.className
      ),
      children: [
        /* @__PURE__ */ u.jsx("div", { className: "flex flex-wrap items-center space-x-2.5 pb-2.5 sm:pb-0 order-2 sm:order-1", children: r ? i?.sizesSkeleton : /* @__PURE__ */ u.jsxs(u.Fragment, { children: [
          /* @__PURE__ */ u.jsx("div", { className: "text-sm text-muted-foreground", children: "Rows per page" }),
          /* @__PURE__ */ u.jsxs(
            a5,
            {
              value: `${c}`,
              indicatorPosition: "right",
              onValueChange: (w) => {
                const E = Number(w);
                t.setPageSize(E);
              },
              children: [
                /* @__PURE__ */ u.jsx(s5, { className: "w-fit", size: "sm", children: /* @__PURE__ */ u.jsx(i5, { placeholder: `${c}` }) }),
                /* @__PURE__ */ u.jsx(c5, { side: "top", className: "min-w-[50px]", children: i?.sizes?.map((w) => /* @__PURE__ */ u.jsx(d5, { value: `${w}`, children: w }, w)) })
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ u.jsx("div", { className: "flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-2.5 pt-2.5 sm:pt-0 order-1 sm:order-2", children: r ? i?.infoSkeleton : /* @__PURE__ */ u.jsxs(u.Fragment, { children: [
          /* @__PURE__ */ u.jsx("div", { className: "text-sm text-muted-foreground text-nowrap order-2 sm:order-1", children: h }),
          m > 1 && /* @__PURE__ */ u.jsxs("div", { className: "flex items-center space-x-1 order-1 sm:order-2", children: [
            /* @__PURE__ */ u.jsxs(
              Re,
              {
                size: "sm",
                mode: "icon",
                variant: "ghost",
                className: s,
                onClick: () => t.previousPage(),
                disabled: !t.getCanPreviousPage(),
                children: [
                  /* @__PURE__ */ u.jsx("span", { className: "sr-only", children: "Go to previous page" }),
                  /* @__PURE__ */ u.jsx(Cb, { className: "size-4" })
                ]
              }
            ),
            x(),
            b(),
            C(),
            /* @__PURE__ */ u.jsxs(
              Re,
              {
                size: "sm",
                mode: "icon",
                variant: "ghost",
                className: s,
                onClick: () => t.nextPage(),
                disabled: !t.getCanNextPage(),
                children: [
                  /* @__PURE__ */ u.jsx("span", { className: "sr-only", children: "Go to next page" }),
                  /* @__PURE__ */ u.jsx(Pf, { className: "size-4" })
                ]
              }
            )
          ] })
        ] }) })
      ]
    }
  );
}
/**
   * react-table
   *
   * Copyright (c) TanStack
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   */
function _n(e, t) {
  return e ? f5(e) ? /* @__PURE__ */ R.createElement(e, t) : e : null;
}
function f5(e) {
  return m5(e) || typeof e == "function" || h5(e);
}
function m5(e) {
  return typeof e == "function" && (() => {
    const t = Object.getPrototypeOf(e);
    return t.prototype && t.prototype.isReactComponent;
  })();
}
function h5(e) {
  return typeof e == "object" && typeof e.$$typeof == "symbol" && ["react.memo", "react.forward_ref"].includes(e.$$typeof.description);
}
const p5 = re("", {
  variants: {
    size: {
      dense: "px-2.5 h-8",
      default: "px-4"
    }
  },
  defaultVariants: {
    size: "default"
  }
}), zh = re("", {
  variants: {
    size: {
      dense: "px-2.5 py-2",
      default: "px-4 py-3"
    }
  },
  defaultVariants: {
    size: "default"
  }
});
function _h(e) {
  const t = e.getIsPinned();
  return {
    left: t === "left" ? `${e.getStart("left")}px` : void 0,
    right: t === "right" ? `${e.getAfter("right")}px` : void 0,
    position: t ? "sticky" : "relative",
    width: e.getSize(),
    zIndex: t ? 1 : 0
  };
}
function Cl({ children: e }) {
  const { props: t } = $e();
  return /* @__PURE__ */ u.jsx(
    "table",
    {
      "data-slot": "data-grid-table",
      className: y(
        "w-full align-middle caption-bottom text-left rtl:text-right text-foreground font-normal text-sm",
        !t.tableLayout?.columnsDraggable && "border-separate border-spacing-0",
        t.tableLayout?.width === "fixed" ? "table-fixed" : "table-auto",
        t.tableClassNames?.base
      ),
      children: e
    }
  );
}
function El({ children: e }) {
  const { props: t } = $e();
  return /* @__PURE__ */ u.jsx(
    "thead",
    {
      className: y(
        t.tableClassNames?.header,
        t.tableLayout?.headerSticky && t.tableClassNames?.headerSticky
      ),
      children: e
    }
  );
}
function Sl({
  children: e,
  headerGroup: t
}) {
  const { props: n } = $e();
  return /* @__PURE__ */ u.jsx(
    "tr",
    {
      className: y(
        "bg-muted/40",
        n.tableLayout?.headerBorder && "[&>th]:border-b",
        n.tableLayout?.cellBorder && "[&_>:last-child]:border-e-0",
        n.tableLayout?.stripped && "bg-transparent",
        n.tableLayout?.headerBackground === !1 && "bg-transparent",
        n.tableClassNames?.headerRow
      ),
      children: e
    },
    t.id
  );
}
function Tl({
  children: e,
  header: t,
  dndRef: n,
  dndStyle: r
}) {
  const { props: a } = $e(), { column: i } = t, o = i.getIsPinned(), s = o === "left" && i.getIsLastColumn("left"), l = o === "right" && i.getIsFirstColumn("right"), c = p5({
    size: a.tableLayout?.dense ? "dense" : "default"
  });
  return /* @__PURE__ */ u.jsx(
    "th",
    {
      ref: n,
      style: {
        ...a.tableLayout?.width === "fixed" && {
          width: `${t.getSize()}px`
        },
        ...a.tableLayout?.columnsPinnable && i.getCanPin() && _h(i),
        ...r || null
      },
      "data-pinned": o || void 0,
      "data-last-col": s ? "left" : l ? "right" : void 0,
      className: y(
        "relative h-10 text-left rtl:text-right align-middle font-normal text-accent-foreground [&:has([role=checkbox])]:pe-0",
        c,
        a.tableLayout?.cellBorder && "border-e",
        a.tableLayout?.columnsResizable && i.getCanResize() && "truncate",
        a.tableLayout?.columnsPinnable && i.getCanPin() && "[&:not([data-pinned]):has(+[data-pinned])_div.cursor-col-resize:last-child]:opacity-0 [&[data-last-col=left]_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=left][data-last-col=left]]:border-e! [&[data-pinned=right]:last-child_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=right][data-last-col=right]]:border-s! [&[data-pinned][data-last-col]]:border-border data-pinned:bg-muted/90 data-pinned:backdrop-blur-xs",
        t.column.columnDef.meta?.headerClassName,
        i.getIndex() === 0 || i.getIndex() === t.headerGroup.headers.length - 1 ? a.tableClassNames?.edgeCell : ""
      ),
      children: e
    },
    t.id
  );
}
function Pl({ header: e }) {
  const { column: t } = e;
  return /* @__PURE__ */ u.jsx(
    "div",
    {
      onDoubleClick: () => t.resetSize(),
      onMouseDown: e.getResizeHandler(),
      onTouchStart: e.getResizeHandler(),
      className: "absolute top-0 h-full w-4 cursor-col-resize user-select-none touch-none -end-2 z-10 flex justify-center before:absolute before:w-px before:inset-y-0 before:bg-border before:-translate-x-px"
    }
  );
}
function kl() {
  return /* @__PURE__ */ u.jsx("tbody", { "aria-hidden": "true", className: "h-2" });
}
function Nl({ children: e }) {
  const { props: t } = $e();
  return /* @__PURE__ */ u.jsx(
    "tbody",
    {
      className: y(
        "[&_tr:last-child]:border-0",
        t.tableLayout?.rowRounded && "[&_td:first-child]:rounded-s-lg [&_td:last-child]:rounded-e-lg",
        t.tableClassNames?.body
      ),
      children: e
    }
  );
}
function Al({ children: e }) {
  const { table: t, props: n } = $e();
  return /* @__PURE__ */ u.jsx(
    "tr",
    {
      className: y(
        "hover:bg-muted/40 data-[state=selected]:bg-muted/50",
        n.onRowClick && "cursor-pointer",
        !n.tableLayout?.stripped && n.tableLayout?.rowBorder && "border-b border-border [&:not(:last-child)>td]:border-b",
        n.tableLayout?.cellBorder && "[&_>:last-child]:border-e-0",
        n.tableLayout?.stripped && "odd:bg-muted/90 hover:bg-transparent odd:hover:bg-muted",
        t.options.enableRowSelection && "[&_>:first-child]:relative",
        n.tableClassNames?.bodyRow
      ),
      children: e
    }
  );
}
function jl({ children: e, column: t }) {
  const { props: n, table: r } = $e(), a = zh({
    size: n.tableLayout?.dense ? "dense" : "default"
  });
  return /* @__PURE__ */ u.jsx(
    "td",
    {
      className: y(
        "align-middle",
        a,
        n.tableLayout?.cellBorder && "border-e",
        n.tableLayout?.columnsResizable && t.getCanResize() && "truncate",
        t.columnDef.meta?.cellClassName,
        n.tableLayout?.columnsPinnable && t.getCanPin() && '[&[data-pinned=left][data-last-col=left]]:border-e! [&[data-pinned=right][data-last-col=right]]:border-s! [&[data-pinned][data-last-col]]:border-border data-pinned:bg-background/90 data-pinned:backdrop-blur-xs"',
        t.getIndex() === 0 || t.getIndex() === r.getVisibleFlatColumns().length - 1 ? n.tableClassNames?.edgeCell : ""
      ),
      children: e
    }
  );
}
function Ml({
  children: e,
  row: t,
  dndRef: n,
  dndStyle: r
}) {
  const { props: a, table: i } = $e();
  return /* @__PURE__ */ u.jsx(
    "tr",
    {
      ref: n,
      style: { ...r || null },
      "data-state": i.options.enableRowSelection && t.getIsSelected() ? "selected" : void 0,
      onClick: () => a.onRowClick && a.onRowClick(t.original),
      className: y(
        "hover:bg-muted/40 data-[state=selected]:bg-muted/50",
        a.onRowClick && "cursor-pointer",
        !a.tableLayout?.stripped && a.tableLayout?.rowBorder && "border-b border-border [&:not(:last-child)>td]:border-b",
        a.tableLayout?.cellBorder && "[&_>:last-child]:border-e-0",
        a.tableLayout?.stripped && "odd:bg-muted/90 hover:bg-transparent odd:hover:bg-muted",
        i.options.enableRowSelection && "[&_>:first-child]:relative",
        a.tableClassNames?.bodyRow
      ),
      children: e
    }
  );
}
function Uh({ row: e }) {
  const { props: t, table: n } = $e();
  return /* @__PURE__ */ u.jsx("tr", { className: y(t.tableLayout?.rowBorder && "[&:not(:last-child)>td]:border-b"), children: /* @__PURE__ */ u.jsx("td", { colSpan: e.getVisibleCells().length, children: n.getAllColumns().find((r) => r.columnDef.meta?.expandedContent)?.columnDef.meta?.expandedContent?.(e.original) }) });
}
function Rl({
  children: e,
  cell: t,
  dndRef: n,
  dndStyle: r
}) {
  const { props: a } = $e(), { column: i, row: o } = t, s = i.getIsPinned(), l = s === "left" && i.getIsLastColumn("left"), c = s === "right" && i.getIsFirstColumn("right"), d = zh({
    size: a.tableLayout?.dense ? "dense" : "default"
  });
  return /* @__PURE__ */ u.jsx(
    "td",
    {
      ref: n,
      ...a.tableLayout?.columnsDraggable && !s ? { cell: t } : {},
      style: {
        ...a.tableLayout?.columnsPinnable && i.getCanPin() && _h(i),
        ...r || null
      },
      "data-pinned": s || void 0,
      "data-last-col": l ? "left" : c ? "right" : void 0,
      className: y(
        "align-middle",
        d,
        a.tableLayout?.cellBorder && "border-e",
        a.tableLayout?.columnsResizable && i.getCanResize() && "truncate",
        t.column.columnDef.meta?.cellClassName,
        a.tableLayout?.columnsPinnable && i.getCanPin() && '[&[data-pinned=left][data-last-col=left]]:border-e! [&[data-pinned=right][data-last-col=right]]:border-s! [&[data-pinned][data-last-col]]:border-border data-pinned:bg-background/90 data-pinned:backdrop-blur-xs"',
        i.getIndex() === 0 || i.getIndex() === o.getVisibleCells().length - 1 ? a.tableClassNames?.edgeCell : ""
      ),
      children: e
    },
    t.id
  );
}
function Il() {
  const { table: e, props: t } = $e(), n = e.getAllColumns().length;
  return /* @__PURE__ */ u.jsx("tr", { children: /* @__PURE__ */ u.jsx("td", { colSpan: n, className: "text-center text-muted-foreground py-6", children: t.emptyMessage || "No data available" }) });
}
function IT() {
  const { props: e } = $e();
  return /* @__PURE__ */ u.jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", children: /* @__PURE__ */ u.jsxs("div", { className: "text-muted-foreground bg-card  flex items-center gap-2 px-4 py-2 font-medium leading-none text-sm border shadow-xs rounded-md", children: [
    /* @__PURE__ */ u.jsxs(
      "svg",
      {
        className: "animate-spin -ml-1 h-5 w-5 text-muted-foreground",
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        children: [
          /* @__PURE__ */ u.jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3" }),
          /* @__PURE__ */ u.jsx(
            "path",
            {
              className: "opacity-75",
              fill: "currentColor",
              d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            }
          )
        ]
      }
    ),
    e.loadingMessage || "Loading..."
  ] }) });
}
function VT({ row: e, size: t }) {
  return /* @__PURE__ */ u.jsxs(u.Fragment, { children: [
    /* @__PURE__ */ u.jsx(
      "div",
      {
        className: y("hidden absolute top-0 bottom-0 start-0 w-[2px] bg-primary", e.getIsSelected() && "block")
      }
    ),
    /* @__PURE__ */ u.jsx(
      Mh,
      {
        checked: e.getIsSelected(),
        onCheckedChange: (n) => e.toggleSelected(!!n),
        "aria-label": "Select row",
        size: t ?? "sm",
        className: "align-[inherit]"
      }
    )
  ] });
}
function BT({ size: e }) {
  const { table: t, recordCount: n, isLoading: r } = $e();
  return /* @__PURE__ */ u.jsx(
    Mh,
    {
      checked: t.getIsAllPageRowsSelected() || t.getIsSomePageRowsSelected() && "indeterminate",
      disabled: r || n === 0,
      onCheckedChange: (a) => t.toggleAllPageRowsSelected(!!a),
      "aria-label": "Select all",
      size: e,
      className: "align-[inherit]"
    }
  );
}
function LT() {
  const { table: e, isLoading: t, props: n } = $e(), r = e.getState().pagination;
  return /* @__PURE__ */ u.jsxs(Cl, { children: [
    /* @__PURE__ */ u.jsx(El, { children: e.getHeaderGroups().map((a, i) => /* @__PURE__ */ u.jsx(Sl, { headerGroup: a, children: a.headers.map((o, s) => {
      const { column: l } = o;
      return /* @__PURE__ */ u.jsxs(Tl, { header: o, children: [
        o.isPlaceholder ? null : _n(o.column.columnDef.header, o.getContext()),
        n.tableLayout?.columnsResizable && l.getCanResize() && /* @__PURE__ */ u.jsx(Pl, { header: o })
      ] }, s);
    }) }, i)) }),
    (n.tableLayout?.stripped || !n.tableLayout?.rowBorder) && /* @__PURE__ */ u.jsx(kl, {}),
    /* @__PURE__ */ u.jsx(Nl, { children: n.loadingMode === "skeleton" && t && r?.pageSize ? Array.from({ length: r.pageSize }).map((a, i) => /* @__PURE__ */ u.jsx(Al, { children: e.getVisibleFlatColumns().map((o, s) => /* @__PURE__ */ u.jsx(jl, { column: o, children: o.columnDef.meta?.skeleton }, s)) }, i)) : e.getRowModel().rows.length ? e.getRowModel().rows.map((a, i) => /* @__PURE__ */ u.jsxs(gi, { children: [
      /* @__PURE__ */ u.jsx(Ml, { row: a, children: a.getVisibleCells().map((o, s) => /* @__PURE__ */ u.jsx(Rl, { cell: o, children: _n(o.column.columnDef.cell, o.getContext()) }, s)) }, i),
      a.getIsExpanded() && /* @__PURE__ */ u.jsx(Uh, { row: a })
    ] }, a.id)) : /* @__PURE__ */ u.jsx(Il, {}) })
  ] });
}
function g5() {
  for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
    t[n] = arguments[n];
  return F(
    () => (r) => {
      t.forEach((a) => a(r));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    t
  );
}
const Ni = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u";
function Xn(e) {
  const t = Object.prototype.toString.call(e);
  return t === "[object Window]" || // In Electron context the Window object serializes to [object global]
  t === "[object global]";
}
function Vl(e) {
  return "nodeType" in e;
}
function Fe(e) {
  var t, n;
  return e ? Xn(e) ? e : Vl(e) && (t = (n = e.ownerDocument) == null ? void 0 : n.defaultView) != null ? t : window : window;
}
function Bl(e) {
  const {
    Document: t
  } = Fe(e);
  return e instanceof t;
}
function Jr(e) {
  return Xn(e) ? !1 : e instanceof Fe(e).HTMLElement;
}
function Hh(e) {
  return e instanceof Fe(e).SVGElement;
}
function Jn(e) {
  return e ? Xn(e) ? e.document : Vl(e) ? Bl(e) ? e : Jr(e) || Hh(e) ? e.ownerDocument : document : document : document;
}
const it = Ni ? wf : U;
function Ai(e) {
  const t = B(e);
  return it(() => {
    t.current = e;
  }), G(function() {
    for (var n = arguments.length, r = new Array(n), a = 0; a < n; a++)
      r[a] = arguments[a];
    return t.current == null ? void 0 : t.current(...r);
  }, []);
}
function v5() {
  const e = B(null), t = G((r, a) => {
    e.current = setInterval(r, a);
  }, []), n = G(() => {
    e.current !== null && (clearInterval(e.current), e.current = null);
  }, []);
  return [t, n];
}
function Vr(e, t) {
  t === void 0 && (t = [e]);
  const n = B(e);
  return it(() => {
    n.current !== e && (n.current = e);
  }, t), n;
}
function Qr(e, t) {
  const n = B();
  return F(
    () => {
      const r = e(n.current);
      return n.current = r, r;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...t]
  );
}
function ei(e) {
  const t = Ai(e), n = B(null), r = G(
    (a) => {
      a !== n.current && t?.(a, n.current), n.current = a;
    },
    //eslint-disable-next-line
    []
  );
  return [n, r];
}
function ti(e) {
  const t = B();
  return U(() => {
    t.current = e;
  }, [e]), t.current;
}
let yo = {};
function ea(e, t) {
  return F(() => {
    if (t)
      return t;
    const n = yo[e] == null ? 0 : yo[e] + 1;
    return yo[e] = n, e + "-" + n;
  }, [e, t]);
}
function Kh(e) {
  return function(t) {
    for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), a = 1; a < n; a++)
      r[a - 1] = arguments[a];
    return r.reduce((i, o) => {
      const s = Object.entries(o);
      for (const [l, c] of s) {
        const d = i[l];
        d != null && (i[l] = d + e * c);
      }
      return i;
    }, {
      ...t
    });
  };
}
const Mn = /* @__PURE__ */ Kh(1), Br = /* @__PURE__ */ Kh(-1);
function b5(e) {
  return "clientX" in e && "clientY" in e;
}
function ji(e) {
  if (!e)
    return !1;
  const {
    KeyboardEvent: t
  } = Fe(e.target);
  return t && e instanceof t;
}
function y5(e) {
  if (!e)
    return !1;
  const {
    TouchEvent: t
  } = Fe(e.target);
  return t && e instanceof t;
}
function ni(e) {
  if (y5(e)) {
    if (e.touches && e.touches.length) {
      const {
        clientX: t,
        clientY: n
      } = e.touches[0];
      return {
        x: t,
        y: n
      };
    } else if (e.changedTouches && e.changedTouches.length) {
      const {
        clientX: t,
        clientY: n
      } = e.changedTouches[0];
      return {
        x: t,
        y: n
      };
    }
  }
  return b5(e) ? {
    x: e.clientX,
    y: e.clientY
  } : null;
}
const He = /* @__PURE__ */ Object.freeze({
  Translate: {
    toString(e) {
      if (!e)
        return;
      const {
        x: t,
        y: n
      } = e;
      return "translate3d(" + (t ? Math.round(t) : 0) + "px, " + (n ? Math.round(n) : 0) + "px, 0)";
    }
  },
  Scale: {
    toString(e) {
      if (!e)
        return;
      const {
        scaleX: t,
        scaleY: n
      } = e;
      return "scaleX(" + t + ") scaleY(" + n + ")";
    }
  },
  Transform: {
    toString(e) {
      if (e)
        return [He.Translate.toString(e), He.Scale.toString(e)].join(" ");
    }
  },
  Transition: {
    toString(e) {
      let {
        property: t,
        duration: n,
        easing: r
      } = e;
      return t + " " + n + "ms " + r;
    }
  }
}), ld = "a,frame,iframe,input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled),*[tabindex]";
function x5(e) {
  return e.matches(ld) ? e : e.querySelector(ld);
}
const w5 = {
  display: "none"
};
function $5(e) {
  let {
    id: t,
    value: n
  } = e;
  return W.createElement("div", {
    id: t,
    style: w5
  }, n);
}
function D5(e) {
  let {
    id: t,
    announcement: n,
    ariaLiveType: r = "assertive"
  } = e;
  const a = {
    position: "fixed",
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    margin: -1,
    border: 0,
    padding: 0,
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    clipPath: "inset(100%)",
    whiteSpace: "nowrap"
  };
  return W.createElement("div", {
    id: t,
    style: a,
    role: "status",
    "aria-live": r,
    "aria-atomic": !0
  }, n);
}
function C5() {
  const [e, t] = _("");
  return {
    announce: G((r) => {
      r != null && t(r);
    }, []),
    announcement: e
  };
}
const Wh = /* @__PURE__ */ fe(null);
function E5(e) {
  const t = ee(Wh);
  U(() => {
    if (!t)
      throw new Error("useDndMonitor must be used within a children of <DndContext>");
    return t(e);
  }, [e, t]);
}
function S5() {
  const [e] = _(() => /* @__PURE__ */ new Set()), t = G((r) => (e.add(r), () => e.delete(r)), [e]);
  return [G((r) => {
    let {
      type: a,
      event: i
    } = r;
    e.forEach((o) => {
      var s;
      return (s = o[a]) == null ? void 0 : s.call(o, i);
    });
  }, [e]), t];
}
const T5 = {
  draggable: `
    To pick up a draggable item, press the space bar.
    While dragging, use the arrow keys to move the item.
    Press space again to drop the item in its new position, or press escape to cancel.
  `
}, P5 = {
  onDragStart(e) {
    let {
      active: t
    } = e;
    return "Picked up draggable item " + t.id + ".";
  },
  onDragOver(e) {
    let {
      active: t,
      over: n
    } = e;
    return n ? "Draggable item " + t.id + " was moved over droppable area " + n.id + "." : "Draggable item " + t.id + " is no longer over a droppable area.";
  },
  onDragEnd(e) {
    let {
      active: t,
      over: n
    } = e;
    return n ? "Draggable item " + t.id + " was dropped over droppable area " + n.id : "Draggable item " + t.id + " was dropped.";
  },
  onDragCancel(e) {
    let {
      active: t
    } = e;
    return "Dragging was cancelled. Draggable item " + t.id + " was dropped.";
  }
};
function k5(e) {
  let {
    announcements: t = P5,
    container: n,
    hiddenTextDescribedById: r,
    screenReaderInstructions: a = T5
  } = e;
  const {
    announce: i,
    announcement: o
  } = C5(), s = ea("DndLiveRegion"), [l, c] = _(!1);
  if (U(() => {
    c(!0);
  }, []), E5(F(() => ({
    onDragStart(f) {
      let {
        active: m
      } = f;
      i(t.onDragStart({
        active: m
      }));
    },
    onDragMove(f) {
      let {
        active: m,
        over: h
      } = f;
      t.onDragMove && i(t.onDragMove({
        active: m,
        over: h
      }));
    },
    onDragOver(f) {
      let {
        active: m,
        over: h
      } = f;
      i(t.onDragOver({
        active: m,
        over: h
      }));
    },
    onDragEnd(f) {
      let {
        active: m,
        over: h
      } = f;
      i(t.onDragEnd({
        active: m,
        over: h
      }));
    },
    onDragCancel(f) {
      let {
        active: m,
        over: h
      } = f;
      i(t.onDragCancel({
        active: m,
        over: h
      }));
    }
  }), [i, t])), !l)
    return null;
  const d = W.createElement(W.Fragment, null, W.createElement($5, {
    id: r,
    value: a.draggable
  }), W.createElement(D5, {
    id: s,
    announcement: o
  }));
  return n ? Mb(d, n) : d;
}
var we;
(function(e) {
  e.DragStart = "dragStart", e.DragMove = "dragMove", e.DragEnd = "dragEnd", e.DragCancel = "dragCancel", e.DragOver = "dragOver", e.RegisterDroppable = "registerDroppable", e.SetDroppableDisabled = "setDroppableDisabled", e.UnregisterDroppable = "unregisterDroppable";
})(we || (we = {}));
function ri() {
}
function bt(e, t) {
  return F(
    () => ({
      sensor: e,
      options: t ?? {}
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [e, t]
  );
}
function Mi() {
  for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
    t[n] = arguments[n];
  return F(
    () => [...t].filter((r) => r != null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...t]
  );
}
const ot = /* @__PURE__ */ Object.freeze({
  x: 0,
  y: 0
});
function Gh(e, t) {
  return Math.sqrt(Math.pow(e.x - t.x, 2) + Math.pow(e.y - t.y, 2));
}
function N5(e, t) {
  const n = ni(e);
  if (!n)
    return "0 0";
  const r = {
    x: (n.x - t.left) / t.width * 100,
    y: (n.y - t.top) / t.height * 100
  };
  return r.x + "% " + r.y + "%";
}
function Yh(e, t) {
  let {
    data: {
      value: n
    }
  } = e, {
    data: {
      value: r
    }
  } = t;
  return n - r;
}
function A5(e, t) {
  let {
    data: {
      value: n
    }
  } = e, {
    data: {
      value: r
    }
  } = t;
  return r - n;
}
function ud(e) {
  let {
    left: t,
    top: n,
    height: r,
    width: a
  } = e;
  return [{
    x: t,
    y: n
  }, {
    x: t + a,
    y: n
  }, {
    x: t,
    y: n + r
  }, {
    x: t + a,
    y: n + r
  }];
}
function qh(e, t) {
  if (!e || e.length === 0)
    return null;
  const [n] = e;
  return n[t];
}
function cd(e, t, n) {
  return t === void 0 && (t = e.left), n === void 0 && (n = e.top), {
    x: t + e.width * 0.5,
    y: n + e.height * 0.5
  };
}
const Zh = (e) => {
  let {
    collisionRect: t,
    droppableRects: n,
    droppableContainers: r
  } = e;
  const a = cd(t, t.left, t.top), i = [];
  for (const o of r) {
    const {
      id: s
    } = o, l = n.get(s);
    if (l) {
      const c = Gh(cd(l), a);
      i.push({
        id: s,
        data: {
          droppableContainer: o,
          value: c
        }
      });
    }
  }
  return i.sort(Yh);
}, j5 = (e) => {
  let {
    collisionRect: t,
    droppableRects: n,
    droppableContainers: r
  } = e;
  const a = ud(t), i = [];
  for (const o of r) {
    const {
      id: s
    } = o, l = n.get(s);
    if (l) {
      const c = ud(l), d = a.reduce((m, h, p) => m + Gh(c[p], h), 0), f = Number((d / 4).toFixed(4));
      i.push({
        id: s,
        data: {
          droppableContainer: o,
          value: f
        }
      });
    }
  }
  return i.sort(Yh);
};
function M5(e, t) {
  const n = Math.max(t.top, e.top), r = Math.max(t.left, e.left), a = Math.min(t.left + t.width, e.left + e.width), i = Math.min(t.top + t.height, e.top + e.height), o = a - r, s = i - n;
  if (r < a && n < i) {
    const l = t.width * t.height, c = e.width * e.height, d = o * s, f = d / (l + c - d);
    return Number(f.toFixed(4));
  }
  return 0;
}
const R5 = (e) => {
  let {
    collisionRect: t,
    droppableRects: n,
    droppableContainers: r
  } = e;
  const a = [];
  for (const i of r) {
    const {
      id: o
    } = i, s = n.get(o);
    if (s) {
      const l = M5(s, t);
      l > 0 && a.push({
        id: o,
        data: {
          droppableContainer: i,
          value: l
        }
      });
    }
  }
  return a.sort(A5);
};
function I5(e, t, n) {
  return {
    ...e,
    scaleX: t && n ? t.width / n.width : 1,
    scaleY: t && n ? t.height / n.height : 1
  };
}
function Xh(e, t) {
  return e && t ? {
    x: e.left - t.left,
    y: e.top - t.top
  } : ot;
}
function V5(e) {
  return function(n) {
    for (var r = arguments.length, a = new Array(r > 1 ? r - 1 : 0), i = 1; i < r; i++)
      a[i - 1] = arguments[i];
    return a.reduce((o, s) => ({
      ...o,
      top: o.top + e * s.y,
      bottom: o.bottom + e * s.y,
      left: o.left + e * s.x,
      right: o.right + e * s.x
    }), {
      ...n
    });
  };
}
const B5 = /* @__PURE__ */ V5(1);
function Jh(e) {
  if (e.startsWith("matrix3d(")) {
    const t = e.slice(9, -1).split(/, /);
    return {
      x: +t[12],
      y: +t[13],
      scaleX: +t[0],
      scaleY: +t[5]
    };
  } else if (e.startsWith("matrix(")) {
    const t = e.slice(7, -1).split(/, /);
    return {
      x: +t[4],
      y: +t[5],
      scaleX: +t[0],
      scaleY: +t[3]
    };
  }
  return null;
}
function L5(e, t, n) {
  const r = Jh(t);
  if (!r)
    return e;
  const {
    scaleX: a,
    scaleY: i,
    x: o,
    y: s
  } = r, l = e.left - o - (1 - a) * parseFloat(n), c = e.top - s - (1 - i) * parseFloat(n.slice(n.indexOf(" ") + 1)), d = a ? e.width / a : e.width, f = i ? e.height / i : e.height;
  return {
    width: d,
    height: f,
    top: c,
    right: l + d,
    bottom: c + f,
    left: l
  };
}
const F5 = {
  ignoreTransform: !1
};
function Qn(e, t) {
  t === void 0 && (t = F5);
  let n = e.getBoundingClientRect();
  if (t.ignoreTransform) {
    const {
      transform: c,
      transformOrigin: d
    } = Fe(e).getComputedStyle(e);
    c && (n = L5(n, c, d));
  }
  const {
    top: r,
    left: a,
    width: i,
    height: o,
    bottom: s,
    right: l
  } = n;
  return {
    top: r,
    left: a,
    width: i,
    height: o,
    bottom: s,
    right: l
  };
}
function dd(e) {
  return Qn(e, {
    ignoreTransform: !0
  });
}
function O5(e) {
  const t = e.innerWidth, n = e.innerHeight;
  return {
    top: 0,
    left: 0,
    right: t,
    bottom: n,
    width: t,
    height: n
  };
}
function z5(e, t) {
  return t === void 0 && (t = Fe(e).getComputedStyle(e)), t.position === "fixed";
}
function _5(e, t) {
  t === void 0 && (t = Fe(e).getComputedStyle(e));
  const n = /(auto|scroll|overlay)/;
  return ["overflow", "overflowX", "overflowY"].some((a) => {
    const i = t[a];
    return typeof i == "string" ? n.test(i) : !1;
  });
}
function Ri(e, t) {
  const n = [];
  function r(a) {
    if (t != null && n.length >= t || !a)
      return n;
    if (Bl(a) && a.scrollingElement != null && !n.includes(a.scrollingElement))
      return n.push(a.scrollingElement), n;
    if (!Jr(a) || Hh(a) || n.includes(a))
      return n;
    const i = Fe(e).getComputedStyle(a);
    return a !== e && _5(a, i) && n.push(a), z5(a, i) ? n : r(a.parentNode);
  }
  return e ? r(e) : n;
}
function Qh(e) {
  const [t] = Ri(e, 1);
  return t ?? null;
}
function xo(e) {
  return !Ni || !e ? null : Xn(e) ? e : Vl(e) ? Bl(e) || e === Jn(e).scrollingElement ? window : Jr(e) ? e : null : null;
}
function ep(e) {
  return Xn(e) ? e.scrollX : e.scrollLeft;
}
function tp(e) {
  return Xn(e) ? e.scrollY : e.scrollTop;
}
function vs(e) {
  return {
    x: ep(e),
    y: tp(e)
  };
}
var De;
(function(e) {
  e[e.Forward = 1] = "Forward", e[e.Backward = -1] = "Backward";
})(De || (De = {}));
function np(e) {
  return !Ni || !e ? !1 : e === document.scrollingElement;
}
function rp(e) {
  const t = {
    x: 0,
    y: 0
  }, n = np(e) ? {
    height: window.innerHeight,
    width: window.innerWidth
  } : {
    height: e.clientHeight,
    width: e.clientWidth
  }, r = {
    x: e.scrollWidth - n.width,
    y: e.scrollHeight - n.height
  }, a = e.scrollTop <= t.y, i = e.scrollLeft <= t.x, o = e.scrollTop >= r.y, s = e.scrollLeft >= r.x;
  return {
    isTop: a,
    isLeft: i,
    isBottom: o,
    isRight: s,
    maxScroll: r,
    minScroll: t
  };
}
const U5 = {
  x: 0.2,
  y: 0.2
};
function H5(e, t, n, r, a) {
  let {
    top: i,
    left: o,
    right: s,
    bottom: l
  } = n;
  r === void 0 && (r = 10), a === void 0 && (a = U5);
  const {
    isTop: c,
    isBottom: d,
    isLeft: f,
    isRight: m
  } = rp(e), h = {
    x: 0,
    y: 0
  }, p = {
    x: 0,
    y: 0
  }, g = {
    height: t.height * a.y,
    width: t.width * a.x
  };
  return !c && i <= t.top + g.height ? (h.y = De.Backward, p.y = r * Math.abs((t.top + g.height - i) / g.height)) : !d && l >= t.bottom - g.height && (h.y = De.Forward, p.y = r * Math.abs((t.bottom - g.height - l) / g.height)), !m && s >= t.right - g.width ? (h.x = De.Forward, p.x = r * Math.abs((t.right - g.width - s) / g.width)) : !f && o <= t.left + g.width && (h.x = De.Backward, p.x = r * Math.abs((t.left + g.width - o) / g.width)), {
    direction: h,
    speed: p
  };
}
function K5(e) {
  if (e === document.scrollingElement) {
    const {
      innerWidth: i,
      innerHeight: o
    } = window;
    return {
      top: 0,
      left: 0,
      right: i,
      bottom: o,
      width: i,
      height: o
    };
  }
  const {
    top: t,
    left: n,
    right: r,
    bottom: a
  } = e.getBoundingClientRect();
  return {
    top: t,
    left: n,
    right: r,
    bottom: a,
    width: e.clientWidth,
    height: e.clientHeight
  };
}
function ap(e) {
  return e.reduce((t, n) => Mn(t, vs(n)), ot);
}
function W5(e) {
  return e.reduce((t, n) => t + ep(n), 0);
}
function G5(e) {
  return e.reduce((t, n) => t + tp(n), 0);
}
function ip(e, t) {
  if (t === void 0 && (t = Qn), !e)
    return;
  const {
    top: n,
    left: r,
    bottom: a,
    right: i
  } = t(e);
  Qh(e) && (a <= 0 || i <= 0 || n >= window.innerHeight || r >= window.innerWidth) && e.scrollIntoView({
    block: "center",
    inline: "center"
  });
}
const Y5 = [["x", ["left", "right"], W5], ["y", ["top", "bottom"], G5]];
class Ll {
  constructor(t, n) {
    this.rect = void 0, this.width = void 0, this.height = void 0, this.top = void 0, this.bottom = void 0, this.right = void 0, this.left = void 0;
    const r = Ri(n), a = ap(r);
    this.rect = {
      ...t
    }, this.width = t.width, this.height = t.height;
    for (const [i, o, s] of Y5)
      for (const l of o)
        Object.defineProperty(this, l, {
          get: () => {
            const c = s(r), d = a[i] - c;
            return this.rect[l] + d;
          },
          enumerable: !0
        });
    Object.defineProperty(this, "rect", {
      enumerable: !1
    });
  }
}
class $r {
  constructor(t) {
    this.target = void 0, this.listeners = [], this.removeAll = () => {
      this.listeners.forEach((n) => {
        var r;
        return (r = this.target) == null ? void 0 : r.removeEventListener(...n);
      });
    }, this.target = t;
  }
  add(t, n, r) {
    var a;
    (a = this.target) == null || a.addEventListener(t, n, r), this.listeners.push([t, n, r]);
  }
}
function q5(e) {
  const {
    EventTarget: t
  } = Fe(e);
  return e instanceof t ? e : Jn(e);
}
function wo(e, t) {
  const n = Math.abs(e.x), r = Math.abs(e.y);
  return typeof t == "number" ? Math.sqrt(n ** 2 + r ** 2) > t : "x" in t && "y" in t ? n > t.x && r > t.y : "x" in t ? n > t.x : "y" in t ? r > t.y : !1;
}
var qe;
(function(e) {
  e.Click = "click", e.DragStart = "dragstart", e.Keydown = "keydown", e.ContextMenu = "contextmenu", e.Resize = "resize", e.SelectionChange = "selectionchange", e.VisibilityChange = "visibilitychange";
})(qe || (qe = {}));
function fd(e) {
  e.preventDefault();
}
function Z5(e) {
  e.stopPropagation();
}
var ie;
(function(e) {
  e.Space = "Space", e.Down = "ArrowDown", e.Right = "ArrowRight", e.Left = "ArrowLeft", e.Up = "ArrowUp", e.Esc = "Escape", e.Enter = "Enter", e.Tab = "Tab";
})(ie || (ie = {}));
const op = {
  start: [ie.Space, ie.Enter],
  cancel: [ie.Esc],
  end: [ie.Space, ie.Enter, ie.Tab]
}, X5 = (e, t) => {
  let {
    currentCoordinates: n
  } = t;
  switch (e.code) {
    case ie.Right:
      return {
        ...n,
        x: n.x + 25
      };
    case ie.Left:
      return {
        ...n,
        x: n.x - 25
      };
    case ie.Down:
      return {
        ...n,
        y: n.y + 25
      };
    case ie.Up:
      return {
        ...n,
        y: n.y - 25
      };
  }
};
class er {
  constructor(t) {
    this.props = void 0, this.autoScrollEnabled = !1, this.referenceCoordinates = void 0, this.listeners = void 0, this.windowListeners = void 0, this.props = t;
    const {
      event: {
        target: n
      }
    } = t;
    this.props = t, this.listeners = new $r(Jn(n)), this.windowListeners = new $r(Fe(n)), this.handleKeyDown = this.handleKeyDown.bind(this), this.handleCancel = this.handleCancel.bind(this), this.attach();
  }
  attach() {
    this.handleStart(), this.windowListeners.add(qe.Resize, this.handleCancel), this.windowListeners.add(qe.VisibilityChange, this.handleCancel), setTimeout(() => this.listeners.add(qe.Keydown, this.handleKeyDown));
  }
  handleStart() {
    const {
      activeNode: t,
      onStart: n
    } = this.props, r = t.node.current;
    r && ip(r), n(ot);
  }
  handleKeyDown(t) {
    if (ji(t)) {
      const {
        active: n,
        context: r,
        options: a
      } = this.props, {
        keyboardCodes: i = op,
        coordinateGetter: o = X5,
        scrollBehavior: s = "smooth"
      } = a, {
        code: l
      } = t;
      if (i.end.includes(l)) {
        this.handleEnd(t);
        return;
      }
      if (i.cancel.includes(l)) {
        this.handleCancel(t);
        return;
      }
      const {
        collisionRect: c
      } = r.current, d = c ? {
        x: c.left,
        y: c.top
      } : ot;
      this.referenceCoordinates || (this.referenceCoordinates = d);
      const f = o(t, {
        active: n,
        context: r.current,
        currentCoordinates: d
      });
      if (f) {
        const m = Br(f, d), h = {
          x: 0,
          y: 0
        }, {
          scrollableAncestors: p
        } = r.current;
        for (const g of p) {
          const v = t.code, {
            isTop: b,
            isRight: x,
            isLeft: C,
            isBottom: w,
            maxScroll: E,
            minScroll: k
          } = rp(g), A = K5(g), P = {
            x: Math.min(v === ie.Right ? A.right - A.width / 2 : A.right, Math.max(v === ie.Right ? A.left : A.left + A.width / 2, f.x)),
            y: Math.min(v === ie.Down ? A.bottom - A.height / 2 : A.bottom, Math.max(v === ie.Down ? A.top : A.top + A.height / 2, f.y))
          }, j = v === ie.Right && !x || v === ie.Left && !C, T = v === ie.Down && !w || v === ie.Up && !b;
          if (j && P.x !== f.x) {
            const M = g.scrollLeft + m.x, L = v === ie.Right && M <= E.x || v === ie.Left && M >= k.x;
            if (L && !m.y) {
              g.scrollTo({
                left: M,
                behavior: s
              });
              return;
            }
            L ? h.x = g.scrollLeft - M : h.x = v === ie.Right ? g.scrollLeft - E.x : g.scrollLeft - k.x, h.x && g.scrollBy({
              left: -h.x,
              behavior: s
            });
            break;
          } else if (T && P.y !== f.y) {
            const M = g.scrollTop + m.y, L = v === ie.Down && M <= E.y || v === ie.Up && M >= k.y;
            if (L && !m.x) {
              g.scrollTo({
                top: M,
                behavior: s
              });
              return;
            }
            L ? h.y = g.scrollTop - M : h.y = v === ie.Down ? g.scrollTop - E.y : g.scrollTop - k.y, h.y && g.scrollBy({
              top: -h.y,
              behavior: s
            });
            break;
          }
        }
        this.handleMove(t, Mn(Br(f, this.referenceCoordinates), h));
      }
    }
  }
  handleMove(t, n) {
    const {
      onMove: r
    } = this.props;
    t.preventDefault(), r(n);
  }
  handleEnd(t) {
    const {
      onEnd: n
    } = this.props;
    t.preventDefault(), this.detach(), n();
  }
  handleCancel(t) {
    const {
      onCancel: n
    } = this.props;
    t.preventDefault(), this.detach(), n();
  }
  detach() {
    this.listeners.removeAll(), this.windowListeners.removeAll();
  }
}
er.activators = [{
  eventName: "onKeyDown",
  handler: (e, t, n) => {
    let {
      keyboardCodes: r = op,
      onActivation: a
    } = t, {
      active: i
    } = n;
    const {
      code: o
    } = e.nativeEvent;
    if (r.start.includes(o)) {
      const s = i.activatorNode.current;
      return s && e.target !== s ? !1 : (e.preventDefault(), a?.({
        event: e.nativeEvent
      }), !0);
    }
    return !1;
  }
}];
function md(e) {
  return !!(e && "distance" in e);
}
function hd(e) {
  return !!(e && "delay" in e);
}
class Fl {
  constructor(t, n, r) {
    var a;
    r === void 0 && (r = q5(t.event.target)), this.props = void 0, this.events = void 0, this.autoScrollEnabled = !0, this.document = void 0, this.activated = !1, this.initialCoordinates = void 0, this.timeoutId = null, this.listeners = void 0, this.documentListeners = void 0, this.windowListeners = void 0, this.props = t, this.events = n;
    const {
      event: i
    } = t, {
      target: o
    } = i;
    this.props = t, this.events = n, this.document = Jn(o), this.documentListeners = new $r(this.document), this.listeners = new $r(r), this.windowListeners = new $r(Fe(o)), this.initialCoordinates = (a = ni(i)) != null ? a : ot, this.handleStart = this.handleStart.bind(this), this.handleMove = this.handleMove.bind(this), this.handleEnd = this.handleEnd.bind(this), this.handleCancel = this.handleCancel.bind(this), this.handleKeydown = this.handleKeydown.bind(this), this.removeTextSelection = this.removeTextSelection.bind(this), this.attach();
  }
  attach() {
    const {
      events: t,
      props: {
        options: {
          activationConstraint: n,
          bypassActivationConstraint: r
        }
      }
    } = this;
    if (this.listeners.add(t.move.name, this.handleMove, {
      passive: !1
    }), this.listeners.add(t.end.name, this.handleEnd), t.cancel && this.listeners.add(t.cancel.name, this.handleCancel), this.windowListeners.add(qe.Resize, this.handleCancel), this.windowListeners.add(qe.DragStart, fd), this.windowListeners.add(qe.VisibilityChange, this.handleCancel), this.windowListeners.add(qe.ContextMenu, fd), this.documentListeners.add(qe.Keydown, this.handleKeydown), n) {
      if (r != null && r({
        event: this.props.event,
        activeNode: this.props.activeNode,
        options: this.props.options
      }))
        return this.handleStart();
      if (hd(n)) {
        this.timeoutId = setTimeout(this.handleStart, n.delay), this.handlePending(n);
        return;
      }
      if (md(n)) {
        this.handlePending(n);
        return;
      }
    }
    this.handleStart();
  }
  detach() {
    this.listeners.removeAll(), this.windowListeners.removeAll(), setTimeout(this.documentListeners.removeAll, 50), this.timeoutId !== null && (clearTimeout(this.timeoutId), this.timeoutId = null);
  }
  handlePending(t, n) {
    const {
      active: r,
      onPending: a
    } = this.props;
    a(r, t, this.initialCoordinates, n);
  }
  handleStart() {
    const {
      initialCoordinates: t
    } = this, {
      onStart: n
    } = this.props;
    t && (this.activated = !0, this.documentListeners.add(qe.Click, Z5, {
      capture: !0
    }), this.removeTextSelection(), this.documentListeners.add(qe.SelectionChange, this.removeTextSelection), n(t));
  }
  handleMove(t) {
    var n;
    const {
      activated: r,
      initialCoordinates: a,
      props: i
    } = this, {
      onMove: o,
      options: {
        activationConstraint: s
      }
    } = i;
    if (!a)
      return;
    const l = (n = ni(t)) != null ? n : ot, c = Br(a, l);
    if (!r && s) {
      if (md(s)) {
        if (s.tolerance != null && wo(c, s.tolerance))
          return this.handleCancel();
        if (wo(c, s.distance))
          return this.handleStart();
      }
      if (hd(s) && wo(c, s.tolerance))
        return this.handleCancel();
      this.handlePending(s, c);
      return;
    }
    t.cancelable && t.preventDefault(), o(l);
  }
  handleEnd() {
    const {
      onAbort: t,
      onEnd: n
    } = this.props;
    this.detach(), this.activated || t(this.props.active), n();
  }
  handleCancel() {
    const {
      onAbort: t,
      onCancel: n
    } = this.props;
    this.detach(), this.activated || t(this.props.active), n();
  }
  handleKeydown(t) {
    t.code === ie.Esc && this.handleCancel();
  }
  removeTextSelection() {
    var t;
    (t = this.document.getSelection()) == null || t.removeAllRanges();
  }
}
const J5 = {
  cancel: {
    name: "pointercancel"
  },
  move: {
    name: "pointermove"
  },
  end: {
    name: "pointerup"
  }
};
class Ii extends Fl {
  constructor(t) {
    const {
      event: n
    } = t, r = Jn(n.target);
    super(t, J5, r);
  }
}
Ii.activators = [{
  eventName: "onPointerDown",
  handler: (e, t) => {
    let {
      nativeEvent: n
    } = e, {
      onActivation: r
    } = t;
    return !n.isPrimary || n.button !== 0 ? !1 : (r?.({
      event: n
    }), !0);
  }
}];
const Q5 = {
  move: {
    name: "mousemove"
  },
  end: {
    name: "mouseup"
  }
};
var bs;
(function(e) {
  e[e.RightClick = 2] = "RightClick";
})(bs || (bs = {}));
class Ol extends Fl {
  constructor(t) {
    super(t, Q5, Jn(t.event.target));
  }
}
Ol.activators = [{
  eventName: "onMouseDown",
  handler: (e, t) => {
    let {
      nativeEvent: n
    } = e, {
      onActivation: r
    } = t;
    return n.button === bs.RightClick ? !1 : (r?.({
      event: n
    }), !0);
  }
}];
const $o = {
  cancel: {
    name: "touchcancel"
  },
  move: {
    name: "touchmove"
  },
  end: {
    name: "touchend"
  }
};
class zl extends Fl {
  constructor(t) {
    super(t, $o);
  }
  static setup() {
    return window.addEventListener($o.move.name, t, {
      capture: !1,
      passive: !1
    }), function() {
      window.removeEventListener($o.move.name, t);
    };
    function t() {
    }
  }
}
zl.activators = [{
  eventName: "onTouchStart",
  handler: (e, t) => {
    let {
      nativeEvent: n
    } = e, {
      onActivation: r
    } = t;
    const {
      touches: a
    } = n;
    return a.length > 1 ? !1 : (r?.({
      event: n
    }), !0);
  }
}];
var Dr;
(function(e) {
  e[e.Pointer = 0] = "Pointer", e[e.DraggableRect = 1] = "DraggableRect";
})(Dr || (Dr = {}));
var ai;
(function(e) {
  e[e.TreeOrder = 0] = "TreeOrder", e[e.ReversedTreeOrder = 1] = "ReversedTreeOrder";
})(ai || (ai = {}));
function e$(e) {
  let {
    acceleration: t,
    activator: n = Dr.Pointer,
    canScroll: r,
    draggingRect: a,
    enabled: i,
    interval: o = 5,
    order: s = ai.TreeOrder,
    pointerCoordinates: l,
    scrollableAncestors: c,
    scrollableAncestorRects: d,
    delta: f,
    threshold: m
  } = e;
  const h = n$({
    delta: f,
    disabled: !i
  }), [p, g] = v5(), v = B({
    x: 0,
    y: 0
  }), b = B({
    x: 0,
    y: 0
  }), x = F(() => {
    switch (n) {
      case Dr.Pointer:
        return l ? {
          top: l.y,
          bottom: l.y,
          left: l.x,
          right: l.x
        } : null;
      case Dr.DraggableRect:
        return a;
    }
  }, [n, a, l]), C = B(null), w = G(() => {
    const k = C.current;
    if (!k)
      return;
    const A = v.current.x * b.current.x, P = v.current.y * b.current.y;
    k.scrollBy(A, P);
  }, []), E = F(() => s === ai.TreeOrder ? [...c].reverse() : c, [s, c]);
  U(
    () => {
      if (!i || !c.length || !x) {
        g();
        return;
      }
      for (const k of E) {
        if (r?.(k) === !1)
          continue;
        const A = c.indexOf(k), P = d[A];
        if (!P)
          continue;
        const {
          direction: j,
          speed: T
        } = H5(k, P, x, t, m);
        for (const M of ["x", "y"])
          h[M][j[M]] || (T[M] = 0, j[M] = 0);
        if (T.x > 0 || T.y > 0) {
          g(), C.current = k, p(w, o), v.current = T, b.current = j;
          return;
        }
      }
      v.current = {
        x: 0,
        y: 0
      }, b.current = {
        x: 0,
        y: 0
      }, g();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      t,
      w,
      r,
      g,
      i,
      o,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(x),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(h),
      p,
      c,
      E,
      d,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(m)
    ]
  );
}
const t$ = {
  x: {
    [De.Backward]: !1,
    [De.Forward]: !1
  },
  y: {
    [De.Backward]: !1,
    [De.Forward]: !1
  }
};
function n$(e) {
  let {
    delta: t,
    disabled: n
  } = e;
  const r = ti(t);
  return Qr((a) => {
    if (n || !r || !a)
      return t$;
    const i = {
      x: Math.sign(t.x - r.x),
      y: Math.sign(t.y - r.y)
    };
    return {
      x: {
        [De.Backward]: a.x[De.Backward] || i.x === -1,
        [De.Forward]: a.x[De.Forward] || i.x === 1
      },
      y: {
        [De.Backward]: a.y[De.Backward] || i.y === -1,
        [De.Forward]: a.y[De.Forward] || i.y === 1
      }
    };
  }, [n, t, r]);
}
function r$(e, t) {
  const n = t != null ? e.get(t) : void 0, r = n ? n.node.current : null;
  return Qr((a) => {
    var i;
    return t == null ? null : (i = r ?? a) != null ? i : null;
  }, [r, t]);
}
function a$(e, t) {
  return F(() => e.reduce((n, r) => {
    const {
      sensor: a
    } = r, i = a.activators.map((o) => ({
      eventName: o.eventName,
      handler: t(o.handler, r)
    }));
    return [...n, ...i];
  }, []), [e, t]);
}
var Lr;
(function(e) {
  e[e.Always = 0] = "Always", e[e.BeforeDragging = 1] = "BeforeDragging", e[e.WhileDragging = 2] = "WhileDragging";
})(Lr || (Lr = {}));
var ys;
(function(e) {
  e.Optimized = "optimized";
})(ys || (ys = {}));
const pd = /* @__PURE__ */ new Map();
function i$(e, t) {
  let {
    dragging: n,
    dependencies: r,
    config: a
  } = t;
  const [i, o] = _(null), {
    frequency: s,
    measure: l,
    strategy: c
  } = a, d = B(e), f = v(), m = Vr(f), h = G(function(b) {
    b === void 0 && (b = []), !m.current && o((x) => x === null ? b : x.concat(b.filter((C) => !x.includes(C))));
  }, [m]), p = B(null), g = Qr((b) => {
    if (f && !n)
      return pd;
    if (!b || b === pd || d.current !== e || i != null) {
      const x = /* @__PURE__ */ new Map();
      for (let C of e) {
        if (!C)
          continue;
        if (i && i.length > 0 && !i.includes(C.id) && C.rect.current) {
          x.set(C.id, C.rect.current);
          continue;
        }
        const w = C.node.current, E = w ? new Ll(l(w), w) : null;
        C.rect.current = E, E && x.set(C.id, E);
      }
      return x;
    }
    return b;
  }, [e, i, n, f, l]);
  return U(() => {
    d.current = e;
  }, [e]), U(
    () => {
      f || h();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [n, f]
  ), U(
    () => {
      i && i.length > 0 && o(null);
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(i)]
  ), U(
    () => {
      f || typeof s != "number" || p.current !== null || (p.current = setTimeout(() => {
        h(), p.current = null;
      }, s));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s, f, h, ...r]
  ), {
    droppableRects: g,
    measureDroppableContainers: h,
    measuringScheduled: i != null
  };
  function v() {
    switch (c) {
      case Lr.Always:
        return !1;
      case Lr.BeforeDragging:
        return n;
      default:
        return !n;
    }
  }
}
function _l(e, t) {
  return Qr((n) => e ? n || (typeof t == "function" ? t(e) : e) : null, [t, e]);
}
function o$(e, t) {
  return _l(e, t);
}
function s$(e) {
  let {
    callback: t,
    disabled: n
  } = e;
  const r = Ai(t), a = F(() => {
    if (n || typeof window > "u" || typeof window.MutationObserver > "u")
      return;
    const {
      MutationObserver: i
    } = window;
    return new i(r);
  }, [r, n]);
  return U(() => () => a?.disconnect(), [a]), a;
}
function Vi(e) {
  let {
    callback: t,
    disabled: n
  } = e;
  const r = Ai(t), a = F(
    () => {
      if (n || typeof window > "u" || typeof window.ResizeObserver > "u")
        return;
      const {
        ResizeObserver: i
      } = window;
      return new i(r);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [n]
  );
  return U(() => () => a?.disconnect(), [a]), a;
}
function l$(e) {
  return new Ll(Qn(e), e);
}
function gd(e, t, n) {
  t === void 0 && (t = l$);
  const [r, a] = _(null);
  function i() {
    a((l) => {
      if (!e)
        return null;
      if (e.isConnected === !1) {
        var c;
        return (c = l ?? n) != null ? c : null;
      }
      const d = t(e);
      return JSON.stringify(l) === JSON.stringify(d) ? l : d;
    });
  }
  const o = s$({
    callback(l) {
      if (e)
        for (const c of l) {
          const {
            type: d,
            target: f
          } = c;
          if (d === "childList" && f instanceof HTMLElement && f.contains(e)) {
            i();
            break;
          }
        }
    }
  }), s = Vi({
    callback: i
  });
  return it(() => {
    i(), e ? (s?.observe(e), o?.observe(document.body, {
      childList: !0,
      subtree: !0
    })) : (s?.disconnect(), o?.disconnect());
  }, [e]), r;
}
function u$(e) {
  const t = _l(e);
  return Xh(e, t);
}
const vd = [];
function c$(e) {
  const t = B(e), n = Qr((r) => e ? r && r !== vd && e && t.current && e.parentNode === t.current.parentNode ? r : Ri(e) : vd, [e]);
  return U(() => {
    t.current = e;
  }, [e]), n;
}
function d$(e) {
  const [t, n] = _(null), r = B(e), a = G((i) => {
    const o = xo(i.target);
    o && n((s) => s ? (s.set(o, vs(o)), new Map(s)) : null);
  }, []);
  return U(() => {
    const i = r.current;
    if (e !== i) {
      o(i);
      const s = e.map((l) => {
        const c = xo(l);
        return c ? (c.addEventListener("scroll", a, {
          passive: !0
        }), [c, vs(c)]) : null;
      }).filter((l) => l != null);
      n(s.length ? new Map(s) : null), r.current = e;
    }
    return () => {
      o(e), o(i);
    };
    function o(s) {
      s.forEach((l) => {
        const c = xo(l);
        c?.removeEventListener("scroll", a);
      });
    }
  }, [a, e]), F(() => e.length ? t ? Array.from(t.values()).reduce((i, o) => Mn(i, o), ot) : ap(e) : ot, [e, t]);
}
function bd(e, t) {
  t === void 0 && (t = []);
  const n = B(null);
  return U(
    () => {
      n.current = null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    t
  ), U(() => {
    const r = e !== ot;
    r && !n.current && (n.current = e), !r && n.current && (n.current = null);
  }, [e]), n.current ? Br(e, n.current) : ot;
}
function f$(e) {
  U(
    () => {
      if (!Ni)
        return;
      const t = e.map((n) => {
        let {
          sensor: r
        } = n;
        return r.setup == null ? void 0 : r.setup();
      });
      return () => {
        for (const n of t)
          n?.();
      };
    },
    // TO-DO: Sensors length could theoretically change which would not be a valid dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    e.map((t) => {
      let {
        sensor: n
      } = t;
      return n;
    })
  );
}
function m$(e, t) {
  return F(() => e.reduce((n, r) => {
    let {
      eventName: a,
      handler: i
    } = r;
    return n[a] = (o) => {
      i(o, t);
    }, n;
  }, {}), [e, t]);
}
function sp(e) {
  return F(() => e ? O5(e) : null, [e]);
}
const yd = [];
function h$(e, t) {
  t === void 0 && (t = Qn);
  const [n] = e, r = sp(n ? Fe(n) : null), [a, i] = _(yd);
  function o() {
    i(() => e.length ? e.map((l) => np(l) ? r : new Ll(t(l), l)) : yd);
  }
  const s = Vi({
    callback: o
  });
  return it(() => {
    s?.disconnect(), o(), e.forEach((l) => s?.observe(l));
  }, [e]), a;
}
function lp(e) {
  if (!e)
    return null;
  if (e.children.length > 1)
    return e;
  const t = e.children[0];
  return Jr(t) ? t : e;
}
function p$(e) {
  let {
    measure: t
  } = e;
  const [n, r] = _(null), a = G((c) => {
    for (const {
      target: d
    } of c)
      if (Jr(d)) {
        r((f) => {
          const m = t(d);
          return f ? {
            ...f,
            width: m.width,
            height: m.height
          } : m;
        });
        break;
      }
  }, [t]), i = Vi({
    callback: a
  }), o = G((c) => {
    const d = lp(c);
    i?.disconnect(), d && i?.observe(d), r(d ? t(d) : null);
  }, [t, i]), [s, l] = ei(o);
  return F(() => ({
    nodeRef: s,
    rect: n,
    setRef: l
  }), [n, s, l]);
}
const g$ = [{
  sensor: Ii,
  options: {}
}, {
  sensor: er,
  options: {}
}], v$ = {
  current: {}
}, za = {
  draggable: {
    measure: dd
  },
  droppable: {
    measure: dd,
    strategy: Lr.WhileDragging,
    frequency: ys.Optimized
  },
  dragOverlay: {
    measure: Qn
  }
};
class Cr extends Map {
  get(t) {
    var n;
    return t != null && (n = super.get(t)) != null ? n : void 0;
  }
  toArray() {
    return Array.from(this.values());
  }
  getEnabled() {
    return this.toArray().filter((t) => {
      let {
        disabled: n
      } = t;
      return !n;
    });
  }
  getNodeFor(t) {
    var n, r;
    return (n = (r = this.get(t)) == null ? void 0 : r.node.current) != null ? n : void 0;
  }
}
const b$ = {
  activatorEvent: null,
  active: null,
  activeNode: null,
  activeNodeRect: null,
  collisions: null,
  containerNodeRect: null,
  draggableNodes: /* @__PURE__ */ new Map(),
  droppableRects: /* @__PURE__ */ new Map(),
  droppableContainers: /* @__PURE__ */ new Cr(),
  over: null,
  dragOverlay: {
    nodeRef: {
      current: null
    },
    rect: null,
    setRef: ri
  },
  scrollableAncestors: [],
  scrollableAncestorRects: [],
  measuringConfiguration: za,
  measureDroppableContainers: ri,
  windowRect: null,
  measuringScheduled: !1
}, up = {
  activatorEvent: null,
  activators: [],
  active: null,
  activeNodeRect: null,
  ariaDescribedById: {
    draggable: ""
  },
  dispatch: ri,
  draggableNodes: /* @__PURE__ */ new Map(),
  over: null,
  measureDroppableContainers: ri
}, ta = /* @__PURE__ */ fe(up), cp = /* @__PURE__ */ fe(b$);
function y$() {
  return {
    draggable: {
      active: null,
      initialCoordinates: {
        x: 0,
        y: 0
      },
      nodes: /* @__PURE__ */ new Map(),
      translate: {
        x: 0,
        y: 0
      }
    },
    droppable: {
      containers: new Cr()
    }
  };
}
function x$(e, t) {
  switch (t.type) {
    case we.DragStart:
      return {
        ...e,
        draggable: {
          ...e.draggable,
          initialCoordinates: t.initialCoordinates,
          active: t.active
        }
      };
    case we.DragMove:
      return e.draggable.active == null ? e : {
        ...e,
        draggable: {
          ...e.draggable,
          translate: {
            x: t.coordinates.x - e.draggable.initialCoordinates.x,
            y: t.coordinates.y - e.draggable.initialCoordinates.y
          }
        }
      };
    case we.DragEnd:
    case we.DragCancel:
      return {
        ...e,
        draggable: {
          ...e.draggable,
          active: null,
          initialCoordinates: {
            x: 0,
            y: 0
          },
          translate: {
            x: 0,
            y: 0
          }
        }
      };
    case we.RegisterDroppable: {
      const {
        element: n
      } = t, {
        id: r
      } = n, a = new Cr(e.droppable.containers);
      return a.set(r, n), {
        ...e,
        droppable: {
          ...e.droppable,
          containers: a
        }
      };
    }
    case we.SetDroppableDisabled: {
      const {
        id: n,
        key: r,
        disabled: a
      } = t, i = e.droppable.containers.get(n);
      if (!i || r !== i.key)
        return e;
      const o = new Cr(e.droppable.containers);
      return o.set(n, {
        ...i,
        disabled: a
      }), {
        ...e,
        droppable: {
          ...e.droppable,
          containers: o
        }
      };
    }
    case we.UnregisterDroppable: {
      const {
        id: n,
        key: r
      } = t, a = e.droppable.containers.get(n);
      if (!a || r !== a.key)
        return e;
      const i = new Cr(e.droppable.containers);
      return i.delete(n), {
        ...e,
        droppable: {
          ...e.droppable,
          containers: i
        }
      };
    }
    default:
      return e;
  }
}
function w$(e) {
  let {
    disabled: t
  } = e;
  const {
    active: n,
    activatorEvent: r,
    draggableNodes: a
  } = ee(ta), i = ti(r), o = ti(n?.id);
  return U(() => {
    if (!t && !r && i && o != null) {
      if (!ji(i) || document.activeElement === i.target)
        return;
      const s = a.get(o);
      if (!s)
        return;
      const {
        activatorNode: l,
        node: c
      } = s;
      if (!l.current && !c.current)
        return;
      requestAnimationFrame(() => {
        for (const d of [l.current, c.current]) {
          if (!d)
            continue;
          const f = x5(d);
          if (f) {
            f.focus();
            break;
          }
        }
      });
    }
  }, [r, t, a, o, i]), null;
}
function dp(e, t) {
  let {
    transform: n,
    ...r
  } = t;
  return e != null && e.length ? e.reduce((a, i) => i({
    transform: a,
    ...r
  }), n) : n;
}
function $$(e) {
  return F(
    () => ({
      draggable: {
        ...za.draggable,
        ...e?.draggable
      },
      droppable: {
        ...za.droppable,
        ...e?.droppable
      },
      dragOverlay: {
        ...za.dragOverlay,
        ...e?.dragOverlay
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [e?.draggable, e?.droppable, e?.dragOverlay]
  );
}
function D$(e) {
  let {
    activeNode: t,
    measure: n,
    initialRect: r,
    config: a = !0
  } = e;
  const i = B(!1), {
    x: o,
    y: s
  } = typeof a == "boolean" ? {
    x: a,
    y: a
  } : a;
  it(() => {
    if (!o && !s || !t) {
      i.current = !1;
      return;
    }
    if (i.current || !r)
      return;
    const c = t?.node.current;
    if (!c || c.isConnected === !1)
      return;
    const d = n(c), f = Xh(d, r);
    if (o || (f.x = 0), s || (f.y = 0), i.current = !0, Math.abs(f.x) > 0 || Math.abs(f.y) > 0) {
      const m = Qh(c);
      m && m.scrollBy({
        top: f.y,
        left: f.x
      });
    }
  }, [t, o, s, r, n]);
}
const Bi = /* @__PURE__ */ fe({
  ...ot,
  scaleX: 1,
  scaleY: 1
});
var Lt;
(function(e) {
  e[e.Uninitialized = 0] = "Uninitialized", e[e.Initializing = 1] = "Initializing", e[e.Initialized = 2] = "Initialized";
})(Lt || (Lt = {}));
const Li = /* @__PURE__ */ ub(function(t) {
  var n, r, a, i;
  let {
    id: o,
    accessibility: s,
    autoScroll: l = !0,
    children: c,
    sensors: d = g$,
    collisionDetection: f = R5,
    measuring: m,
    modifiers: h,
    ...p
  } = t;
  const g = Df(x$, void 0, y$), [v, b] = g, [x, C] = S5(), [w, E] = _(Lt.Uninitialized), k = w === Lt.Initialized, {
    draggable: {
      active: A,
      nodes: P,
      translate: j
    },
    droppable: {
      containers: T
    }
  } = v, M = A != null ? P.get(A) : null, L = B({
    initial: null,
    translated: null
  }), O = F(() => {
    var ke;
    return A != null ? {
      id: A,
      // It's possible for the active node to unmount while dragging
      data: (ke = M?.data) != null ? ke : v$,
      rect: L
    } : null;
  }, [A, M]), Z = B(null), [Q, J] = _(null), [Y, K] = _(null), te = Vr(p, Object.values(p)), S = ea("DndDescribedBy", o), $ = F(() => T.getEnabled(), [T]), D = $$(m), {
    droppableRects: N,
    measureDroppableContainers: I,
    measuringScheduled: H
  } = i$($, {
    dragging: k,
    dependencies: [j.x, j.y],
    config: D.droppable
  }), ne = r$(P, A), X = F(() => Y ? ni(Y) : null, [Y]), oe = nb(), le = o$(ne, D.draggable.measure);
  D$({
    activeNode: A != null ? P.get(A) : null,
    config: oe.layoutShiftCompensation,
    initialRect: le,
    measure: D.draggable.measure
  });
  const V = gd(ne, D.draggable.measure, le), se = gd(ne ? ne.parentElement : null), xe = B({
    activatorEvent: null,
    active: null,
    activeNode: ne,
    collisionRect: null,
    collisions: null,
    droppableRects: N,
    draggableNodes: P,
    draggingNode: null,
    draggingNodeRect: null,
    droppableContainers: T,
    over: null,
    scrollableAncestors: [],
    scrollAdjustedTranslate: null
  }), ct = T.getNodeFor((n = xe.current.over) == null ? void 0 : n.id), xt = p$({
    measure: D.dragOverlay.measure
  }), hn = (r = xt.nodeRef.current) != null ? r : ne, pn = k ? (a = xt.rect) != null ? a : V : null, vu = !!(xt.nodeRef.current && xt.rect), bu = u$(vu ? null : V), Xi = sp(hn ? Fe(hn) : null), At = c$(k ? ct ?? ne : null), da = h$(At), fa = dp(h, {
    transform: {
      x: j.x - bu.x,
      y: j.y - bu.y,
      scaleX: 1,
      scaleY: 1
    },
    activatorEvent: Y,
    active: O,
    activeNodeRect: V,
    containerNodeRect: se,
    draggingNodeRect: pn,
    over: xe.current.over,
    overlayNodeRect: xt.rect,
    scrollableAncestors: At,
    scrollableAncestorRects: da,
    windowRect: Xi
  }), yu = X ? Mn(X, j) : null, xu = d$(At), q0 = bd(xu), Z0 = bd(xu, [V]), gn = Mn(fa, q0), vn = pn ? B5(pn, fa) : null, rr = O && vn ? f({
    active: O,
    collisionRect: vn,
    droppableRects: N,
    droppableContainers: $,
    pointerCoordinates: yu
  }) : null, wu = qh(rr, "id"), [jt, $u] = _(null), X0 = vu ? fa : Mn(fa, Z0), J0 = I5(X0, (i = jt?.rect) != null ? i : null, V), Ji = B(null), Du = G(
    (ke, ze) => {
      let {
        sensor: _e,
        options: Mt
      } = ze;
      if (Z.current == null)
        return;
      const We = P.get(Z.current);
      if (!We)
        return;
      const Ue = ke.nativeEvent, dt = new _e({
        active: Z.current,
        activeNode: We,
        event: Ue,
        options: Mt,
        // Sensors need to be instantiated with refs for arguments that change over time
        // otherwise they are frozen in time with the stale arguments
        context: xe,
        onAbort(Ee) {
          if (!P.get(Ee))
            return;
          const {
            onDragAbort: ft
          } = te.current, wt = {
            id: Ee
          };
          ft?.(wt), x({
            type: "onDragAbort",
            event: wt
          });
        },
        onPending(Ee, Rt, ft, wt) {
          if (!P.get(Ee))
            return;
          const {
            onDragPending: ir
          } = te.current, It = {
            id: Ee,
            constraint: Rt,
            initialCoordinates: ft,
            offset: wt
          };
          ir?.(It), x({
            type: "onDragPending",
            event: It
          });
        },
        onStart(Ee) {
          const Rt = Z.current;
          if (Rt == null)
            return;
          const ft = P.get(Rt);
          if (!ft)
            return;
          const {
            onDragStart: wt
          } = te.current, ar = {
            activatorEvent: Ue,
            active: {
              id: Rt,
              data: ft.data,
              rect: L
            }
          };
          ma(() => {
            wt?.(ar), E(Lt.Initializing), b({
              type: we.DragStart,
              initialCoordinates: Ee,
              active: Rt
            }), x({
              type: "onDragStart",
              event: ar
            }), J(Ji.current), K(Ue);
          });
        },
        onMove(Ee) {
          b({
            type: we.DragMove,
            coordinates: Ee
          });
        },
        onEnd: bn(we.DragEnd),
        onCancel: bn(we.DragCancel)
      });
      Ji.current = dt;
      function bn(Ee) {
        return async function() {
          const {
            active: ft,
            collisions: wt,
            over: ar,
            scrollAdjustedTranslate: ir
          } = xe.current;
          let It = null;
          if (ft && ir) {
            const {
              cancelDrop: or
            } = te.current;
            It = {
              activatorEvent: Ue,
              active: ft,
              collisions: wt,
              delta: ir,
              over: ar
            }, Ee === we.DragEnd && typeof or == "function" && await Promise.resolve(or(It)) && (Ee = we.DragCancel);
          }
          Z.current = null, ma(() => {
            b({
              type: Ee
            }), E(Lt.Uninitialized), $u(null), J(null), K(null), Ji.current = null;
            const or = Ee === we.DragEnd ? "onDragEnd" : "onDragCancel";
            if (It) {
              const Qi = te.current[or];
              Qi?.(It), x({
                type: or,
                event: It
              });
            }
          });
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [P]
  ), Q0 = G((ke, ze) => (_e, Mt) => {
    const We = _e.nativeEvent, Ue = P.get(Mt);
    if (
      // Another sensor is already instantiating
      Z.current !== null || // No active draggable
      !Ue || // Event has already been captured
      We.dndKit || We.defaultPrevented
    )
      return;
    const dt = {
      active: Ue
    };
    ke(_e, ze.options, dt) === !0 && (We.dndKit = {
      capturedBy: ze.sensor
    }, Z.current = Mt, Du(_e, ze));
  }, [P, Du]), Cu = a$(d, Q0);
  f$(d), it(() => {
    V && w === Lt.Initializing && E(Lt.Initialized);
  }, [V, w]), U(
    () => {
      const {
        onDragMove: ke
      } = te.current, {
        active: ze,
        activatorEvent: _e,
        collisions: Mt,
        over: We
      } = xe.current;
      if (!ze || !_e)
        return;
      const Ue = {
        active: ze,
        activatorEvent: _e,
        collisions: Mt,
        delta: {
          x: gn.x,
          y: gn.y
        },
        over: We
      };
      ma(() => {
        ke?.(Ue), x({
          type: "onDragMove",
          event: Ue
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gn.x, gn.y]
  ), U(
    () => {
      const {
        active: ke,
        activatorEvent: ze,
        collisions: _e,
        droppableContainers: Mt,
        scrollAdjustedTranslate: We
      } = xe.current;
      if (!ke || Z.current == null || !ze || !We)
        return;
      const {
        onDragOver: Ue
      } = te.current, dt = Mt.get(wu), bn = dt && dt.rect.current ? {
        id: dt.id,
        rect: dt.rect.current,
        data: dt.data,
        disabled: dt.disabled
      } : null, Ee = {
        active: ke,
        activatorEvent: ze,
        collisions: _e,
        delta: {
          x: We.x,
          y: We.y
        },
        over: bn
      };
      ma(() => {
        $u(bn), Ue?.(Ee), x({
          type: "onDragOver",
          event: Ee
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wu]
  ), it(() => {
    xe.current = {
      activatorEvent: Y,
      active: O,
      activeNode: ne,
      collisionRect: vn,
      collisions: rr,
      droppableRects: N,
      draggableNodes: P,
      draggingNode: hn,
      draggingNodeRect: pn,
      droppableContainers: T,
      over: jt,
      scrollableAncestors: At,
      scrollAdjustedTranslate: gn
    }, L.current = {
      initial: pn,
      translated: vn
    };
  }, [O, ne, rr, vn, P, hn, pn, N, T, jt, At, gn]), e$({
    ...oe,
    delta: j,
    draggingRect: vn,
    pointerCoordinates: yu,
    scrollableAncestors: At,
    scrollableAncestorRects: da
  });
  const eb = F(() => ({
    active: O,
    activeNode: ne,
    activeNodeRect: V,
    activatorEvent: Y,
    collisions: rr,
    containerNodeRect: se,
    dragOverlay: xt,
    draggableNodes: P,
    droppableContainers: T,
    droppableRects: N,
    over: jt,
    measureDroppableContainers: I,
    scrollableAncestors: At,
    scrollableAncestorRects: da,
    measuringConfiguration: D,
    measuringScheduled: H,
    windowRect: Xi
  }), [O, ne, V, Y, rr, se, xt, P, T, N, jt, I, At, da, D, H, Xi]), tb = F(() => ({
    activatorEvent: Y,
    activators: Cu,
    active: O,
    activeNodeRect: V,
    ariaDescribedById: {
      draggable: S
    },
    dispatch: b,
    draggableNodes: P,
    over: jt,
    measureDroppableContainers: I
  }), [Y, Cu, O, V, b, S, P, jt, I]);
  return W.createElement(Wh.Provider, {
    value: C
  }, W.createElement(ta.Provider, {
    value: tb
  }, W.createElement(cp.Provider, {
    value: eb
  }, W.createElement(Bi.Provider, {
    value: J0
  }, c)), W.createElement(w$, {
    disabled: s?.restoreFocus === !1
  })), W.createElement(k5, {
    ...s,
    hiddenTextDescribedById: S
  }));
  function nb() {
    const ke = Q?.autoScrollEnabled === !1, ze = typeof l == "object" ? l.enabled === !1 : l === !1, _e = k && !ke && !ze;
    return typeof l == "object" ? {
      ...l,
      enabled: _e
    } : {
      enabled: _e
    };
  }
}), C$ = /* @__PURE__ */ fe(null), xd = "button", E$ = "Draggable";
function S$(e) {
  let {
    id: t,
    data: n,
    disabled: r = !1,
    attributes: a
  } = e;
  const i = ea(E$), {
    activators: o,
    activatorEvent: s,
    active: l,
    activeNodeRect: c,
    ariaDescribedById: d,
    draggableNodes: f,
    over: m
  } = ee(ta), {
    role: h = xd,
    roleDescription: p = "draggable",
    tabIndex: g = 0
  } = a ?? {}, v = l?.id === t, b = ee(v ? Bi : C$), [x, C] = ei(), [w, E] = ei(), k = m$(o, t), A = Vr(n);
  it(
    () => (f.set(t, {
      id: t,
      key: i,
      node: x,
      activatorNode: w,
      data: A
    }), () => {
      const j = f.get(t);
      j && j.key === i && f.delete(t);
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [f, t]
  );
  const P = F(() => ({
    role: h,
    tabIndex: g,
    "aria-disabled": r,
    "aria-pressed": v && h === xd ? !0 : void 0,
    "aria-roledescription": p,
    "aria-describedby": d.draggable
  }), [r, h, g, v, p, d.draggable]);
  return {
    active: l,
    activatorEvent: s,
    activeNodeRect: c,
    attributes: P,
    isDragging: v,
    listeners: r ? void 0 : k,
    node: x,
    over: m,
    setNodeRef: C,
    setActivatorNodeRef: E,
    transform: b
  };
}
function fp() {
  return ee(cp);
}
const T$ = "Droppable", P$ = {
  timeout: 25
};
function k$(e) {
  let {
    data: t,
    disabled: n = !1,
    id: r,
    resizeObserverConfig: a
  } = e;
  const i = ea(T$), {
    active: o,
    dispatch: s,
    over: l,
    measureDroppableContainers: c
  } = ee(ta), d = B({
    disabled: n
  }), f = B(!1), m = B(null), h = B(null), {
    disabled: p,
    updateMeasurementsFor: g,
    timeout: v
  } = {
    ...P$,
    ...a
  }, b = Vr(g ?? r), x = G(
    () => {
      if (!f.current) {
        f.current = !0;
        return;
      }
      h.current != null && clearTimeout(h.current), h.current = setTimeout(() => {
        c(Array.isArray(b.current) ? b.current : [b.current]), h.current = null;
      }, v);
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [v]
  ), C = Vi({
    callback: x,
    disabled: p || !o
  }), w = G((P, j) => {
    C && (j && (C.unobserve(j), f.current = !1), P && C.observe(P));
  }, [C]), [E, k] = ei(w), A = Vr(t);
  return U(() => {
    !C || !E.current || (C.disconnect(), f.current = !1, C.observe(E.current));
  }, [E, C]), U(
    () => (s({
      type: we.RegisterDroppable,
      element: {
        id: r,
        key: i,
        disabled: n,
        node: E,
        rect: m,
        data: A
      }
    }), () => s({
      type: we.UnregisterDroppable,
      key: i,
      id: r
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [r]
  ), U(() => {
    n !== d.current.disabled && (s({
      type: we.SetDroppableDisabled,
      id: r,
      key: i,
      disabled: n
    }), d.current.disabled = n);
  }, [r, i, n, s]), {
    active: o,
    rect: m,
    isOver: l?.id === r,
    node: E,
    over: l,
    setNodeRef: k
  };
}
function N$(e) {
  let {
    animation: t,
    children: n
  } = e;
  const [r, a] = _(null), [i, o] = _(null), s = ti(n);
  return !n && !r && s && a(s), it(() => {
    if (!i)
      return;
    const l = r?.key, c = r?.props.id;
    if (l == null || c == null) {
      a(null);
      return;
    }
    Promise.resolve(t(c, i)).then(() => {
      a(null);
    });
  }, [t, r, i]), W.createElement(W.Fragment, null, n, r ? Cf(r, {
    ref: o
  }) : null);
}
const A$ = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1
};
function j$(e) {
  let {
    children: t
  } = e;
  return W.createElement(ta.Provider, {
    value: up
  }, W.createElement(Bi.Provider, {
    value: A$
  }, t));
}
const M$ = {
  position: "fixed",
  touchAction: "none"
}, R$ = (e) => ji(e) ? "transform 250ms ease" : void 0, I$ = /* @__PURE__ */ ut((e, t) => {
  let {
    as: n,
    activatorEvent: r,
    adjustScale: a,
    children: i,
    className: o,
    rect: s,
    style: l,
    transform: c,
    transition: d = R$
  } = e;
  if (!s)
    return null;
  const f = a ? c : {
    ...c,
    scaleX: 1,
    scaleY: 1
  }, m = {
    ...M$,
    width: s.width,
    height: s.height,
    top: s.top,
    left: s.left,
    transform: He.Transform.toString(f),
    transformOrigin: a && r ? N5(r, s) : void 0,
    transition: typeof d == "function" ? d(r) : d,
    ...l
  };
  return W.createElement(n, {
    className: o,
    style: m,
    ref: t
  }, i);
}), mp = (e) => (t) => {
  let {
    active: n,
    dragOverlay: r
  } = t;
  const a = {}, {
    styles: i,
    className: o
  } = e;
  if (i != null && i.active)
    for (const [s, l] of Object.entries(i.active))
      l !== void 0 && (a[s] = n.node.style.getPropertyValue(s), n.node.style.setProperty(s, l));
  if (i != null && i.dragOverlay)
    for (const [s, l] of Object.entries(i.dragOverlay))
      l !== void 0 && r.node.style.setProperty(s, l);
  return o != null && o.active && n.node.classList.add(o.active), o != null && o.dragOverlay && r.node.classList.add(o.dragOverlay), function() {
    for (const [l, c] of Object.entries(a))
      n.node.style.setProperty(l, c);
    o != null && o.active && n.node.classList.remove(o.active);
  };
}, V$ = (e) => {
  let {
    transform: {
      initial: t,
      final: n
    }
  } = e;
  return [{
    transform: He.Transform.toString(t)
  }, {
    transform: He.Transform.toString(n)
  }];
}, hp = {
  duration: 250,
  easing: "ease",
  keyframes: V$,
  sideEffects: /* @__PURE__ */ mp({
    styles: {
      active: {
        opacity: "0"
      }
    }
  })
};
function B$(e) {
  let {
    config: t,
    draggableNodes: n,
    droppableContainers: r,
    measuringConfiguration: a
  } = e;
  return Ai((i, o) => {
    if (t === null)
      return;
    const s = n.get(i);
    if (!s)
      return;
    const l = s.node.current;
    if (!l)
      return;
    const c = lp(o);
    if (!c)
      return;
    const {
      transform: d
    } = Fe(o).getComputedStyle(o), f = Jh(d);
    if (!f)
      return;
    const m = typeof t == "function" ? t : L$(t);
    return ip(l, a.draggable.measure), m({
      active: {
        id: i,
        data: s.data,
        node: l,
        rect: a.draggable.measure(l)
      },
      draggableNodes: n,
      dragOverlay: {
        node: o,
        rect: a.dragOverlay.measure(c)
      },
      droppableContainers: r,
      measuringConfiguration: a,
      transform: f
    });
  });
}
function L$(e) {
  const {
    duration: t,
    easing: n,
    sideEffects: r,
    keyframes: a
  } = {
    ...hp,
    ...e
  };
  return (i) => {
    let {
      active: o,
      dragOverlay: s,
      transform: l,
      ...c
    } = i;
    if (!t)
      return;
    const d = {
      x: s.rect.left - o.rect.left,
      y: s.rect.top - o.rect.top
    }, f = {
      scaleX: l.scaleX !== 1 ? o.rect.width * l.scaleX / s.rect.width : 1,
      scaleY: l.scaleY !== 1 ? o.rect.height * l.scaleY / s.rect.height : 1
    }, m = {
      x: l.x - d.x,
      y: l.y - d.y,
      ...f
    }, h = a({
      ...c,
      active: o,
      dragOverlay: s,
      transform: {
        initial: l,
        final: m
      }
    }), [p] = h, g = h[h.length - 1];
    if (JSON.stringify(p) === JSON.stringify(g))
      return;
    const v = r?.({
      active: o,
      dragOverlay: s,
      ...c
    }), b = s.node.animate(h, {
      duration: t,
      easing: n,
      fill: "forwards"
    });
    return new Promise((x) => {
      b.onfinish = () => {
        v?.(), x();
      };
    });
  };
}
let wd = 0;
function F$(e) {
  return F(() => {
    if (e != null)
      return wd++, wd;
  }, [e]);
}
const pp = /* @__PURE__ */ W.memo((e) => {
  let {
    adjustScale: t = !1,
    children: n,
    dropAnimation: r,
    style: a,
    transition: i,
    modifiers: o,
    wrapperElement: s = "div",
    className: l,
    zIndex: c = 999
  } = e;
  const {
    activatorEvent: d,
    active: f,
    activeNodeRect: m,
    containerNodeRect: h,
    draggableNodes: p,
    droppableContainers: g,
    dragOverlay: v,
    over: b,
    measuringConfiguration: x,
    scrollableAncestors: C,
    scrollableAncestorRects: w,
    windowRect: E
  } = fp(), k = ee(Bi), A = F$(f?.id), P = dp(o, {
    activatorEvent: d,
    active: f,
    activeNodeRect: m,
    containerNodeRect: h,
    draggingNodeRect: v.rect,
    over: b,
    overlayNodeRect: v.rect,
    scrollableAncestors: C,
    scrollableAncestorRects: w,
    transform: k,
    windowRect: E
  }), j = _l(m), T = B$({
    config: r,
    draggableNodes: p,
    droppableContainers: g,
    measuringConfiguration: x
  }), M = j ? v.setRef : void 0;
  return W.createElement(j$, null, W.createElement(N$, {
    animation: T
  }, f && A ? W.createElement(I$, {
    key: A,
    id: f.id,
    ref: M,
    as: s,
    activatorEvent: d,
    adjustScale: t,
    className: l,
    transition: i,
    rect: j,
    style: {
      zIndex: c,
      ...a
    },
    transform: P
  }, n) : null));
});
function O$(e, t, n) {
  const r = {
    ...e
  };
  return t.top + e.y <= n.top ? r.y = n.top - t.top : t.bottom + e.y >= n.top + n.height && (r.y = n.top + n.height - t.bottom), t.left + e.x <= n.left ? r.x = n.left - t.left : t.right + e.x >= n.left + n.width && (r.x = n.left + n.width - t.right), r;
}
const z$ = (e) => {
  let {
    containerNodeRect: t,
    draggingNodeRect: n,
    transform: r
  } = e;
  return !n || !t ? r : O$(r, n, t);
}, _$ = (e) => {
  let {
    transform: t
  } = e;
  return {
    ...t,
    x: 0
  };
};
function Fr(e, t, n) {
  const r = e.slice();
  return r.splice(n < 0 ? r.length + n : n, 0, r.splice(t, 1)[0]), r;
}
function U$(e, t) {
  return e.reduce((n, r, a) => {
    const i = t.get(r);
    return i && (n[a] = i), n;
  }, Array(e.length));
}
function wa(e) {
  return e !== null && e >= 0;
}
function H$(e, t) {
  if (e === t)
    return !0;
  if (e.length !== t.length)
    return !1;
  for (let n = 0; n < e.length; n++)
    if (e[n] !== t[n])
      return !1;
  return !0;
}
function K$(e) {
  return typeof e == "boolean" ? {
    draggable: e,
    droppable: e
  } : e;
}
const $a = {
  scaleX: 1,
  scaleY: 1
}, $d = (e) => {
  var t;
  let {
    rects: n,
    activeNodeRect: r,
    activeIndex: a,
    overIndex: i,
    index: o
  } = e;
  const s = (t = n[a]) != null ? t : r;
  if (!s)
    return null;
  const l = W$(n, o, a);
  if (o === a) {
    const c = n[i];
    return c ? {
      x: a < i ? c.left + c.width - (s.left + s.width) : c.left - s.left,
      y: 0,
      ...$a
    } : null;
  }
  return o > a && o <= i ? {
    x: -s.width - l,
    y: 0,
    ...$a
  } : o < a && o >= i ? {
    x: s.width + l,
    y: 0,
    ...$a
  } : {
    x: 0,
    y: 0,
    ...$a
  };
};
function W$(e, t, n) {
  const r = e[t], a = e[t - 1], i = e[t + 1];
  return !r || !a && !i ? 0 : n < t ? a ? r.left - (a.left + a.width) : i.left - (r.left + r.width) : i ? i.left - (r.left + r.width) : r.left - (a.left + a.width);
}
const Or = (e) => {
  let {
    rects: t,
    activeIndex: n,
    overIndex: r,
    index: a
  } = e;
  const i = Fr(t, r, n), o = t[a], s = i[a];
  return !s || !o ? null : {
    x: s.left - o.left,
    y: s.top - o.top,
    scaleX: s.width / o.width,
    scaleY: s.height / o.height
  };
}, Da = {
  scaleX: 1,
  scaleY: 1
}, Ul = (e) => {
  var t;
  let {
    activeIndex: n,
    activeNodeRect: r,
    index: a,
    rects: i,
    overIndex: o
  } = e;
  const s = (t = i[n]) != null ? t : r;
  if (!s)
    return null;
  if (a === n) {
    const c = i[o];
    return c ? {
      x: 0,
      y: n < o ? c.top + c.height - (s.top + s.height) : c.top - s.top,
      ...Da
    } : null;
  }
  const l = G$(i, a, n);
  return a > n && a <= o ? {
    x: 0,
    y: -s.height - l,
    ...Da
  } : a < n && a >= o ? {
    x: 0,
    y: s.height + l,
    ...Da
  } : {
    x: 0,
    y: 0,
    ...Da
  };
};
function G$(e, t, n) {
  const r = e[t], a = e[t - 1], i = e[t + 1];
  return r ? n < t ? a ? r.top - (a.top + a.height) : i ? i.top - (r.top + r.height) : 0 : i ? i.top - (r.top + r.height) : a ? r.top - (a.top + a.height) : 0 : 0;
}
const gp = "Sortable", vp = /* @__PURE__ */ W.createContext({
  activeIndex: -1,
  containerId: gp,
  disableTransforms: !1,
  items: [],
  overIndex: -1,
  useDragOverlay: !1,
  sortedRects: [],
  strategy: Or,
  disabled: {
    draggable: !1,
    droppable: !1
  }
});
function Un(e) {
  let {
    children: t,
    id: n,
    items: r,
    strategy: a = Or,
    disabled: i = !1
  } = e;
  const {
    active: o,
    dragOverlay: s,
    droppableRects: l,
    over: c,
    measureDroppableContainers: d
  } = fp(), f = ea(gp, n), m = s.rect !== null, h = F(() => r.map((k) => typeof k == "object" && "id" in k ? k.id : k), [r]), p = o != null, g = o ? h.indexOf(o.id) : -1, v = c ? h.indexOf(c.id) : -1, b = B(h), x = !H$(h, b.current), C = v !== -1 && g === -1 || x, w = K$(i);
  it(() => {
    x && p && d(h);
  }, [x, h, p, d]), U(() => {
    b.current = h;
  }, [h]);
  const E = F(
    () => ({
      activeIndex: g,
      containerId: f,
      disabled: w,
      disableTransforms: C,
      items: h,
      overIndex: v,
      useDragOverlay: m,
      sortedRects: U$(h, l),
      strategy: a
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [g, f, w.draggable, w.droppable, C, h, v, l, m, a]
  );
  return W.createElement(vp.Provider, {
    value: E
  }, t);
}
const Y$ = (e) => {
  let {
    id: t,
    items: n,
    activeIndex: r,
    overIndex: a
  } = e;
  return Fr(n, r, a).indexOf(t);
}, q$ = (e) => {
  let {
    containerId: t,
    isSorting: n,
    wasDragging: r,
    index: a,
    items: i,
    newIndex: o,
    previousItems: s,
    previousContainerId: l,
    transition: c
  } = e;
  return !c || !r || s !== i && a === o ? !1 : n ? !0 : o !== a && t === l;
}, Z$ = {
  duration: 200,
  easing: "ease"
}, bp = "transform", X$ = /* @__PURE__ */ He.Transition.toString({
  property: bp,
  duration: 0,
  easing: "linear"
}), J$ = {
  roleDescription: "sortable"
};
function Q$(e) {
  let {
    disabled: t,
    index: n,
    node: r,
    rect: a
  } = e;
  const [i, o] = _(null), s = B(n);
  return it(() => {
    if (!t && n !== s.current && r.current) {
      const l = a.current;
      if (l) {
        const c = Qn(r.current, {
          ignoreTransform: !0
        }), d = {
          x: l.left - c.left,
          y: l.top - c.top,
          scaleX: l.width / c.width,
          scaleY: l.height / c.height
        };
        (d.x || d.y) && o(d);
      }
    }
    n !== s.current && (s.current = n);
  }, [t, n, r, a]), U(() => {
    i && o(null);
  }, [i]), i;
}
function dn(e) {
  let {
    animateLayoutChanges: t = q$,
    attributes: n,
    disabled: r,
    data: a,
    getNewIndex: i = Y$,
    id: o,
    strategy: s,
    resizeObserverConfig: l,
    transition: c = Z$
  } = e;
  const {
    items: d,
    containerId: f,
    activeIndex: m,
    disabled: h,
    disableTransforms: p,
    sortedRects: g,
    overIndex: v,
    useDragOverlay: b,
    strategy: x
  } = ee(vp), C = eD(r, h), w = d.indexOf(o), E = F(() => ({
    sortable: {
      containerId: f,
      index: w,
      items: d
    },
    ...a
  }), [f, a, w, d]), k = F(() => d.slice(d.indexOf(o)), [d, o]), {
    rect: A,
    node: P,
    isOver: j,
    setNodeRef: T
  } = k$({
    id: o,
    data: E,
    disabled: C.droppable,
    resizeObserverConfig: {
      updateMeasurementsFor: k,
      ...l
    }
  }), {
    active: M,
    activatorEvent: L,
    activeNodeRect: O,
    attributes: Z,
    setNodeRef: Q,
    listeners: J,
    isDragging: Y,
    over: K,
    setActivatorNodeRef: te,
    transform: S
  } = S$({
    id: o,
    data: E,
    attributes: {
      ...J$,
      ...n
    },
    disabled: C.draggable
  }), $ = g5(T, Q), D = !!M, N = D && !p && wa(m) && wa(v), I = !b && Y, H = I && N ? S : null, X = N ? H ?? (s ?? x)({
    rects: g,
    activeNodeRect: O,
    activeIndex: m,
    overIndex: v,
    index: w
  }) : null, oe = wa(m) && wa(v) ? i({
    id: o,
    items: d,
    activeIndex: m,
    overIndex: v
  }) : w, le = M?.id, V = B({
    activeId: le,
    items: d,
    newIndex: oe,
    containerId: f
  }), se = d !== V.current.items, xe = t({
    active: M,
    containerId: f,
    isDragging: Y,
    isSorting: D,
    id: o,
    index: w,
    items: d,
    newIndex: V.current.newIndex,
    previousItems: V.current.items,
    previousContainerId: V.current.containerId,
    transition: c,
    wasDragging: V.current.activeId != null
  }), ct = Q$({
    disabled: !xe,
    index: w,
    node: P,
    rect: A
  });
  return U(() => {
    D && V.current.newIndex !== oe && (V.current.newIndex = oe), f !== V.current.containerId && (V.current.containerId = f), d !== V.current.items && (V.current.items = d);
  }, [D, oe, f, d]), U(() => {
    if (le === V.current.activeId)
      return;
    if (le != null && V.current.activeId == null) {
      V.current.activeId = le;
      return;
    }
    const hn = setTimeout(() => {
      V.current.activeId = le;
    }, 50);
    return () => clearTimeout(hn);
  }, [le]), {
    active: M,
    activeIndex: m,
    attributes: Z,
    data: E,
    rect: A,
    index: w,
    newIndex: oe,
    items: d,
    isOver: j,
    isSorting: D,
    isDragging: Y,
    listeners: J,
    node: P,
    overIndex: v,
    over: K,
    setNodeRef: $,
    setActivatorNodeRef: te,
    setDroppableNodeRef: T,
    setDraggableNodeRef: Q,
    transform: ct ?? X,
    transition: xt()
  };
  function xt() {
    if (
      // Temporarily disable transitions for a single frame to set up derived transforms
      ct || // Or to prevent items jumping to back to their "new" position when items change
      se && V.current.newIndex === w
    )
      return X$;
    if (!(I && !ji(L) || !c) && (D || xe))
      return He.Transition.toString({
        ...c,
        property: bp
      });
  }
}
function eD(e, t) {
  var n, r;
  return typeof e == "boolean" ? {
    draggable: e,
    // Backwards compatibility
    droppable: !1
  } : {
    draggable: (n = e?.draggable) != null ? n : t.draggable,
    droppable: (r = e?.droppable) != null ? r : t.droppable
  };
}
function ii(e) {
  if (!e)
    return !1;
  const t = e.data.current;
  return !!(t && "sortable" in t && typeof t.sortable == "object" && "containerId" in t.sortable && "items" in t.sortable && "index" in t.sortable);
}
const tD = [ie.Down, ie.Right, ie.Up, ie.Left], yp = (e, t) => {
  let {
    context: {
      active: n,
      collisionRect: r,
      droppableRects: a,
      droppableContainers: i,
      over: o,
      scrollableAncestors: s
    }
  } = t;
  if (tD.includes(e.code)) {
    if (e.preventDefault(), !n || !r)
      return;
    const l = [];
    i.getEnabled().forEach((f) => {
      if (!f || f != null && f.disabled)
        return;
      const m = a.get(f.id);
      if (m)
        switch (e.code) {
          case ie.Down:
            r.top < m.top && l.push(f);
            break;
          case ie.Up:
            r.top > m.top && l.push(f);
            break;
          case ie.Left:
            r.left > m.left && l.push(f);
            break;
          case ie.Right:
            r.left < m.left && l.push(f);
            break;
        }
    });
    const c = j5({
      collisionRect: r,
      droppableRects: a,
      droppableContainers: l
    });
    let d = qh(c, "id");
    if (d === o?.id && c.length > 1 && (d = c[1].id), d != null) {
      const f = i.get(n.id), m = i.get(d), h = m ? a.get(m.id) : null, p = m?.node.current;
      if (p && h && f && m) {
        const v = Ri(p).some((k, A) => s[A] !== k), b = xp(f, m), x = nD(f, m), C = v || !b ? {
          x: 0,
          y: 0
        } : {
          x: x ? r.width - h.width : 0,
          y: x ? r.height - h.height : 0
        }, w = {
          x: h.left,
          y: h.top
        };
        return C.x && C.y ? w : Br(w, C);
      }
    }
  }
};
function xp(e, t) {
  return !ii(e) || !ii(t) ? !1 : e.data.current.sortable.containerId === t.data.current.sortable.containerId;
}
function nD(e, t) {
  return !ii(e) || !ii(t) || !xp(e, t) ? !1 : e.data.current.sortable.index < t.data.current.sortable.index;
}
function rD({ header: e }) {
  const { props: t } = $e(), { column: n } = e, { attributes: r, isDragging: a, listeners: i, setNodeRef: o, transform: s, transition: l } = dn({
    id: e.column.id
  }), c = {
    opacity: a ? 0.8 : 1,
    position: "relative",
    transform: He.Translate.toString(s),
    transition: l,
    whiteSpace: "nowrap",
    width: e.column.getSize(),
    zIndex: a ? 1 : 0
  };
  return /* @__PURE__ */ u.jsx(Tl, { header: e, dndStyle: c, dndRef: o, children: /* @__PURE__ */ u.jsxs("div", { className: "flex items-center justify-start gap-0.5", children: [
    /* @__PURE__ */ u.jsx(
      Re,
      {
        mode: "icon",
        size: "sm",
        variant: "dim",
        className: "-ms-2 size-6",
        ...r,
        ...i,
        "aria-label": "Drag to reorder",
        children: /* @__PURE__ */ u.jsx(kf, { className: "opacity-50", "aria-hidden": "true" })
      }
    ),
    e.isPlaceholder ? null : _n(e.column.columnDef.header, e.getContext()),
    t.tableLayout?.columnsResizable && n.getCanResize() && /* @__PURE__ */ u.jsx(Pl, { header: e })
  ] }) });
}
function aD({ cell: e }) {
  const { isDragging: t, setNodeRef: n, transform: r, transition: a } = dn({
    id: e.column.id
  }), i = {
    opacity: t ? 0.8 : 1,
    position: "relative",
    transform: He.Translate.toString(r),
    transition: a,
    width: e.column.getSize(),
    zIndex: t ? 1 : 0
  };
  return /* @__PURE__ */ u.jsx(Rl, { cell: e, dndStyle: i, dndRef: n, children: _n(e.column.columnDef.cell, e.getContext()) });
}
function FT({ handleDragEnd: e }) {
  const { table: t, isLoading: n, props: r } = $e(), a = t.getState().pagination, i = Mi(bt(Ol, {}), bt(zl, {}), bt(er, {}));
  return /* @__PURE__ */ u.jsx(
    Li,
    {
      id: Kr(),
      collisionDetection: Zh,
      modifiers: [z$],
      onDragEnd: e,
      sensors: i,
      children: /* @__PURE__ */ u.jsx("div", { className: "relative", children: /* @__PURE__ */ u.jsxs(Cl, { children: [
        /* @__PURE__ */ u.jsx(El, { children: t.getHeaderGroups().map((o, s) => (console.log("table.getState().columnOrder:", t.getState().columnOrder), /* @__PURE__ */ u.jsx(Sl, { headerGroup: o, children: /* @__PURE__ */ u.jsx(Un, { items: t.getState().columnOrder, strategy: $d, children: o.headers.map((l, c) => /* @__PURE__ */ u.jsx(rD, { header: l }, c)) }) }, s))) }),
        (r.tableLayout?.stripped || !r.tableLayout?.rowBorder) && /* @__PURE__ */ u.jsx(kl, {}),
        /* @__PURE__ */ u.jsx(Nl, { children: r.loadingMode === "skeleton" && n && a?.pageSize ? Array.from({ length: a.pageSize }).map((o, s) => /* @__PURE__ */ u.jsx(Al, { children: t.getVisibleFlatColumns().map((l, c) => /* @__PURE__ */ u.jsx(jl, { column: l, children: l.columnDef.meta?.skeleton }, c)) }, s)) : t.getRowModel().rows.length ? t.getRowModel().rows.map((o, s) => /* @__PURE__ */ u.jsxs(gi, { children: [
          /* @__PURE__ */ u.jsx(Ml, { row: o, children: o.getVisibleCells().map((l) => /* @__PURE__ */ u.jsx(
            Un,
            {
              items: t.getState().columnOrder,
              strategy: $d,
              children: /* @__PURE__ */ u.jsx(aD, { cell: l })
            },
            l.id
          )) }, s),
          o.getIsExpanded() && /* @__PURE__ */ u.jsx(Uh, { row: o })
        ] }, o.id)) : /* @__PURE__ */ u.jsx(Il, {}) })
      ] }) })
    }
  );
}
function OT({ rowId: e }) {
  const { attributes: t, listeners: n } = dn({
    id: e
  });
  return /* @__PURE__ */ u.jsx(Re, { variant: "dim", size: "sm", className: "size-7", ...t, ...n, children: /* @__PURE__ */ u.jsx(Eb, {}) });
}
function iD({ row: e }) {
  const { transform: t, transition: n, setNodeRef: r, isDragging: a } = dn({
    id: e.id
  }), i = {
    transform: He.Transform.toString(t),
    //let dnd-kit do its thing
    transition: n,
    opacity: a ? 0.8 : 1,
    zIndex: a ? 1 : 0,
    position: "relative"
  };
  return /* @__PURE__ */ u.jsx(Ml, { row: e, dndRef: r, dndStyle: i, children: e.getVisibleCells().map((o, s) => /* @__PURE__ */ u.jsx(Rl, { cell: o, children: _n(o.column.columnDef.cell, o.getContext()) }, s)) }, e.id);
}
function zT({
  handleDragEnd: e,
  dataIds: t
}) {
  const { table: n, isLoading: r, props: a } = $e(), i = n.getState().pagination, o = Mi(bt(Ol, {}), bt(zl, {}), bt(er, {}));
  return /* @__PURE__ */ u.jsx(
    Li,
    {
      id: Kr(),
      collisionDetection: Zh,
      modifiers: [_$],
      onDragEnd: e,
      sensors: o,
      children: /* @__PURE__ */ u.jsx("div", { className: "relative", children: /* @__PURE__ */ u.jsxs(Cl, { children: [
        /* @__PURE__ */ u.jsx(El, { children: n.getHeaderGroups().map((s, l) => /* @__PURE__ */ u.jsx(Sl, { headerGroup: s, children: s.headers.map((c, d) => {
          const { column: f } = c;
          return /* @__PURE__ */ u.jsxs(Tl, { header: c, children: [
            c.isPlaceholder ? null : _n(c.column.columnDef.header, c.getContext()),
            a.tableLayout?.columnsResizable && f.getCanResize() && /* @__PURE__ */ u.jsx(Pl, { header: c })
          ] }, d);
        }) }, l)) }),
        (a.tableLayout?.stripped || !a.tableLayout?.rowBorder) && /* @__PURE__ */ u.jsx(kl, {}),
        /* @__PURE__ */ u.jsx(Nl, { children: a.loadingMode === "skeleton" && r && i?.pageSize ? Array.from({ length: i.pageSize }).map((s, l) => /* @__PURE__ */ u.jsx(Al, { children: n.getVisibleFlatColumns().map((c, d) => /* @__PURE__ */ u.jsx(jl, { column: c, children: c.columnDef.meta?.skeleton }, d)) }, l)) : n.getRowModel().rows.length ? /* @__PURE__ */ u.jsx(Un, { items: t, strategy: Ul, children: n.getRowModel().rows.map((s) => /* @__PURE__ */ u.jsx(iD, { row: s }, s.id)) }) : /* @__PURE__ */ u.jsx(Il, {}) })
      ] }) })
    }
  );
}
function oD({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "table-wrapper", className: "relative w-full overflow-auto", children: /* @__PURE__ */ u.jsx("table", { "data-slot": "table", className: y("w-full caption-bottom text-foreground text-sm", e), ...t }) });
}
function sD({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx("thead", { "data-slot": "table-header", className: y("[&_tr]:border-b", e), ...t });
}
function lD({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx("tbody", { "data-slot": "table-body", className: y("[&_tr:last-child]:border-0", e), ...t });
}
function _T({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    "tfoot",
    {
      "data-slot": "table-footer",
      className: y("border-t bg-muted/50 font-medium last:[&>tr]:border-b-0", e),
      ...t
    }
  );
}
function Dd({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    "tr",
    {
      "data-slot": "table-row",
      className: y(
        "border-b transition-colors [&:has(td):hover]:bg-muted/50 data-[state=selected]:bg-muted",
        e
      ),
      ...t
    }
  );
}
function uD({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    "th",
    {
      "data-slot": "table-head",
      className: y(
        "h-12 px-4 text-left rtl:text-right align-middle font-normal text-muted-foreground [&:has([role=checkbox])]:pe-0",
        e
      ),
      ...t
    }
  );
}
function cD({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx("td", { "data-slot": "table-cell", className: y("p-4 align-middle [&:has([role=checkbox])]:pe-0", e), ...t });
}
function UT({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx("caption", { "data-slot": "table-caption", className: y("mt-4 text-sm text-muted-foreground", e), ...t });
}
function HT({ columns: e, data: t, isLoading: n, emptyMessage: r }) {
  return n ? /* @__PURE__ */ u.jsx("div", { className: "p-8 text-center text-muted-foreground", children: "Loading..." }) : t.length === 0 ? /* @__PURE__ */ u.jsx("div", { className: "p-8 text-center text-muted-foreground", children: r || "No data available." }) : /* @__PURE__ */ u.jsxs(oD, { children: [
    /* @__PURE__ */ u.jsx(sD, { children: /* @__PURE__ */ u.jsx(Dd, { children: e.map((a, i) => /* @__PURE__ */ u.jsx(uD, { children: a.header }, a.id || a.accessorKey || i)) }) }),
    /* @__PURE__ */ u.jsx(lD, { children: t.map((a, i) => /* @__PURE__ */ u.jsx(Dd, { children: e.map((o, s) => /* @__PURE__ */ u.jsx(cD, { children: o.cell ? o.cell({ row: { original: a } }) : o.accessorKey ? String(a[o.accessorKey] ?? "") : null }, o.id || o.accessorKey || s)) }, i)) })
  ] });
}
const Hl = re(
  `
    flex w-full bg-background border border-input shadow-xs shadow-black/5 transition-[color,box-shadow] text-foreground placeholder:text-muted-foreground/80 
    focus-visible:ring-ring/30  focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px]     
    disabled:cursor-not-allowed disabled:opacity-60 
    [&[readonly]]:bg-muted/80 [&[readonly]]:cursor-not-allowed
    file:h-full [&[type=file]]:py-0 file:border-solid file:border-input file:bg-transparent 
    file:font-medium file:not-italic file:text-foreground file:p-0 file:border-0 file:border-e
    aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/20
  `,
  {
    variants: {
      variant: {
        lg: "h-10 px-4 text-sm rounded-md file:pe-4 file:me-4",
        md: "h-8.5 px-3 text-[0.8125rem] leading-(--text-sm--line-height) rounded-md file:pe-3 file:me-3",
        sm: "h-7 px-2.5 text-xs rounded-md file:pe-2.5 file:me-2.5"
      }
    },
    defaultVariants: {
      variant: "md"
    }
  }
), dD = re(
  "flex items-center shrink-0 justify-center bg-muted border border-input shadow-xs shadow-[rgba(0,0,0,0.05)] text-secondary-foreground [&_svg]:text-secondary-foreground/60",
  {
    variants: {
      variant: {
        sm: "rounded-md h-7 min-w-7 text-xs px-2.5 [&_svg:not([class*=size-])]:size-3.5",
        md: "rounded-md h-8.5 min-w-8.5 px-3 text-[0.8125rem] leading-(--text-sm--line-height) [&_svg:not([class*=size-])]:size-4.5",
        lg: "rounded-md h-10 min-w-10 px-4 text-sm [&_svg:not([class*=size-])]:size-4.5"
      },
      mode: {
        default: "",
        icon: "px-0 justify-center"
      }
    },
    defaultVariants: {
      variant: "md",
      mode: "default"
    }
  }
), fD = re(
  `
    flex items-stretch
    [&_[data-slot=input]]:grow
    [&_[data-slot=input-addon]:has(+[data-slot=input])]:rounded-e-none [&_[data-slot=input-addon]:has(+[data-slot=input])]:border-e-0
    [&_[data-slot=input-addon]:has(+[data-slot=datefield])]:rounded-e-none [&_[data-slot=input-addon]:has(+[data-slot=datefield])]:border-e-0 
    [&_[data-slot=input]+[data-slot=input-addon]]:rounded-s-none [&_[data-slot=input]+[data-slot=input-addon]]:border-s-0
    [&_[data-slot=input-addon]:has(+[data-slot=button])]:rounded-e-none
    [&_[data-slot=input]+[data-slot=button]]:rounded-s-none
    [&_[data-slot=button]+[data-slot=input]]:rounded-s-none
    [&_[data-slot=input-addon]+[data-slot=input]]:rounded-s-none
    [&_[data-slot=input-addon]+[data-slot=datefield]]:[&_[data-slot=input]]:rounded-s-none
    [&_[data-slot=datefield]:has(+[data-slot=input-addon])]:[&_[data-slot=input]]:rounded-e-none
    [&_[data-slot=input]:has(+[data-slot=button])]:rounded-e-none
    [&_[data-slot=input]:has(+[data-slot=input-addon])]:rounded-e-none
    [&_[data-slot=datefield]]:grow
    [&_[data-slot=datefield]+[data-slot=input-addon]]:rounded-s-none [&_[data-slot=datefield]+[data-slot=input-addon]]:border-s-0
  `,
  {
    variants: {},
    defaultVariants: {}
  }
), mD = re(
  `
    flex items-center gap-1.5
    has-[:focus-visible]:ring-ring/30 
    has-[:focus-visible]:border-ring
    has-[:focus-visible]:outline-none 
    has-[:focus-visible]:ring-[3px]

    [&_[data-slot=datefield]]:grow 
    [&_[data-slot=input]]:data-focus-within:ring-transparent  
    [&_[data-slot=input]]:data-focus-within:ring-0 
    [&_[data-slot=input]]:data-focus-within:border-0 
    [&_[data-slot=input]]:flex 
    [&_[data-slot=input]]:w-full 
    [&_[data-slot=input]]:outline-none 
    [&_[data-slot=input]]:transition-colors 
    [&_[data-slot=input]]:text-foreground
    [&_[data-slot=input]]:placeholder:text-muted-foreground 
    [&_[data-slot=input]]:border-0 
    [&_[data-slot=input]]:bg-transparent 
    [&_[data-slot=input]]:p-0
    [&_[data-slot=input]]:shadow-none 
    [&_[data-slot=input]]:focus-visible:ring-0 
    [&_[data-slot=input]]:h-auto 
    [&_[data-slot=input]]:disabled:cursor-not-allowed
    [&_[data-slot=input]]:disabled:opacity-50    

    [&_svg]:text-muted-foreground 
    [&_svg]:shrink-0
  `,
  {
    variants: {
      variant: {
        sm: "gap-1.25 [&_svg:not([class*=size-])]:size-3.5",
        md: "gap-1.5 [&_svg:not([class*=size-])]:size-4",
        lg: "gap-1.5 [&_svg:not([class*=size-])]:size-4"
      }
    },
    defaultVariants: {
      variant: "md"
    }
  }
);
function KT({
  className: e,
  type: t,
  variant: n,
  ...r
}) {
  return /* @__PURE__ */ u.jsx("input", { "data-slot": "input", type: t, className: y(Hl({ variant: n }), e), ...r });
}
function WT({
  className: e,
  variant: t,
  mode: n,
  ...r
}) {
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "input-addon", className: y(dD({ variant: t, mode: n }), e), ...r });
}
function GT({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "input-group", className: y(fD(), e), ...t });
}
function YT({
  className: e,
  variant: t,
  ...n
}) {
  return /* @__PURE__ */ u.jsx(
    "div",
    {
      "data-slot": "input-wrapper",
      className: y(Hl({ variant: t }), mD({ variant: t }), e),
      ...n
    }
  );
}
const Ke = typeof document < "u" ? W.useLayoutEffect : () => {
};
function hD(e) {
  let [t, n] = _(e), r = B(t), a = B(null), i = B(() => {
    if (!a.current) return;
    let s = a.current.next();
    if (s.done) {
      a.current = null;
      return;
    }
    r.current === s.value ? i.current() : n(s.value);
  });
  Ke(() => {
    r.current = t, a.current && i.current();
  });
  let o = G((s) => {
    a.current = s(r.current), i.current();
  }, [
    i
  ]);
  return [
    t,
    o
  ];
}
const oi = {
  prefix: String(Math.round(Math.random() * 1e10)),
  current: 0
}, wp = /* @__PURE__ */ W.createContext(oi), pD = /* @__PURE__ */ W.createContext(!1);
let gD = !!(typeof window < "u" && window.document && window.document.createElement), Do = /* @__PURE__ */ new WeakMap();
function vD(e = !1) {
  let t = ee(wp), n = B(null);
  if (n.current === null && !e) {
    var r, a;
    let i = (a = W.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) === null || a === void 0 || (r = a.ReactCurrentOwner) === null || r === void 0 ? void 0 : r.current;
    if (i) {
      let o = Do.get(i);
      o == null ? Do.set(i, {
        id: t.current,
        state: i.memoizedState
      }) : i.memoizedState !== o.state && (t.current = o.id, Do.delete(i));
    }
    n.current = ++t.current;
  }
  return n.current;
}
function bD(e) {
  let t = ee(wp);
  t === oi && !gD && process.env.NODE_ENV !== "production" && console.warn("When server rendering, you must wrap your application in an <SSRProvider> to ensure consistent ids are generated between the client and server.");
  let n = vD(!!e), r = t === oi && process.env.NODE_ENV === "test" ? "react-aria" : `react-aria${t.prefix}`;
  return e || `${r}-${n}`;
}
function yD(e) {
  let t = W.useId(), [n] = _($p()), r = n || process.env.NODE_ENV === "test" ? "react-aria" : `react-aria${oi.prefix}`;
  return e || `${r}-${t}`;
}
const xD = typeof W.useId == "function" ? yD : bD;
function wD() {
  return !1;
}
function $D() {
  return !0;
}
function DD(e) {
  return () => {
  };
}
function $p() {
  return typeof W.useSyncExternalStore == "function" ? W.useSyncExternalStore(DD, wD, $D) : ee(pD);
}
let CD = !!(typeof window < "u" && window.document && window.document.createElement), Rn = /* @__PURE__ */ new Map(), hr;
typeof FinalizationRegistry < "u" && (hr = new FinalizationRegistry((e) => {
  Rn.delete(e);
}));
function zr(e) {
  let [t, n] = _(e), r = B(null), a = xD(t), i = B(null);
  if (hr && hr.register(i, a), CD) {
    const o = Rn.get(a);
    o && !o.includes(r) ? o.push(r) : Rn.set(a, [
      r
    ]);
  }
  return Ke(() => {
    let o = a;
    return () => {
      hr && hr.unregister(i), Rn.delete(o);
    };
  }, [
    a
  ]), U(() => {
    let o = r.current;
    return o && n(o), () => {
      o && (r.current = null);
    };
  }), a;
}
function ED(e, t) {
  if (e === t) return e;
  let n = Rn.get(e);
  if (n)
    return n.forEach((a) => a.current = t), t;
  let r = Rn.get(t);
  return r ? (r.forEach((a) => a.current = e), e) : t;
}
function Cd(e = []) {
  let t = zr(), [n, r] = hD(t), a = G(() => {
    r(function* () {
      yield t, yield document.getElementById(t) ? t : void 0;
    });
  }, [
    t,
    r
  ]);
  return Ke(a, [
    t,
    a,
    ...e
  ]), n;
}
function Dp(...e) {
  return (...t) => {
    for (let n of e) typeof n == "function" && n(...t);
  };
}
const me = (e) => {
  var t;
  return (t = e?.ownerDocument) !== null && t !== void 0 ? t : document;
}, Oe = (e) => e && "window" in e && e.window === e ? e : me(e).defaultView || window;
function SD(e) {
  return e !== null && typeof e == "object" && "nodeType" in e && typeof e.nodeType == "number";
}
function TD(e) {
  return SD(e) && e.nodeType === Node.DOCUMENT_FRAGMENT_NODE && "host" in e;
}
let PD = !1;
function Fi() {
  return PD;
}
function ae(e, t) {
  if (!Fi()) return t && e ? e.contains(t) : !1;
  if (!e || !t) return !1;
  let n = t;
  for (; n !== null; ) {
    if (n === e) return !0;
    n.tagName === "SLOT" && n.assignedSlot ? n = n.assignedSlot.parentNode : TD(n) ? n = n.host : n = n.parentNode;
  }
  return !1;
}
const st = (e = document) => {
  var t;
  if (!Fi()) return e.activeElement;
  let n = e.activeElement;
  for (; n && "shadowRoot" in n && (!((t = n.shadowRoot) === null || t === void 0) && t.activeElement); ) n = n.shadowRoot.activeElement;
  return n;
};
function q(e) {
  if (Fi() && e.target instanceof Element && e.target.shadowRoot) {
    var t, n;
    if ("composedPath" in e) return (t = e.composedPath()[0]) !== null && t !== void 0 ? t : null;
    if ("composedPath" in e.nativeEvent) return (n = e.nativeEvent.composedPath()[0]) !== null && n !== void 0 ? n : null;
  }
  return e.target;
}
class kD {
  get currentNode() {
    return this._currentNode;
  }
  set currentNode(t) {
    if (!ae(this.root, t)) throw new Error("Cannot set currentNode to a node that is not contained by the root node.");
    const n = [];
    let r = t, a = t;
    for (this._currentNode = t; r && r !== this.root; ) if (r.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      const o = r, s = this._doc.createTreeWalker(o, this.whatToShow, {
        acceptNode: this._acceptNode
      });
      n.push(s), s.currentNode = a, this._currentSetFor.add(s), r = a = o.host;
    } else r = r.parentNode;
    const i = this._doc.createTreeWalker(this.root, this.whatToShow, {
      acceptNode: this._acceptNode
    });
    n.push(i), i.currentNode = a, this._currentSetFor.add(i), this._walkerStack = n;
  }
  get doc() {
    return this._doc;
  }
  firstChild() {
    let t = this.currentNode, n = this.nextNode();
    return ae(t, n) ? (n && (this.currentNode = n), n) : (this.currentNode = t, null);
  }
  lastChild() {
    let n = this._walkerStack[0].lastChild();
    return n && (this.currentNode = n), n;
  }
  nextNode() {
    const t = this._walkerStack[0].nextNode();
    if (t) {
      if (t.shadowRoot) {
        var n;
        let a;
        if (typeof this.filter == "function" ? a = this.filter(t) : !((n = this.filter) === null || n === void 0) && n.acceptNode && (a = this.filter.acceptNode(t)), a === NodeFilter.FILTER_ACCEPT)
          return this.currentNode = t, t;
        let i = this.nextNode();
        return i && (this.currentNode = i), i;
      }
      return t && (this.currentNode = t), t;
    } else if (this._walkerStack.length > 1) {
      this._walkerStack.shift();
      let r = this.nextNode();
      return r && (this.currentNode = r), r;
    } else return null;
  }
  previousNode() {
    const t = this._walkerStack[0];
    if (t.currentNode === t.root) {
      if (this._currentSetFor.has(t))
        if (this._currentSetFor.delete(t), this._walkerStack.length > 1) {
          this._walkerStack.shift();
          let a = this.previousNode();
          return a && (this.currentNode = a), a;
        } else return null;
      return null;
    }
    const n = t.previousNode();
    if (n) {
      if (n.shadowRoot) {
        var r;
        let i;
        if (typeof this.filter == "function" ? i = this.filter(n) : !((r = this.filter) === null || r === void 0) && r.acceptNode && (i = this.filter.acceptNode(n)), i === NodeFilter.FILTER_ACCEPT)
          return n && (this.currentNode = n), n;
        let o = this.lastChild();
        return o && (this.currentNode = o), o;
      }
      return n && (this.currentNode = n), n;
    } else if (this._walkerStack.length > 1) {
      this._walkerStack.shift();
      let a = this.previousNode();
      return a && (this.currentNode = a), a;
    } else return null;
  }
  /**
   * @deprecated
   */
  nextSibling() {
    return null;
  }
  /**
   * @deprecated
   */
  previousSibling() {
    return null;
  }
  /**
   * @deprecated
   */
  parentNode() {
    return null;
  }
  constructor(t, n, r, a) {
    this._walkerStack = [], this._currentSetFor = /* @__PURE__ */ new Set(), this._acceptNode = (o) => {
      if (o.nodeType === Node.ELEMENT_NODE) {
        const l = o.shadowRoot;
        if (l) {
          const c = this._doc.createTreeWalker(l, this.whatToShow, {
            acceptNode: this._acceptNode
          });
          return this._walkerStack.unshift(c), NodeFilter.FILTER_ACCEPT;
        } else {
          var s;
          if (typeof this.filter == "function") return this.filter(o);
          if (!((s = this.filter) === null || s === void 0) && s.acceptNode) return this.filter.acceptNode(o);
          if (this.filter === null) return NodeFilter.FILTER_ACCEPT;
        }
      }
      return NodeFilter.FILTER_SKIP;
    }, this._doc = t, this.root = n, this.filter = a ?? null, this.whatToShow = r ?? NodeFilter.SHOW_ALL, this._currentNode = n, this._walkerStack.unshift(t.createTreeWalker(n, r, this._acceptNode));
    const i = n.shadowRoot;
    if (i) {
      const o = this._doc.createTreeWalker(i, this.whatToShow, {
        acceptNode: this._acceptNode
      });
      this._walkerStack.unshift(o);
    }
  }
}
function ND(e, t, n, r) {
  return Fi() ? new kD(e, t, n, r) : e.createTreeWalker(t, n, r);
}
function Kl(...e) {
  return e.length === 1 && e[0] ? e[0] : (t) => {
    let n = !1;
    const r = e.map((a) => {
      const i = Ed(a, t);
      return n || (n = typeof i == "function"), i;
    });
    if (n) return () => {
      r.forEach((a, i) => {
        typeof a == "function" ? a() : Ed(e[i], null);
      });
    };
  };
}
function Ed(e, t) {
  if (typeof e == "function") return e(t);
  e != null && (e.current = t);
}
function lt(...e) {
  let t = {
    ...e[0]
  };
  for (let n = 1; n < e.length; n++) {
    let r = e[n];
    for (let a in r) {
      let i = t[a], o = r[a];
      typeof i == "function" && typeof o == "function" && // This is a lot faster than a regex.
      a[0] === "o" && a[1] === "n" && a.charCodeAt(2) >= /* 'A' */
      65 && a.charCodeAt(2) <= /* 'Z' */
      90 ? t[a] = Dp(i, o) : (a === "className" || a === "UNSAFE_className") && typeof i == "string" && typeof o == "string" ? t[a] = rb(i, o) : a === "id" && i && o ? t.id = ED(i, o) : a === "ref" && i && o ? t.ref = Kl(i, o) : t[a] = o !== void 0 ? o : i;
    }
  }
  return t;
}
const AD = /* @__PURE__ */ new Set([
  "id"
]), jD = /* @__PURE__ */ new Set([
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
  "aria-details"
]), MD = /* @__PURE__ */ new Set([
  "href",
  "hrefLang",
  "target",
  "rel",
  "download",
  "ping",
  "referrerPolicy"
]), RD = /* @__PURE__ */ new Set([
  "dir",
  "lang",
  "hidden",
  "inert",
  "translate"
]), Sd = /* @__PURE__ */ new Set([
  "onClick",
  "onAuxClick",
  "onContextMenu",
  "onDoubleClick",
  "onMouseDown",
  "onMouseEnter",
  "onMouseLeave",
  "onMouseMove",
  "onMouseOut",
  "onMouseOver",
  "onMouseUp",
  "onTouchCancel",
  "onTouchEnd",
  "onTouchMove",
  "onTouchStart",
  "onPointerDown",
  "onPointerMove",
  "onPointerUp",
  "onPointerCancel",
  "onPointerEnter",
  "onPointerLeave",
  "onPointerOver",
  "onPointerOut",
  "onGotPointerCapture",
  "onLostPointerCapture",
  "onScroll",
  "onWheel",
  "onAnimationStart",
  "onAnimationEnd",
  "onAnimationIteration",
  "onTransitionCancel",
  "onTransitionEnd",
  "onTransitionRun",
  "onTransitionStart"
]), ID = /^(data-.*)$/;
function Oi(e, t = {}) {
  let { labelable: n, isLink: r, global: a, events: i = a, propNames: o } = t, s = {};
  for (const l in e) Object.prototype.hasOwnProperty.call(e, l) && (AD.has(l) || n && jD.has(l) || r && MD.has(l) || a && RD.has(l) || i && (Sd.has(l) || l.endsWith("Capture") && Sd.has(l.slice(0, -7))) || o?.has(l) || ID.test(l)) && (s[l] = e[l]);
  return s;
}
function Hn(e) {
  if (VD()) e.focus({
    preventScroll: !0
  });
  else {
    let t = BD(e);
    e.focus(), LD(t);
  }
}
let Ca = null;
function VD() {
  if (Ca == null) {
    Ca = !1;
    try {
      document.createElement("div").focus({
        get preventScroll() {
          return Ca = !0, !0;
        }
      });
    } catch {
    }
  }
  return Ca;
}
function BD(e) {
  let t = e.parentNode, n = [], r = document.scrollingElement || document.documentElement;
  for (; t instanceof HTMLElement && t !== r; )
    (t.offsetHeight < t.scrollHeight || t.offsetWidth < t.scrollWidth) && n.push({
      element: t,
      scrollTop: t.scrollTop,
      scrollLeft: t.scrollLeft
    }), t = t.parentNode;
  return r instanceof HTMLElement && n.push({
    element: r,
    scrollTop: r.scrollTop,
    scrollLeft: r.scrollLeft
  }), n;
}
function LD(e) {
  for (let { element: t, scrollTop: n, scrollLeft: r } of e)
    t.scrollTop = n, t.scrollLeft = r;
}
function zi(e) {
  var t;
  if (typeof window > "u" || window.navigator == null) return !1;
  let n = (t = window.navigator.userAgentData) === null || t === void 0 ? void 0 : t.brands;
  return Array.isArray(n) && n.some((r) => e.test(r.brand)) || e.test(window.navigator.userAgent);
}
function Wl(e) {
  var t;
  return typeof window < "u" && window.navigator != null ? e.test(((t = window.navigator.userAgentData) === null || t === void 0 ? void 0 : t.platform) || window.navigator.platform) : !1;
}
function kt(e) {
  if (process.env.NODE_ENV === "test") return e;
  let t = null;
  return () => (t == null && (t = e()), t);
}
const an = kt(function() {
  return Wl(/^Mac/i);
}), FD = kt(function() {
  return Wl(/^iPhone/i);
}), Cp = kt(function() {
  return Wl(/^iPad/i) || // iPadOS 13 lies and says it's a Mac, but we can distinguish by detecting touch support.
  an() && navigator.maxTouchPoints > 1;
}), na = kt(function() {
  return FD() || Cp();
});
kt(function() {
  return an() || na();
});
const OD = kt(function() {
  return zi(/AppleWebKit/i) && !Ep();
}), Ep = kt(function() {
  return zi(/Chrome/i);
}), Sp = kt(function() {
  return zi(/Android/i);
}), zD = kt(function() {
  return zi(/Firefox/i);
});
function on(e, t, n = !0) {
  var r, a;
  let { metaKey: i, ctrlKey: o, altKey: s, shiftKey: l } = t;
  zD() && (!((a = window.event) === null || a === void 0 || (r = a.type) === null || r === void 0) && r.startsWith("key")) && e.target === "_blank" && (an() ? i = !0 : o = !0);
  let c = OD() && an() && !Cp() && process.env.NODE_ENV !== "test" ? new KeyboardEvent("keydown", {
    keyIdentifier: "Enter",
    metaKey: i,
    ctrlKey: o,
    altKey: s,
    shiftKey: l
  }) : new MouseEvent("click", {
    metaKey: i,
    ctrlKey: o,
    altKey: s,
    shiftKey: l,
    detail: 1,
    bubbles: !0,
    cancelable: !0
  });
  on.isOpening = n, Hn(e), e.dispatchEvent(c), on.isOpening = !1;
}
on.isOpening = !1;
let Ot = /* @__PURE__ */ new Map(), xs = /* @__PURE__ */ new Set();
function Td() {
  if (typeof window > "u") return;
  function e(r) {
    return "propertyName" in r;
  }
  let t = (r) => {
    let a = q(r);
    if (!e(r) || !a) return;
    let i = Ot.get(a);
    i || (i = /* @__PURE__ */ new Set(), Ot.set(a, i), a.addEventListener("transitioncancel", n, {
      once: !0
    })), i.add(r.propertyName);
  }, n = (r) => {
    let a = q(r);
    if (!e(r) || !a) return;
    let i = Ot.get(a);
    if (i && (i.delete(r.propertyName), i.size === 0 && (a.removeEventListener("transitioncancel", n), Ot.delete(a)), Ot.size === 0)) {
      for (let o of xs) o();
      xs.clear();
    }
  };
  document.body.addEventListener("transitionrun", t), document.body.addEventListener("transitionend", n);
}
typeof document < "u" && (document.readyState !== "loading" ? Td() : document.addEventListener("DOMContentLoaded", Td));
function _D() {
  for (const [e] of Ot)
    "isConnected" in e && !e.isConnected && Ot.delete(e);
}
function Tp(e) {
  requestAnimationFrame(() => {
    _D(), Ot.size === 0 ? e() : xs.add(e);
  });
}
function _i() {
  let e = B(/* @__PURE__ */ new Map()), t = G((a, i, o, s) => {
    let l = s?.once ? (...c) => {
      e.current.delete(o), o(...c);
    } : o;
    e.current.set(o, {
      type: i,
      eventTarget: a,
      fn: l,
      options: s
    }), a.addEventListener(i, l, s);
  }, []), n = G((a, i, o, s) => {
    var l;
    let c = ((l = e.current.get(o)) === null || l === void 0 ? void 0 : l.fn) || o;
    a.removeEventListener(i, c, s), e.current.delete(o);
  }, []), r = G(() => {
    e.current.forEach((a, i) => {
      n(a.eventTarget, a.type, i, a.options);
    });
  }, [
    n
  ]);
  return U(() => r, [
    r
  ]), {
    addGlobalListener: t,
    removeGlobalListener: n,
    removeAllGlobalListeners: r
  };
}
function Pp(e, t) {
  let { id: n, "aria-label": r, "aria-labelledby": a } = e;
  return n = zr(n), a && r ? a = [
    .../* @__PURE__ */ new Set([
      n,
      ...a.trim().split(/\s+/)
    ])
  ].join(" ") : a && (a = a.trim().split(/\s+/).join(" ")), !r && !a && t && (r = t), {
    id: n,
    "aria-label": r,
    "aria-labelledby": a
  };
}
function kp(e) {
  const t = B(null), n = B(void 0), r = G((a) => {
    if (typeof e == "function") {
      const i = e, o = i(a);
      return () => {
        typeof o == "function" ? o() : i(null);
      };
    } else if (e)
      return e.current = a, () => {
        e.current = null;
      };
  }, [
    e
  ]);
  return F(() => ({
    get current() {
      return t.current;
    },
    set current(a) {
      t.current = a, n.current && (n.current(), n.current = void 0), a != null && (n.current = r(a));
    }
  }), [
    r
  ]);
}
var Co;
const UD = (Co = W.useInsertionEffect) !== null && Co !== void 0 ? Co : Ke;
function Ne(e) {
  const t = B(null);
  return UD(() => {
    t.current = e;
  }, [
    e
  ]), G((...n) => {
    const r = t.current;
    return r?.(...n);
  }, []);
}
function HD(e, t) {
  Ke(() => {
    if (e && e.ref && t)
      return e.ref.current = t.current, () => {
        e.ref && (e.ref.current = null);
      };
  });
}
function ws(e, t) {
  if (!e) return !1;
  let n = window.getComputedStyle(e), r = document.scrollingElement || document.documentElement, a = /(auto|scroll)/.test(n.overflow + n.overflowX + n.overflowY);
  return e === r && n.overflow !== "hidden" && (a = !0), a && t && (a = e.scrollHeight !== e.clientHeight || e.scrollWidth !== e.clientWidth), a;
}
function KD(e, t) {
  let n = e;
  for (ws(n, t) && (n = n.parentElement); n && !ws(n, t); ) n = n.parentElement;
  return n || document.scrollingElement || document.documentElement;
}
function Pd(e, t) {
  let n = [], r = document.scrollingElement || document.documentElement;
  do
    ws(e, t) && n.push(e), e = e.parentElement;
  while (e && e !== r);
  return n;
}
let WD = 0;
const Eo = /* @__PURE__ */ new Map();
function GD(e) {
  let [t, n] = _();
  return Ke(() => {
    if (!e) return;
    let r = Eo.get(e);
    if (r)
      n(r.element.id);
    else {
      let a = `react-aria-description-${WD++}`;
      n(a);
      let i = document.createElement("div");
      i.id = a, i.style.display = "none", i.textContent = e, document.body.appendChild(i), r = {
        refCount: 0,
        element: i
      }, Eo.set(e, r);
    }
    return r.refCount++, () => {
      r && --r.refCount === 0 && (r.element.remove(), Eo.delete(e));
    };
  }, [
    e
  ]), {
    "aria-describedby": e ? t : void 0
  };
}
function So(e, t, n, r) {
  let a = Ne(n), i = n == null;
  U(() => {
    if (i || !e.current) return;
    let o = e.current;
    return o.addEventListener(t, a, r), () => {
      o.removeEventListener(t, a, r);
    };
  }, [
    e,
    t,
    r,
    i
  ]);
}
function kd(e, t, n = {}) {
  let { block: r = "nearest", inline: a = "nearest" } = n;
  if (e === t) return;
  let i = e.scrollTop, o = e.scrollLeft, s = t.getBoundingClientRect(), l = e.getBoundingClientRect(), c = window.getComputedStyle(t), d = window.getComputedStyle(e), f = document.scrollingElement || document.documentElement, m = e === f ? 0 : l.top, h = e === f ? e.clientHeight : l.bottom, p = e === f ? 0 : l.left, g = e === f ? e.clientWidth : l.right, v = parseInt(c.scrollMarginTop, 10) || 0, b = parseInt(c.scrollMarginBottom, 10) || 0, x = parseInt(c.scrollMarginLeft, 10) || 0, C = parseInt(c.scrollMarginRight, 10) || 0, w = parseInt(d.scrollPaddingTop, 10) || 0, E = parseInt(d.scrollPaddingBottom, 10) || 0, k = parseInt(d.scrollPaddingLeft, 10) || 0, A = parseInt(d.scrollPaddingRight, 10) || 0, P = parseInt(d.borderTopWidth, 10) || 0, j = parseInt(d.borderBottomWidth, 10) || 0, T = parseInt(d.borderLeftWidth, 10) || 0, M = parseInt(d.borderRightWidth, 10) || 0, L = s.top - v, O = s.bottom + b, Z = s.left - x, Q = s.right + C, J = e === f ? 0 : T + M, Y = e === f ? 0 : P + j, K = e.offsetWidth - e.clientWidth - J, te = e.offsetHeight - e.clientHeight - Y, S = m + P + w, $ = h - j - E - te, D = p + T + k, N = g - M - A;
  d.direction === "rtl" && !na() ? D += K : N -= K;
  let I = L < S || O > $, H = Z < D || Q > N;
  if (I && r === "start") i += L - S;
  else if (I && r === "center") i += (L + O) / 2 - (S + $) / 2;
  else if (I && r === "end") i += O - $;
  else if (I && r === "nearest") {
    let ne = L - S, X = O - $;
    i += Math.abs(ne) <= Math.abs(X) ? ne : X;
  }
  if (H && a === "start") o += Z - D;
  else if (H && a === "center") o += (Z + Q) / 2 - (D + N) / 2;
  else if (H && a === "end") o += Q - N;
  else if (H && a === "nearest") {
    let ne = Z - D, X = Q - N;
    o += Math.abs(ne) <= Math.abs(X) ? ne : X;
  }
  if (process.env.NODE_ENV === "test") {
    e.scrollLeft = o, e.scrollTop = i;
    return;
  }
  e.scrollTo({
    left: o,
    top: i
  });
}
function YD(e, t = {}) {
  let { containingElement: n } = t;
  if (e && e.isConnected) {
    let o = document.scrollingElement || document.documentElement;
    if (!(window.getComputedStyle(o).overflow === "hidden") && !Ep()) {
      var r;
      let { left: l, top: c } = e.getBoundingClientRect();
      e == null || (r = e.scrollIntoView) === null || r === void 0 || r.call(e, {
        block: "nearest"
      });
      let { left: d, top: f } = e.getBoundingClientRect();
      if (Math.abs(l - d) > 1 || Math.abs(c - f) > 1) {
        var a, i;
        n == null || (a = n.scrollIntoView) === null || a === void 0 || a.call(n, {
          block: "center",
          inline: "center"
        }), (i = e.scrollIntoView) === null || i === void 0 || i.call(e, {
          block: "nearest"
        });
      }
    } else {
      let { left: l, top: c } = e.getBoundingClientRect(), d = Pd(e, !0);
      for (let h of d) kd(h, e);
      let { left: f, top: m } = e.getBoundingClientRect();
      if (Math.abs(l - f) > 1 || Math.abs(c - m) > 1) {
        d = n ? Pd(n, !0) : [];
        for (let h of d) kd(h, n, {
          block: "center",
          inline: "center"
        });
      }
    }
  }
}
function $s(e) {
  return e.pointerType === "" && e.isTrusted ? !0 : Sp() && e.pointerType ? e.type === "click" && e.buttons === 1 : e.detail === 0 && !e.pointerType;
}
function qD(e) {
  return !Sp() && e.width === 0 && e.height === 0 || e.width === 1 && e.height === 1 && e.pressure === 0 && e.detail === 0 && e.pointerType === "mouse";
}
function ZD(e, t) {
  let n = B(null);
  return e && n.current && t(e, n.current) && (e = n.current), n.current = e, e;
}
function XD(e, t, n) {
  let r = Ne(() => {
    n && n(t);
  });
  U(() => {
    var a;
    let i = e == null || (a = e.current) === null || a === void 0 ? void 0 : a.form;
    return i?.addEventListener("reset", r), () => {
      i?.removeEventListener("reset", r);
    };
  }, [
    e
  ]);
}
const JD = typeof Element < "u" && "checkVisibility" in Element.prototype;
function QD(e) {
  const t = Oe(e);
  if (!(e instanceof t.HTMLElement) && !(e instanceof t.SVGElement)) return !1;
  let { display: n, visibility: r } = e.style, a = n !== "none" && r !== "hidden" && r !== "collapse";
  if (a) {
    const { getComputedStyle: i } = e.ownerDocument.defaultView;
    let { display: o, visibility: s } = i(e);
    a = o !== "none" && s !== "hidden" && s !== "collapse";
  }
  return a;
}
function e2(e, t) {
  return !e.hasAttribute("hidden") && // Ignore HiddenSelect when tree walking.
  !e.hasAttribute("data-react-aria-prevent-focus") && (e.nodeName === "DETAILS" && t && t.nodeName !== "SUMMARY" ? e.hasAttribute("open") : !0);
}
function Gl(e, t) {
  return JD ? e.checkVisibility({
    visibilityProperty: !0
  }) && !e.closest("[data-react-aria-prevent-focus]") : e.nodeName !== "#comment" && QD(e) && e2(e, t) && (!e.parentElement || Gl(e.parentElement, e));
}
const Yl = [
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "a[href]",
  "area[href]",
  "summary",
  "iframe",
  "object",
  "embed",
  "audio[controls]",
  "video[controls]",
  '[contenteditable]:not([contenteditable^="false"])',
  "permission"
], t2 = Yl.join(":not([hidden]),") + ",[tabindex]:not([disabled]):not([hidden])";
Yl.push('[tabindex]:not([tabindex="-1"]):not([disabled])');
const n2 = Yl.join(':not([hidden]):not([tabindex="-1"]),');
function Np(e) {
  return e.matches(t2) && Gl(e) && !Ap(e);
}
function r2(e) {
  return e.matches(n2) && Gl(e) && !Ap(e);
}
function Ap(e) {
  let t = e;
  for (; t != null; ) {
    if (t instanceof t.ownerDocument.defaultView.HTMLElement && t.inert) return !0;
    t = t.parentElement;
  }
  return !1;
}
var To;
const a2 = typeof document < "u" ? (To = W.useInsertionEffect) !== null && To !== void 0 ? To : W.useLayoutEffect : () => {
};
function jp(e, t, n) {
  let [r, a] = _(e || t), i = B(r), o = B(e !== void 0), s = e !== void 0;
  U(() => {
    let f = o.current;
    f !== s && process.env.NODE_ENV !== "production" && console.warn(`WARN: A component changed from ${f ? "controlled" : "uncontrolled"} to ${s ? "controlled" : "uncontrolled"}.`), o.current = s;
  }, [
    s
  ]);
  let l = s ? e : r;
  a2(() => {
    i.current = l;
  });
  let [, c] = Df(() => ({}), {}), d = G((f, ...m) => {
    let h = typeof f == "function" ? f(i.current) : f;
    Object.is(i.current, h) || (i.current = h, a(h), c(), n?.(h, ...m));
  }, [
    n
  ]);
  return [
    l,
    d
  ];
}
const i2 = Symbol("default");
function ql({ values: e, children: t }) {
  for (let [n, r] of e)
    t = /* @__PURE__ */ W.createElement(n.Provider, {
      value: r
    }, t);
  return t;
}
function ra(e) {
  let { className: t, style: n, children: r, defaultClassName: a, defaultChildren: i, defaultStyle: o, values: s, render: l } = e;
  return F(() => {
    let c, d, f;
    return typeof t == "function" ? c = t({
      ...s,
      defaultClassName: a
    }) : c = t, typeof n == "function" ? d = n({
      ...s,
      defaultStyle: o || {}
    }) : d = n, typeof r == "function" ? f = r({
      ...s,
      defaultChildren: i
    }) : r == null ? f = i : f = r, {
      className: c ?? a,
      style: d || o ? {
        ...o,
        ...d
      } : void 0,
      children: f ?? i,
      "data-rac": "",
      render: l ? (m) => l(m, s) : void 0
    };
  }, [
    t,
    n,
    r,
    a,
    i,
    o,
    s,
    l
  ]);
}
function Ui(e, t) {
  return (n) => t(typeof e == "function" ? e(n) : e, n);
}
function Zl(e, t) {
  let n = ee(e);
  if (t === null)
    return null;
  if (n && typeof n == "object" && "slots" in n && n.slots) {
    let r = t || i2;
    if (!n.slots[r]) {
      let a = new Intl.ListFormat().format(Object.keys(n.slots).map((o) => `"${o}"`)), i = t ? `Invalid slot "${t}".` : "A slot prop is required.";
      throw new Error(`${i} Valid slot names are ${a}.`);
    }
    return n.slots[r];
  }
  return n;
}
function aa(e, t, n) {
  let r = Zl(n, e.slot) || {}, { ref: a, ...i } = r, o = kp(F(() => Kl(t, a), [
    t,
    a
  ])), s = lt(i, e);
  return "style" in i && i.style && "style" in e && e.style && (typeof i.style == "function" || typeof e.style == "function" ? s.style = (l) => {
    let c = typeof i.style == "function" ? i.style(l) : i.style, d = {
      ...l.defaultStyle,
      ...c
    }, f = typeof e.style == "function" ? e.style({
      ...l,
      defaultStyle: d
    }) : e.style;
    return {
      ...d,
      ...f
    };
  } : s.style = {
    ...i.style,
    ...e.style
  }), [
    s,
    o
  ];
}
function Mp(e = !0) {
  let [t, n] = _(e), r = B(!1), a = G((i) => {
    r.current = !0, n(!!i);
  }, []);
  return Ke(() => {
    r.current || n(!1);
  }, []), [
    a,
    t
  ];
}
function Ds(e) {
  const t = /^(data-.*)$/;
  let n = {};
  for (const r in e) t.test(r) || (n[r] = e[r]);
  return n;
}
function o2(e, t, n) {
  let { render: r, ...a } = t, i = B(null), o = F(() => Kl(n, i), [
    n,
    i
  ]);
  Ke(() => {
    process.env.NODE_ENV !== "production" && r && (i.current ? i.current.localName !== e && console.warn(`Unexpected DOM element returned by custom \`render\` function. Expected <${e}>, got <${i.current.localName}>. This may break the component behavior and accessibility.`) : console.warn("Ref was not connected to DOM element returned by custom `render` function. Did you forget to pass through or merge the `ref`?"));
  }, [
    e,
    r
  ]);
  let s = {
    ...a,
    ref: o
  };
  return r ? r(s, void 0) : /* @__PURE__ */ W.createElement(e, s);
}
const Nd = {}, ia = new Proxy({}, {
  get(e, t) {
    if (typeof t != "string") return;
    let n = Nd[t];
    return n || (n = /* @__PURE__ */ ut(o2.bind(null, t)), Nd[t] = n), n;
  }
}), Rp = 7e3;
let Ge = null;
function s2(e, t = "assertive", n = Rp) {
  Ge ? Ge.announce(e, t, n) : (Ge = new u2(), (typeof IS_REACT_ACT_ENVIRONMENT == "boolean" ? IS_REACT_ACT_ENVIRONMENT : typeof jest < "u") ? Ge.announce(e, t, n) : setTimeout(() => {
    Ge?.isAttached() && Ge?.announce(e, t, n);
  }, 100));
}
function l2(e) {
  Ge && Ge.clear(e);
}
class u2 {
  isAttached() {
    var t;
    return (t = this.node) === null || t === void 0 ? void 0 : t.isConnected;
  }
  createLog(t) {
    let n = document.createElement("div");
    return n.setAttribute("role", "log"), n.setAttribute("aria-live", t), n.setAttribute("aria-relevant", "additions"), n;
  }
  destroy() {
    this.node && (document.body.removeChild(this.node), this.node = null);
  }
  announce(t, n = "assertive", r = Rp) {
    var a, i;
    if (!this.node) return;
    let o = document.createElement("div");
    typeof t == "object" ? (o.setAttribute("role", "img"), o.setAttribute("aria-labelledby", t["aria-labelledby"])) : o.textContent = t, n === "assertive" ? (a = this.assertiveLog) === null || a === void 0 || a.appendChild(o) : (i = this.politeLog) === null || i === void 0 || i.appendChild(o), t !== "" && setTimeout(() => {
      o.remove();
    }, r);
  }
  clear(t) {
    this.node && ((!t || t === "assertive") && this.assertiveLog && (this.assertiveLog.innerHTML = ""), (!t || t === "polite") && this.politeLog && (this.politeLog.innerHTML = ""));
  }
  constructor() {
    this.node = null, this.assertiveLog = null, this.politeLog = null, typeof document < "u" && (this.node = document.createElement("div"), this.node.dataset.liveAnnouncer = "true", Object.assign(this.node.style, {
      border: 0,
      clip: "rect(0 0 0 0)",
      clipPath: "inset(50%)",
      height: "1px",
      margin: "-1px",
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      width: "1px",
      whiteSpace: "nowrap"
    }), this.assertiveLog = this.createLog("assertive"), this.node.appendChild(this.assertiveLog), this.politeLog = this.createLog("polite"), this.node.appendChild(this.politeLog), document.body.prepend(this.node));
  }
}
const c2 = /* @__PURE__ */ new Set([
  "Arab",
  "Syrc",
  "Samr",
  "Mand",
  "Thaa",
  "Mend",
  "Nkoo",
  "Adlm",
  "Rohg",
  "Hebr"
]), d2 = /* @__PURE__ */ new Set([
  "ae",
  "ar",
  "arc",
  "bcc",
  "bqi",
  "ckb",
  "dv",
  "fa",
  "glk",
  "he",
  "ku",
  "mzn",
  "nqo",
  "pnb",
  "ps",
  "sd",
  "ug",
  "ur",
  "yi"
]);
function f2(e) {
  if (Intl.Locale) {
    let n = new Intl.Locale(e).maximize(), r = typeof n.getTextInfo == "function" ? n.getTextInfo() : n.textInfo;
    if (r) return r.direction === "rtl";
    if (n.script) return c2.has(n.script);
  }
  let t = e.split("-")[0];
  return d2.has(t);
}
const Ip = Symbol.for("react-aria.i18n.locale");
function Vp() {
  let e = typeof window < "u" && window[Ip] || typeof navigator < "u" && (navigator.language || navigator.userLanguage) || "en-US";
  try {
    Intl.DateTimeFormat.supportedLocalesOf([
      e
    ]);
  } catch {
    e = "en-US";
  }
  return {
    locale: e,
    direction: f2(e) ? "rtl" : "ltr"
  };
}
let Cs = Vp(), pr = /* @__PURE__ */ new Set();
function Ad() {
  Cs = Vp();
  for (let e of pr) e(Cs);
}
function m2() {
  let e = $p(), [t, n] = _(Cs);
  return U(() => (pr.size === 0 && window.addEventListener("languagechange", Ad), pr.add(n), () => {
    pr.delete(n), pr.size === 0 && window.removeEventListener("languagechange", Ad);
  }), []), e ? {
    locale: typeof window < "u" && window[Ip] || "en-US",
    direction: "ltr"
  } : t;
}
const h2 = /* @__PURE__ */ W.createContext(null);
function Nt() {
  let e = m2();
  return ee(h2) || e;
}
const p2 = Symbol.for("react-aria.i18n.locale"), g2 = Symbol.for("react-aria.i18n.strings");
let xn;
class fn {
  /** Returns a localized string for the given key and locale. */
  getStringForLocale(t, n) {
    let a = this.getStringsForLocale(n)[t];
    if (!a) throw new Error(`Could not find intl message ${t} in ${n} locale`);
    return a;
  }
  /** Returns all localized strings for the given locale. */
  getStringsForLocale(t) {
    let n = this.strings[t];
    return n || (n = v2(t, this.strings, this.defaultLocale), this.strings[t] = n), n;
  }
  static getGlobalDictionaryForPackage(t) {
    if (typeof window > "u") return null;
    let n = window[p2];
    if (xn === void 0) {
      let a = window[g2];
      if (!a) return null;
      xn = {};
      for (let i in a) xn[i] = new fn({
        [n]: a[i]
      }, n);
    }
    let r = xn?.[t];
    if (!r) throw new Error(`Strings for package "${t}" were not included by LocalizedStringProvider. Please add it to the list passed to createLocalizedStringDictionary.`);
    return r;
  }
  constructor(t, n = "en-US") {
    this.strings = Object.fromEntries(Object.entries(t).filter(([, r]) => r)), this.defaultLocale = n;
  }
}
function v2(e, t, n = "en-US") {
  if (t[e]) return t[e];
  let r = b2(e);
  if (t[r]) return t[r];
  for (let a in t)
    if (a.startsWith(r + "-")) return t[a];
  return t[n];
}
function b2(e) {
  return Intl.Locale ? new Intl.Locale(e).language : e.split("-")[0];
}
const jd = /* @__PURE__ */ new Map(), Md = /* @__PURE__ */ new Map();
class Bp {
  /** Formats a localized string for the given key with the provided variables. */
  format(t, n) {
    let r = this.strings.getStringForLocale(t, this.locale);
    return typeof r == "function" ? r(n, this) : r;
  }
  plural(t, n, r = "cardinal") {
    let a = n["=" + t];
    if (a) return typeof a == "function" ? a() : a;
    let i = this.locale + ":" + r, o = jd.get(i);
    o || (o = new Intl.PluralRules(this.locale, {
      type: r
    }), jd.set(i, o));
    let s = o.select(t);
    return a = n[s] || n.other, typeof a == "function" ? a() : a;
  }
  number(t) {
    let n = Md.get(this.locale);
    return n || (n = new Intl.NumberFormat(this.locale), Md.set(this.locale, n)), n.format(t);
  }
  select(t, n) {
    let r = t[n] || t.other;
    return typeof r == "function" ? r() : r;
  }
  constructor(t, n) {
    this.locale = t, this.strings = n;
  }
}
const Rd = /* @__PURE__ */ new WeakMap();
function y2(e) {
  let t = Rd.get(e);
  return t || (t = new fn(e), Rd.set(e, t)), t;
}
function Lp(e, t) {
  return t && fn.getGlobalDictionaryForPackage(t) || y2(e);
}
function Fp(e, t) {
  let { locale: n } = Nt(), r = Lp(e, t);
  return F(() => new Bp(n, r), [
    n,
    r
  ]);
}
function In(e, t) {
  return e - t * Math.floor(e / t);
}
const Op = 1721426;
function en(e, t, n, r) {
  t = oa(e, t);
  let a = t - 1, i = -2;
  return n <= 2 ? i = 0 : _t(t) && (i = -1), Op - 1 + 365 * a + Math.floor(a / 4) - Math.floor(a / 100) + Math.floor(a / 400) + Math.floor((367 * n - 362) / 12 + i + r);
}
function _t(e) {
  return e % 4 === 0 && (e % 100 !== 0 || e % 400 === 0);
}
function oa(e, t) {
  return e === "BC" ? 1 - t : t;
}
function Hi(e) {
  let t = "AD";
  return e <= 0 && (t = "BC", e = 1 - e), [
    t,
    e
  ];
}
const x2 = {
  standard: [
    31,
    28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
  ],
  leapyear: [
    31,
    29,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
  ]
};
class Le {
  fromJulianDay(t) {
    let n = t, r = n - Op, a = Math.floor(r / 146097), i = In(r, 146097), o = Math.floor(i / 36524), s = In(i, 36524), l = Math.floor(s / 1461), c = In(s, 1461), d = Math.floor(c / 365), f = a * 400 + o * 100 + l * 4 + d + (o !== 4 && d !== 4 ? 1 : 0), [m, h] = Hi(f), p = n - en(m, h, 1, 1), g = 2;
    n < en(m, h, 3, 1) ? g = 0 : _t(h) && (g = 1);
    let v = Math.floor(((p + g) * 12 + 373) / 367), b = n - en(m, h, v, 1) + 1;
    return new pe(m, h, v, b);
  }
  toJulianDay(t) {
    return en(t.era, t.year, t.month, t.day);
  }
  getDaysInMonth(t) {
    return x2[_t(t.year) ? "leapyear" : "standard"][t.month - 1];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getMonthsInYear(t) {
    return 12;
  }
  getDaysInYear(t) {
    return _t(t.year) ? 366 : 365;
  }
  getMaximumMonthsInYear() {
    return 12;
  }
  getMaximumDaysInMonth() {
    return 31;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getYearsInEra(t) {
    return 9999;
  }
  getEras() {
    return [
      "BC",
      "AD"
    ];
  }
  isInverseEra(t) {
    return t.era === "BC";
  }
  balanceDate(t) {
    t.year <= 0 && (t.era = t.era === "BC" ? "AD" : "BC", t.year = 1 - t.year);
  }
  constructor() {
    this.identifier = "gregory";
  }
}
function zp(e, t) {
  var n, r, a, i;
  return (i = (a = (n = e.isEqual) === null || n === void 0 ? void 0 : n.call(e, t)) !== null && a !== void 0 ? a : (r = t.isEqual) === null || r === void 0 ? void 0 : r.call(t, e)) !== null && i !== void 0 ? i : e.identifier === t.identifier;
}
function _p(e) {
  return Dt(Date.now(), e);
}
function w2(e) {
  return Xl(_p(e));
}
function Up(e, t) {
  return e.calendar.toJulianDay(e) - t.calendar.toJulianDay(t);
}
function Hp(e, t) {
  return Id(e) - Id(t);
}
function Id(e) {
  return e.hour * 36e5 + e.minute * 6e4 + e.second * 1e3 + e.millisecond;
}
let Po = null, $2 = !1;
function sa() {
  return Po == null && (Po = new Intl.DateTimeFormat().resolvedOptions().timeZone), Po;
}
function Kp() {
  return $2;
}
function Kn(e) {
  e = Ae(e, new Le());
  let t = oa(e.era, e.year);
  return Wp(t, e.month, e.day, e.hour, e.minute, e.second, e.millisecond);
}
function Wp(e, t, n, r, a, i, o) {
  let s = /* @__PURE__ */ new Date();
  return s.setUTCHours(r, a, i, o), s.setUTCFullYear(e, t - 1, n), s.getTime();
}
function Es(e, t) {
  if (t === "UTC") return 0;
  if (e > 0 && t === sa() && !Kp()) return new Date(e).getTimezoneOffset() * -6e4;
  let { year: n, month: r, day: a, hour: i, minute: o, second: s } = Gp(e, t);
  return Wp(n, r, a, i, o, s, 0) - Math.floor(e / 1e3) * 1e3;
}
const Vd = /* @__PURE__ */ new Map();
function Gp(e, t) {
  let n = Vd.get(t);
  n || (n = new Intl.DateTimeFormat("en-US", {
    timeZone: t,
    hour12: !1,
    era: "short",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric"
  }), Vd.set(t, n));
  let r = n.formatToParts(new Date(e)), a = {};
  for (let i of r) i.type !== "literal" && (a[i.type] = i.value);
  return {
    // Firefox returns B instead of BC... https://bugzilla.mozilla.org/show_bug.cgi?id=1752253
    year: a.era === "BC" || a.era === "B" ? -a.year + 1 : +a.year,
    month: +a.month,
    day: +a.day,
    hour: a.hour === "24" ? 0 : +a.hour,
    minute: +a.minute,
    second: +a.second
  };
}
const Bd = 864e5;
function D2(e, t, n, r) {
  return (n === r ? [
    n
  ] : [
    n,
    r
  ]).filter((i) => C2(e, t, i));
}
function C2(e, t, n) {
  let r = Gp(n, t);
  return e.year === r.year && e.month === r.month && e.day === r.day && e.hour === r.hour && e.minute === r.minute && e.second === r.second;
}
function $t(e, t, n = "compatible") {
  let r = St(e);
  if (t === "UTC") return Kn(r);
  if (t === sa() && n === "compatible" && !Kp()) {
    r = Ae(r, new Le());
    let l = /* @__PURE__ */ new Date(), c = oa(r.era, r.year);
    return l.setFullYear(c, r.month - 1, r.day), l.setHours(r.hour, r.minute, r.second, r.millisecond), l.getTime();
  }
  let a = Kn(r), i = Es(a - Bd, t), o = Es(a + Bd, t), s = D2(r, t, a - i, a - o);
  if (s.length === 1) return s[0];
  if (s.length > 1) switch (n) {
    // 'compatible' means 'earlier' for "fall back" transitions
    case "compatible":
    case "earlier":
      return s[0];
    case "later":
      return s[s.length - 1];
    case "reject":
      throw new RangeError("Multiple possible absolute times found");
  }
  switch (n) {
    case "earlier":
      return Math.min(a - i, a - o);
    // 'compatible' means 'later' for "spring forward" transitions
    case "compatible":
    case "later":
      return Math.max(a - i, a - o);
    case "reject":
      throw new RangeError("No such absolute time found");
  }
}
function Yp(e, t, n = "compatible") {
  return new Date($t(e, t, n));
}
function Dt(e, t) {
  let n = Es(e, t), r = new Date(e + n), a = r.getUTCFullYear(), i = r.getUTCMonth() + 1, o = r.getUTCDate(), s = r.getUTCHours(), l = r.getUTCMinutes(), c = r.getUTCSeconds(), d = r.getUTCMilliseconds();
  return new Hr(a < 1 ? "BC" : "AD", a < 1 ? -a + 1 : a, i, o, t, n, s, l, c, d);
}
function Xl(e) {
  return new pe(e.calendar, e.era, e.year, e.month, e.day);
}
function St(e, t) {
  let n = 0, r = 0, a = 0, i = 0;
  if ("timeZone" in e) ({ hour: n, minute: r, second: a, millisecond: i } = e);
  else if ("hour" in e && !t) return e;
  return t && ({ hour: n, minute: r, second: a, millisecond: i } = t), new Ur(e.calendar, e.era, e.year, e.month, e.day, n, r, a, i);
}
function Ld(e) {
  return new Wi(e.hour, e.minute, e.second, e.millisecond);
}
function Ae(e, t) {
  if (zp(e.calendar, t)) return e;
  let n = t.fromJulianDay(e.calendar.toJulianDay(e)), r = e.copy();
  return r.calendar = t, r.era = n.era, r.year = n.year, r.month = n.month, r.day = n.day, sn(r), r;
}
function qp(e, t, n) {
  if (e instanceof Hr)
    return e.timeZone === t ? e : Zp(e, t);
  let r = $t(e, t, n);
  return Dt(r, t);
}
function E2(e) {
  let t = Kn(e) - e.offset;
  return new Date(t);
}
function Zp(e, t) {
  let n = Kn(e) - e.offset;
  return Ae(Dt(n, t), e.calendar);
}
function S2(e) {
  return Zp(e, sa());
}
const cr = 36e5;
function Ki(e, t) {
  let n = e.copy(), r = "hour" in n ? eg(n, t) : 0;
  Ss(n, t.years || 0), n.calendar.balanceYearMonth && n.calendar.balanceYearMonth(n, e), n.month += t.months || 0, Ts(n), Xp(n), n.day += (t.weeks || 0) * 7, n.day += t.days || 0, n.day += r, T2(n), n.calendar.balanceDate && n.calendar.balanceDate(n), n.year < 1 && (n.year = 1, n.month = 1, n.day = 1);
  let a = n.calendar.getYearsInEra(n);
  if (n.year > a) {
    var i, o;
    let l = (i = (o = n.calendar).isInverseEra) === null || i === void 0 ? void 0 : i.call(o, n);
    n.year = a, n.month = l ? 1 : n.calendar.getMonthsInYear(n), n.day = l ? 1 : n.calendar.getDaysInMonth(n);
  }
  n.month < 1 && (n.month = 1, n.day = 1);
  let s = n.calendar.getMonthsInYear(n);
  return n.month > s && (n.month = s, n.day = n.calendar.getDaysInMonth(n)), n.day = Math.max(1, Math.min(n.calendar.getDaysInMonth(n), n.day)), n;
}
function Ss(e, t) {
  var n, r;
  !((n = (r = e.calendar).isInverseEra) === null || n === void 0) && n.call(r, e) && (t = -t), e.year += t;
}
function Ts(e) {
  for (; e.month < 1; )
    Ss(e, -1), e.month += e.calendar.getMonthsInYear(e);
  let t = 0;
  for (; e.month > (t = e.calendar.getMonthsInYear(e)); )
    e.month -= t, Ss(e, 1);
}
function T2(e) {
  for (; e.day < 1; )
    e.month--, Ts(e), e.day += e.calendar.getDaysInMonth(e);
  for (; e.day > e.calendar.getDaysInMonth(e); )
    e.day -= e.calendar.getDaysInMonth(e), e.month++, Ts(e);
}
function Xp(e) {
  e.month = Math.max(1, Math.min(e.calendar.getMonthsInYear(e), e.month)), e.day = Math.max(1, Math.min(e.calendar.getDaysInMonth(e), e.day));
}
function sn(e) {
  e.calendar.constrainDate && e.calendar.constrainDate(e), e.year = Math.max(1, Math.min(e.calendar.getYearsInEra(e), e.year)), Xp(e);
}
function Jl(e) {
  let t = {};
  for (let n in e) typeof e[n] == "number" && (t[n] = -e[n]);
  return t;
}
function Jp(e, t) {
  return Ki(e, Jl(t));
}
function Ql(e, t) {
  let n = e.copy();
  return t.era != null && (n.era = t.era), t.year != null && (n.year = t.year), t.month != null && (n.month = t.month), t.day != null && (n.day = t.day), sn(n), n;
}
function _r(e, t) {
  let n = e.copy();
  return t.hour != null && (n.hour = t.hour), t.minute != null && (n.minute = t.minute), t.second != null && (n.second = t.second), t.millisecond != null && (n.millisecond = t.millisecond), Qp(n), n;
}
function P2(e) {
  e.second += Math.floor(e.millisecond / 1e3), e.millisecond = Ea(e.millisecond, 1e3), e.minute += Math.floor(e.second / 60), e.second = Ea(e.second, 60), e.hour += Math.floor(e.minute / 60), e.minute = Ea(e.minute, 60);
  let t = Math.floor(e.hour / 24);
  return e.hour = Ea(e.hour, 24), t;
}
function Qp(e) {
  e.millisecond = Math.max(0, Math.min(e.millisecond, 1e3)), e.second = Math.max(0, Math.min(e.second, 59)), e.minute = Math.max(0, Math.min(e.minute, 59)), e.hour = Math.max(0, Math.min(e.hour, 23));
}
function Ea(e, t) {
  let n = e % t;
  return n < 0 && (n += t), n;
}
function eg(e, t) {
  return e.hour += t.hours || 0, e.minute += t.minutes || 0, e.second += t.seconds || 0, e.millisecond += t.milliseconds || 0, P2(e);
}
function tg(e, t) {
  let n = e.copy();
  return eg(n, t), n;
}
function k2(e, t) {
  return tg(e, Jl(t));
}
function eu(e, t, n, r) {
  let a = e.copy();
  switch (t) {
    case "era": {
      let s = e.calendar.getEras(), l = s.indexOf(e.era);
      if (l < 0) throw new Error("Invalid era: " + e.era);
      l = Ct(l, n, 0, s.length - 1, r?.round), a.era = s[l], sn(a);
      break;
    }
    case "year":
      var i, o;
      !((i = (o = a.calendar).isInverseEra) === null || i === void 0) && i.call(o, a) && (n = -n), a.year = Ct(e.year, n, -1 / 0, 9999, r?.round), a.year === -1 / 0 && (a.year = 1), a.calendar.balanceYearMonth && a.calendar.balanceYearMonth(a, e);
      break;
    case "month":
      a.month = Ct(e.month, n, 1, e.calendar.getMonthsInYear(e), r?.round);
      break;
    case "day":
      a.day = Ct(e.day, n, 1, e.calendar.getDaysInMonth(e), r?.round);
      break;
    default:
      throw new Error("Unsupported field " + t);
  }
  return e.calendar.balanceDate && e.calendar.balanceDate(a), sn(a), a;
}
function tu(e, t, n, r) {
  let a = e.copy();
  switch (t) {
    case "hour": {
      let i = e.hour, o = 0, s = 23;
      if (r?.hourCycle === 12) {
        let l = i >= 12;
        o = l ? 12 : 0, s = l ? 23 : 11;
      }
      a.hour = Ct(i, n, o, s, r?.round);
      break;
    }
    case "minute":
      a.minute = Ct(e.minute, n, 0, 59, r?.round);
      break;
    case "second":
      a.second = Ct(e.second, n, 0, 59, r?.round);
      break;
    case "millisecond":
      a.millisecond = Ct(e.millisecond, n, 0, 999, r?.round);
      break;
    default:
      throw new Error("Unsupported field " + t);
  }
  return a;
}
function Ct(e, t, n, r, a = !1) {
  if (a) {
    e += Math.sign(t), e < n && (e = r);
    let i = Math.abs(t);
    t > 0 ? e = Math.ceil(e / i) * i : e = Math.floor(e / i) * i, e > r && (e = n);
  } else
    e += t, e < n ? e = r - (n - e - 1) : e > r && (e = n + (e - r - 1));
  return e;
}
function ng(e, t) {
  let n;
  if (t.years != null && t.years !== 0 || t.months != null && t.months !== 0 || t.weeks != null && t.weeks !== 0 || t.days != null && t.days !== 0) {
    let a = Ki(St(e), {
      years: t.years,
      months: t.months,
      weeks: t.weeks,
      days: t.days
    });
    n = $t(a, e.timeZone);
  } else
    n = Kn(e) - e.offset;
  n += t.milliseconds || 0, n += (t.seconds || 0) * 1e3, n += (t.minutes || 0) * 6e4, n += (t.hours || 0) * 36e5;
  let r = Dt(n, e.timeZone);
  return Ae(r, e.calendar);
}
function N2(e, t) {
  return ng(e, Jl(t));
}
function A2(e, t, n, r) {
  switch (t) {
    case "hour": {
      let a = 0, i = 23;
      if (r?.hourCycle === 12) {
        let p = e.hour >= 12;
        a = p ? 12 : 0, i = p ? 23 : 11;
      }
      let o = St(e), s = Ae(_r(o, {
        hour: a
      }), new Le()), l = [
        $t(s, e.timeZone, "earlier"),
        $t(s, e.timeZone, "later")
      ].filter((p) => Dt(p, e.timeZone).day === s.day)[0], c = Ae(_r(o, {
        hour: i
      }), new Le()), d = [
        $t(c, e.timeZone, "earlier"),
        $t(c, e.timeZone, "later")
      ].filter((p) => Dt(p, e.timeZone).day === c.day).pop(), f = Kn(e) - e.offset, m = Math.floor(f / cr), h = f % cr;
      return f = Ct(m, n, Math.floor(l / cr), Math.floor(d / cr), r?.round) * cr + h, Ae(Dt(f, e.timeZone), e.calendar);
    }
    case "minute":
    case "second":
    case "millisecond":
      return tu(e, t, n, r);
    case "era":
    case "year":
    case "month":
    case "day": {
      let a = eu(St(e), t, n, r), i = $t(a, e.timeZone);
      return Ae(Dt(i, e.timeZone), e.calendar);
    }
    default:
      throw new Error("Unsupported field " + t);
  }
}
function j2(e, t, n) {
  let r = St(e), a = _r(Ql(r, t), t);
  if (a.compare(r) === 0) return e;
  let i = $t(a, e.timeZone, n);
  return Ae(Dt(i, e.timeZone), e.calendar);
}
const M2 = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})$/, R2 = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})(?:T(\d{2}))?(?::(\d{2}))?(?::(\d{2}))?(\.\d+)?$/, rg = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})(?:T(\d{2}))?(?::(\d{2}))?(?::(\d{2}))?(\.\d+)?(?:(?:([+-]\d{2})(?::?(\d{2}))?)|Z)$/;
function I2(e) {
  let t = e.match(M2);
  if (!t)
    throw rg.test(e) ? new Error(`Invalid ISO 8601 date string: ${e}. Use parseAbsolute() instead.`) : new Error("Invalid ISO 8601 date string: " + e);
  let n = new pe(pt(t[1], 0, 9999), pt(t[2], 1, 12), 1);
  return n.day = pt(t[3], 1, n.calendar.getDaysInMonth(n)), n;
}
function V2(e) {
  let t = e.match(R2);
  if (!t)
    throw rg.test(e) ? new Error(`Invalid ISO 8601 date time string: ${e}. Use parseAbsolute() instead.`) : new Error("Invalid ISO 8601 date time string: " + e);
  let n = pt(t[1], -9999, 9999), r = n < 1 ? "BC" : "AD", a = new Ur(r, n < 1 ? -n + 1 : n, pt(t[2], 1, 12), 1, t[4] ? pt(t[4], 0, 23) : 0, t[5] ? pt(t[5], 0, 59) : 0, t[6] ? pt(t[6], 0, 59) : 0, t[7] ? pt(t[7], 0, 1 / 0) * 1e3 : 0);
  return a.day = pt(t[3], 0, a.calendar.getDaysInMonth(a)), a;
}
function pt(e, t, n) {
  let r = Number(e);
  if (r < t || r > n) throw new RangeError(`Value out of range: ${t} <= ${r} <= ${n}`);
  return r;
}
function ag(e) {
  return `${String(e.hour).padStart(2, "0")}:${String(e.minute).padStart(2, "0")}:${String(e.second).padStart(2, "0")}${e.millisecond ? String(e.millisecond / 1e3).slice(1) : ""}`;
}
function ig(e) {
  let t = Ae(e, new Le()), n;
  return t.era === "BC" ? n = t.year === 1 ? "0000" : "-" + String(Math.abs(1 - t.year)).padStart(6, "00") : n = String(t.year).padStart(4, "0"), `${n}-${String(t.month).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`;
}
function og(e) {
  return `${ig(e)}T${ag(e)}`;
}
function B2(e) {
  let t = Math.sign(e) < 0 ? "-" : "+";
  e = Math.abs(e);
  let n = Math.floor(e / 36e5), r = Math.floor(e % 36e5 / 6e4), a = Math.floor(e % 36e5 % 6e4 / 1e3), i = `${t}${String(n).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  return a !== 0 && (i += `:${String(a).padStart(2, "0")}`), i;
}
function L2(e) {
  return `${og(e)}${B2(e.offset)}[${e.timeZone}]`;
}
function F2(e, t) {
  if (t.has(e))
    throw new TypeError("Cannot initialize the same private elements twice on an object");
}
function la(e, t, n) {
  F2(e, t), t.set(e, n);
}
function nu(e) {
  let t = typeof e[0] == "object" ? e.shift() : new Le(), n;
  if (typeof e[0] == "string") n = e.shift();
  else {
    let o = t.getEras();
    n = o[o.length - 1];
  }
  let r = e.shift(), a = e.shift(), i = e.shift();
  return [
    t,
    n,
    r,
    a,
    i
  ];
}
var O2 = /* @__PURE__ */ new WeakMap();
class pe {
  /** Returns a copy of this date. */
  copy() {
    return this.era ? new pe(this.calendar, this.era, this.year, this.month, this.day) : new pe(this.calendar, this.year, this.month, this.day);
  }
  /** Returns a new `CalendarDate` with the given duration added to it. */
  add(t) {
    return Ki(this, t);
  }
  /** Returns a new `CalendarDate` with the given duration subtracted from it. */
  subtract(t) {
    return Jp(this, t);
  }
  /** Returns a new `CalendarDate` with the given fields set to the provided values. Other fields will be constrained accordingly. */
  set(t) {
    return Ql(this, t);
  }
  /**
  * Returns a new `CalendarDate` with the given field adjusted by a specified amount.
  * When the resulting value reaches the limits of the field, it wraps around.
  */
  cycle(t, n, r) {
    return eu(this, t, n, r);
  }
  /** Converts the date to a native JavaScript Date object, with the time set to midnight in the given time zone. */
  toDate(t) {
    return Yp(this, t);
  }
  /** Converts the date to an ISO 8601 formatted string. */
  toString() {
    return ig(this);
  }
  /** Compares this date with another. A negative result indicates that this date is before the given one, and a positive date indicates that it is after. */
  compare(t) {
    return Up(this, t);
  }
  constructor(...t) {
    la(this, O2, {
      writable: !0,
      value: void 0
    });
    let [n, r, a, i, o] = nu(t);
    this.calendar = n, this.era = r, this.year = a, this.month = i, this.day = o, sn(this);
  }
}
var z2 = /* @__PURE__ */ new WeakMap();
class Wi {
  /** Returns a copy of this time. */
  copy() {
    return new Wi(this.hour, this.minute, this.second, this.millisecond);
  }
  /** Returns a new `Time` with the given duration added to it. */
  add(t) {
    return tg(this, t);
  }
  /** Returns a new `Time` with the given duration subtracted from it. */
  subtract(t) {
    return k2(this, t);
  }
  /** Returns a new `Time` with the given fields set to the provided values. Other fields will be constrained accordingly. */
  set(t) {
    return _r(this, t);
  }
  /**
  * Returns a new `Time` with the given field adjusted by a specified amount.
  * When the resulting value reaches the limits of the field, it wraps around.
  */
  cycle(t, n, r) {
    return tu(this, t, n, r);
  }
  /** Converts the time to an ISO 8601 formatted string. */
  toString() {
    return ag(this);
  }
  /** Compares this time with another. A negative result indicates that this time is before the given one, and a positive time indicates that it is after. */
  compare(t) {
    return Hp(this, t);
  }
  constructor(t = 0, n = 0, r = 0, a = 0) {
    la(this, z2, {
      writable: !0,
      value: void 0
    }), this.hour = t, this.minute = n, this.second = r, this.millisecond = a, Qp(this);
  }
}
var _2 = /* @__PURE__ */ new WeakMap();
class Ur {
  /** Returns a copy of this date. */
  copy() {
    return this.era ? new Ur(this.calendar, this.era, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond) : new Ur(this.calendar, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
  }
  /** Returns a new `CalendarDateTime` with the given duration added to it. */
  add(t) {
    return Ki(this, t);
  }
  /** Returns a new `CalendarDateTime` with the given duration subtracted from it. */
  subtract(t) {
    return Jp(this, t);
  }
  /** Returns a new `CalendarDateTime` with the given fields set to the provided values. Other fields will be constrained accordingly. */
  set(t) {
    return Ql(_r(this, t), t);
  }
  /**
  * Returns a new `CalendarDateTime` with the given field adjusted by a specified amount.
  * When the resulting value reaches the limits of the field, it wraps around.
  */
  cycle(t, n, r) {
    switch (t) {
      case "era":
      case "year":
      case "month":
      case "day":
        return eu(this, t, n, r);
      default:
        return tu(this, t, n, r);
    }
  }
  /** Converts the date to a native JavaScript Date object in the given time zone. */
  toDate(t, n) {
    return Yp(this, t, n);
  }
  /** Converts the date to an ISO 8601 formatted string. */
  toString() {
    return og(this);
  }
  /** Compares this date with another. A negative result indicates that this date is before the given one, and a positive date indicates that it is after. */
  compare(t) {
    let n = Up(this, t);
    return n === 0 ? Hp(this, St(t)) : n;
  }
  constructor(...t) {
    la(this, _2, {
      writable: !0,
      value: void 0
    });
    let [n, r, a, i, o] = nu(t);
    this.calendar = n, this.era = r, this.year = a, this.month = i, this.day = o, this.hour = t.shift() || 0, this.minute = t.shift() || 0, this.second = t.shift() || 0, this.millisecond = t.shift() || 0, sn(this);
  }
}
var U2 = /* @__PURE__ */ new WeakMap();
class Hr {
  /** Returns a copy of this date. */
  copy() {
    return this.era ? new Hr(this.calendar, this.era, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond) : new Hr(this.calendar, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond);
  }
  /** Returns a new `ZonedDateTime` with the given duration added to it. */
  add(t) {
    return ng(this, t);
  }
  /** Returns a new `ZonedDateTime` with the given duration subtracted from it. */
  subtract(t) {
    return N2(this, t);
  }
  /** Returns a new `ZonedDateTime` with the given fields set to the provided values. Other fields will be constrained accordingly. */
  set(t, n) {
    return j2(this, t, n);
  }
  /**
  * Returns a new `ZonedDateTime` with the given field adjusted by a specified amount.
  * When the resulting value reaches the limits of the field, it wraps around.
  */
  cycle(t, n, r) {
    return A2(this, t, n, r);
  }
  /** Converts the date to a native JavaScript Date object. */
  toDate() {
    return E2(this);
  }
  /** Converts the date to an ISO 8601 formatted string, including the UTC offset and time zone identifier. */
  toString() {
    return L2(this);
  }
  /** Converts the date to an ISO 8601 formatted string in UTC. */
  toAbsoluteString() {
    return this.toDate().toISOString();
  }
  /** Compares this date with another. A negative result indicates that this date is before the given one, and a positive date indicates that it is after. */
  compare(t) {
    return this.toDate().getTime() - qp(t, this.timeZone).toDate().getTime();
  }
  constructor(...t) {
    la(this, U2, {
      writable: !0,
      value: void 0
    });
    let [n, r, a, i, o] = nu(t), s = t.shift(), l = t.shift();
    this.calendar = n, this.era = r, this.year = a, this.month = i, this.day = o, this.timeZone = s, this.offset = l, this.hour = t.shift() || 0, this.minute = t.shift() || 0, this.second = t.shift() || 0, this.millisecond = t.shift() || 0, sn(this);
  }
}
const Vn = [
  [
    1868,
    9,
    8
  ],
  [
    1912,
    7,
    30
  ],
  [
    1926,
    12,
    25
  ],
  [
    1989,
    1,
    8
  ],
  [
    2019,
    5,
    1
  ]
], H2 = [
  [
    1912,
    7,
    29
  ],
  [
    1926,
    12,
    24
  ],
  [
    1989,
    1,
    7
  ],
  [
    2019,
    4,
    30
  ]
], _a = [
  1867,
  1911,
  1925,
  1988,
  2018
], Ft = [
  "meiji",
  "taisho",
  "showa",
  "heisei",
  "reiwa"
];
function Fd(e) {
  const t = Vn.findIndex(([n, r, a]) => e.year < n || e.year === n && e.month < r || e.year === n && e.month === r && e.day < a);
  return t === -1 ? Vn.length - 1 : t === 0 ? 0 : t - 1;
}
function ko(e) {
  let t = _a[Ft.indexOf(e.era)];
  if (!t) throw new Error("Unknown era: " + e.era);
  return new pe(e.year + t, e.month, e.day);
}
class K2 extends Le {
  fromJulianDay(t) {
    let n = super.fromJulianDay(t), r = Fd(n);
    return new pe(this, Ft[r], n.year - _a[r], n.month, n.day);
  }
  toJulianDay(t) {
    return super.toJulianDay(ko(t));
  }
  balanceDate(t) {
    let n = ko(t), r = Fd(n);
    Ft[r] !== t.era && (t.era = Ft[r], t.year = n.year - _a[r]), this.constrainDate(t);
  }
  constrainDate(t) {
    let n = Ft.indexOf(t.era), r = H2[n];
    if (r != null) {
      let [a, i, o] = r, s = a - _a[n];
      t.year = Math.max(1, Math.min(s, t.year)), t.year === s && (t.month = Math.min(i, t.month), t.month === i && (t.day = Math.min(o, t.day)));
    }
    if (t.year === 1 && n >= 0) {
      let [, a, i] = Vn[n];
      t.month = Math.max(a, t.month), t.month === a && (t.day = Math.max(i, t.day));
    }
  }
  getEras() {
    return Ft;
  }
  getYearsInEra(t) {
    let n = Ft.indexOf(t.era), r = Vn[n], a = Vn[n + 1];
    if (a == null)
      return 9999 - r[0] + 1;
    let i = a[0] - r[0];
    return (t.month < a[1] || t.month === a[1] && t.day < a[2]) && i++, i;
  }
  getDaysInMonth(t) {
    return super.getDaysInMonth(ko(t));
  }
  getMinimumMonthInYear(t) {
    let n = Od(t);
    return n ? n[1] : 1;
  }
  getMinimumDayInMonth(t) {
    let n = Od(t);
    return n && t.month === n[1] ? n[2] : 1;
  }
  constructor(...t) {
    super(...t), this.identifier = "japanese";
  }
}
function Od(e) {
  if (e.year === 1) {
    let t = Ft.indexOf(e.era);
    return Vn[t];
  }
}
const sg = -543;
class W2 extends Le {
  fromJulianDay(t) {
    let n = super.fromJulianDay(t), r = oa(n.era, n.year);
    return new pe(this, r - sg, n.month, n.day);
  }
  toJulianDay(t) {
    return super.toJulianDay(zd(t));
  }
  getEras() {
    return [
      "BE"
    ];
  }
  getDaysInMonth(t) {
    return super.getDaysInMonth(zd(t));
  }
  balanceDate() {
  }
  constructor(...t) {
    super(...t), this.identifier = "buddhist";
  }
}
function zd(e) {
  let [t, n] = Hi(e.year + sg);
  return new pe(t, n, e.month, e.day);
}
const si = 1911;
function lg(e) {
  return e.era === "minguo" ? e.year + si : 1 - e.year + si;
}
function _d(e) {
  let t = e - si;
  return t > 0 ? [
    "minguo",
    t
  ] : [
    "before_minguo",
    1 - t
  ];
}
class G2 extends Le {
  fromJulianDay(t) {
    let n = super.fromJulianDay(t), r = oa(n.era, n.year), [a, i] = _d(r);
    return new pe(this, a, i, n.month, n.day);
  }
  toJulianDay(t) {
    return super.toJulianDay(Ud(t));
  }
  getEras() {
    return [
      "before_minguo",
      "minguo"
    ];
  }
  balanceDate(t) {
    let [n, r] = _d(lg(t));
    t.era = n, t.year = r;
  }
  isInverseEra(t) {
    return t.era === "before_minguo";
  }
  getDaysInMonth(t) {
    return super.getDaysInMonth(Ud(t));
  }
  getYearsInEra(t) {
    return t.era === "before_minguo" ? 9999 : 9999 - si;
  }
  constructor(...t) {
    super(...t), this.identifier = "roc";
  }
}
function Ud(e) {
  let [t, n] = Hi(lg(e));
  return new pe(t, n, e.month, e.day);
}
const Hd = 1948320, Kd = [
  0,
  31,
  62,
  93,
  124,
  155,
  186,
  216,
  246,
  276,
  306,
  336
  // Esfand
];
class Y2 {
  fromJulianDay(t) {
    let n = t - Hd, r = 1 + Math.floor((33 * n + 3) / 12053), a = 365 * (r - 1) + Math.floor((8 * r + 21) / 33), i = n - a, o = i < 216 ? Math.floor(i / 31) : Math.floor((i - 6) / 30), s = i - Kd[o] + 1;
    return new pe(this, r, o + 1, s);
  }
  toJulianDay(t) {
    let n = Hd - 1 + 365 * (t.year - 1) + Math.floor((8 * t.year + 21) / 33);
    return n += Kd[t.month - 1], n += t.day, n;
  }
  getMonthsInYear() {
    return 12;
  }
  getDaysInMonth(t) {
    return t.month <= 6 ? 31 : t.month <= 11 || In(25 * t.year + 11, 33) < 8 ? 30 : 29;
  }
  getMaximumMonthsInYear() {
    return 12;
  }
  getMaximumDaysInMonth() {
    return 31;
  }
  getEras() {
    return [
      "AP"
    ];
  }
  getYearsInEra() {
    return 9377;
  }
  constructor() {
    this.identifier = "persian";
  }
}
const No = 78, Wd = 80;
class q2 extends Le {
  fromJulianDay(t) {
    let n = super.fromJulianDay(t), r = n.year - No, a = t - en(n.era, n.year, 1, 1), i;
    a < Wd ? (r--, i = _t(n.year - 1) ? 31 : 30, a += i + 155 + 90 + 10) : (i = _t(n.year) ? 31 : 30, a -= Wd);
    let o, s;
    if (a < i)
      o = 1, s = a + 1;
    else {
      let l = a - i;
      l < 155 ? (o = Math.floor(l / 31) + 2, s = l % 31 + 1) : (l -= 155, o = Math.floor(l / 30) + 7, s = l % 30 + 1);
    }
    return new pe(this, r, o, s);
  }
  toJulianDay(t) {
    let n = t.year + No, [r, a] = Hi(n), i, o;
    return _t(a) ? (i = 31, o = en(r, a, 3, 21)) : (i = 30, o = en(r, a, 3, 22)), t.month === 1 ? o + t.day - 1 : (o += i + Math.min(t.month - 2, 5) * 31, t.month >= 8 && (o += (t.month - 7) * 30), o += t.day - 1, o);
  }
  getDaysInMonth(t) {
    return t.month === 1 && _t(t.year + No) || t.month >= 2 && t.month <= 6 ? 31 : 30;
  }
  getYearsInEra() {
    return 9919;
  }
  getEras() {
    return [
      "saka"
    ];
  }
  balanceDate() {
  }
  constructor(...t) {
    super(...t), this.identifier = "indian";
  }
}
const li = 1948440, Gd = 1948439, Ye = 1300, wn = 1600, Z2 = 460322;
function ui(e, t, n, r) {
  return r + Math.ceil(29.5 * (n - 1)) + (t - 1) * 354 + Math.floor((3 + 11 * t) / 30) + e - 1;
}
function ug(e, t, n) {
  let r = Math.floor((30 * (n - t) + 10646) / 10631), a = Math.min(12, Math.ceil((n - (29 + ui(t, r, 1, 1))) / 29.5) + 1), i = n - ui(t, r, a, 1) + 1;
  return new pe(e, r, a, i);
}
function Yd(e) {
  return (14 + 11 * e) % 30 < 11;
}
class ru {
  fromJulianDay(t) {
    return ug(this, li, t);
  }
  toJulianDay(t) {
    return ui(li, t.year, t.month, t.day);
  }
  getDaysInMonth(t) {
    let n = 29 + t.month % 2;
    return t.month === 12 && Yd(t.year) && n++, n;
  }
  getMonthsInYear() {
    return 12;
  }
  getDaysInYear(t) {
    return Yd(t.year) ? 355 : 354;
  }
  getMaximumMonthsInYear() {
    return 12;
  }
  getMaximumDaysInMonth() {
    return 30;
  }
  getYearsInEra() {
    return 9665;
  }
  getEras() {
    return [
      "AH"
    ];
  }
  constructor() {
    this.identifier = "islamic-civil";
  }
}
class X2 extends ru {
  fromJulianDay(t) {
    return ug(this, Gd, t);
  }
  toJulianDay(t) {
    return ui(Gd, t.year, t.month, t.day);
  }
  constructor(...t) {
    super(...t), this.identifier = "islamic-tbla";
  }
}
const J2 = "qgpUDckO1AbqBmwDrQpVBakGkgepC9QF2gpcBS0NlQZKB1QLagutBa4ETwoXBYsGpQbVCtYCWwmdBE0KJg2VDawFtgm6AlsKKwWVCsoG6Qr0AnYJtgJWCcoKpAvSC9kF3AJtCU0FpQpSC6ULtAW2CVcFlwJLBaMGUgdlC2oFqworBZUMSg2lDcoF1gpXCasESwmlClILagt1BXYCtwhbBFUFqQW0BdoJ3QRuAjYJqgpUDbIN1QXaAlsJqwRVCkkLZAtxC7QFtQpVCiUNkg7JDtQG6QprCasEkwpJDaQNsg25CroEWworBZUKKgtVC1wFvQQ9Ah0JlQpKC1oLbQW2AjsJmwRVBqkGVAdqC2wFrQpVBSkLkgupC9QF2gpaBasKlQVJB2QHqgu1BbYCVgpNDiULUgtqC60FrgIvCZcESwalBqwG1gpdBZ0ETQoWDZUNqgW1BdoCWwmtBJUFygbkBuoK9QS2AlYJqgpUC9IL2QXqAm0JrQSVCkoLpQuyBbUJ1gSXCkcFkwZJB1ULagVrCisFiwpGDaMNygXWCtsEawJLCaUKUgtpC3UFdgG3CFsCKwVlBbQF2gntBG0BtgimClINqQ3UBdoKWwmrBFMGKQdiB6kLsgW1ClUFJQuSDckO0gbpCmsFqwRVCikNVA2qDbUJugQ7CpsETQqqCtUK2gJdCV4ELgqaDFUNsga5BroEXQotBZUKUguoC7QLuQXaAloJSgukDdEO6AZqC20FNQWVBkoNqA3UDdoGWwWdAisGFQtKC5ULqgWuCi4JjwwnBZUGqgbWCl0FnQI=";
let Ps, Bn;
function Ua(e) {
  return Z2 + Bn[e - Ye];
}
function gr(e, t) {
  let n = e - Ye, r = 1 << 11 - (t - 1);
  return (Ps[n] & r) === 0 ? 29 : 30;
}
function qd(e, t) {
  let n = Ua(e);
  for (let r = 1; r < t; r++) n += gr(e, r);
  return n;
}
function Zd(e) {
  return Bn[e + 1 - Ye] - Bn[e - Ye];
}
class Q2 extends ru {
  fromJulianDay(t) {
    let n = t - li, r = Ua(Ye), a = Ua(wn);
    if (n < r || n > a) return super.fromJulianDay(t);
    {
      let i = Ye - 1, o = 1, s = 1;
      for (; s > 0; ) {
        i++, s = n - Ua(i) + 1;
        let l = Zd(i);
        if (s === l) {
          o = 12;
          break;
        } else if (s < l) {
          let c = gr(i, o);
          for (o = 1; s > c; )
            s -= c, o++, c = gr(i, o);
          break;
        }
      }
      return new pe(this, i, o, n - qd(i, o) + 1);
    }
  }
  toJulianDay(t) {
    return t.year < Ye || t.year > wn ? super.toJulianDay(t) : li + qd(t.year, t.month) + (t.day - 1);
  }
  getDaysInMonth(t) {
    return t.year < Ye || t.year > wn ? super.getDaysInMonth(t) : gr(t.year, t.month);
  }
  getDaysInYear(t) {
    return t.year < Ye || t.year > wn ? super.getDaysInYear(t) : Zd(t.year);
  }
  constructor() {
    if (super(), this.identifier = "islamic-umalqura", Ps || (Ps = new Uint16Array(Uint8Array.from(atob(J2), (t) => t.charCodeAt(0)).buffer)), !Bn) {
      Bn = new Uint32Array(wn - Ye + 1);
      let t = 0;
      for (let n = Ye; n <= wn; n++) {
        Bn[n - Ye] = t;
        for (let r = 1; r <= 12; r++) t += gr(n, r);
      }
    }
  }
}
const Xd = 347997, cg = 1080, dg = 24 * cg, eC = 29, tC = 12 * cg + 793, nC = eC * dg + tC;
function Xt(e) {
  return In(e * 7 + 1, 19) < 7;
}
function Ha(e) {
  let t = Math.floor((235 * e - 234) / 19), n = 12084 + 13753 * t, r = t * 29 + Math.floor(n / 25920);
  return In(3 * (r + 1), 7) < 3 && (r += 1), r;
}
function rC(e) {
  let t = Ha(e - 1), n = Ha(e);
  return Ha(e + 1) - n === 356 ? 2 : n - t === 382 ? 1 : 0;
}
function Er(e) {
  return Ha(e) + rC(e);
}
function fg(e) {
  return Er(e + 1) - Er(e);
}
function aC(e) {
  let t = fg(e);
  switch (t > 380 && (t -= 30), t) {
    case 353:
      return 0;
    // deficient
    case 354:
      return 1;
    // normal
    case 355:
      return 2;
  }
}
function Sa(e, t) {
  if (t >= 6 && !Xt(e) && t++, t === 4 || t === 7 || t === 9 || t === 11 || t === 13) return 29;
  let n = aC(e);
  return t === 2 ? n === 2 ? 30 : 29 : t === 3 ? n === 0 ? 29 : 30 : t === 6 ? Xt(e) ? 30 : 0 : 30;
}
class iC {
  fromJulianDay(t) {
    let n = t - Xd, r = n * dg / nC, a = Math.floor((19 * r + 234) / 235) + 1, i = Er(a), o = Math.floor(n - i);
    for (; o < 1; )
      a--, i = Er(a), o = Math.floor(n - i);
    let s = 1, l = 0;
    for (; l < o; )
      l += Sa(a, s), s++;
    s--, l -= Sa(a, s);
    let c = o - l;
    return new pe(this, a, s, c);
  }
  toJulianDay(t) {
    let n = Er(t.year);
    for (let r = 1; r < t.month; r++) n += Sa(t.year, r);
    return n + t.day + Xd;
  }
  getDaysInMonth(t) {
    return Sa(t.year, t.month);
  }
  getMonthsInYear(t) {
    return Xt(t.year) ? 13 : 12;
  }
  getDaysInYear(t) {
    return fg(t.year);
  }
  getMaximumMonthsInYear() {
    return 13;
  }
  getMaximumDaysInMonth() {
    return 30;
  }
  getYearsInEra() {
    return 9999;
  }
  getEras() {
    return [
      "AM"
    ];
  }
  balanceYearMonth(t, n) {
    n.year !== t.year && (Xt(n.year) && !Xt(t.year) && n.month > 6 ? t.month-- : !Xt(n.year) && Xt(t.year) && n.month > 6 && t.month++);
  }
  constructor() {
    this.identifier = "hebrew";
  }
}
const ks = 1723856, Jd = 1824665, Ns = 5500;
function ci(e, t, n, r) {
  return e + 365 * t + Math.floor(t / 4) + 30 * (n - 1) + r - 1;
}
function au(e, t) {
  let n = Math.floor(4 * (t - e) / 1461), r = 1 + Math.floor((t - ci(e, n, 1, 1)) / 30), a = t + 1 - ci(e, n, r, 1);
  return [
    n,
    r,
    a
  ];
}
function mg(e) {
  return Math.floor(e % 4 / 3);
}
function hg(e, t) {
  return t % 13 !== 0 ? 30 : mg(e) + 5;
}
class iu {
  fromJulianDay(t) {
    let [n, r, a] = au(ks, t), i = "AM";
    return n <= 0 && (i = "AA", n += Ns), new pe(this, i, n, r, a);
  }
  toJulianDay(t) {
    let n = t.year;
    return t.era === "AA" && (n -= Ns), ci(ks, n, t.month, t.day);
  }
  getDaysInMonth(t) {
    return hg(t.year, t.month);
  }
  getMonthsInYear() {
    return 13;
  }
  getDaysInYear(t) {
    return 365 + mg(t.year);
  }
  getMaximumMonthsInYear() {
    return 13;
  }
  getMaximumDaysInMonth() {
    return 30;
  }
  getYearsInEra(t) {
    return t.era === "AA" ? 9999 : 9991;
  }
  getEras() {
    return [
      "AA",
      "AM"
    ];
  }
  constructor() {
    this.identifier = "ethiopic";
  }
}
class oC extends iu {
  fromJulianDay(t) {
    let [n, r, a] = au(ks, t);
    return n += Ns, new pe(this, "AA", n, r, a);
  }
  getEras() {
    return [
      "AA"
    ];
  }
  getYearsInEra() {
    return 9999;
  }
  constructor(...t) {
    super(...t), this.identifier = "ethioaa";
  }
}
class sC extends iu {
  fromJulianDay(t) {
    let [n, r, a] = au(Jd, t), i = "CE";
    return n <= 0 && (i = "BCE", n = 1 - n), new pe(this, i, n, r, a);
  }
  toJulianDay(t) {
    let n = t.year;
    return t.era === "BCE" && (n = 1 - n), ci(Jd, n, t.month, t.day);
  }
  getDaysInMonth(t) {
    let n = t.year;
    return t.era === "BCE" && (n = 1 - n), hg(n, t.month);
  }
  isInverseEra(t) {
    return t.era === "BCE";
  }
  balanceDate(t) {
    t.year <= 0 && (t.era = t.era === "BCE" ? "CE" : "BCE", t.year = 1 - t.year);
  }
  getEras() {
    return [
      "BCE",
      "CE"
    ];
  }
  getYearsInEra(t) {
    return t.era === "BCE" ? 9999 : 9715;
  }
  constructor(...t) {
    super(...t), this.identifier = "coptic";
  }
}
function pg(e) {
  switch (e) {
    case "buddhist":
      return new W2();
    case "ethiopic":
      return new iu();
    case "ethioaa":
      return new oC();
    case "coptic":
      return new sC();
    case "hebrew":
      return new iC();
    case "indian":
      return new q2();
    case "islamic-civil":
      return new ru();
    case "islamic-tbla":
      return new X2();
    case "islamic-umalqura":
      return new Q2();
    case "japanese":
      return new K2();
    case "persian":
      return new Y2();
    case "roc":
      return new G2();
    case "gregory":
    default:
      return new Le();
  }
}
let Ao = /* @__PURE__ */ new Map();
class Nn {
  /** Formats a date as a string according to the locale and format options passed to the constructor. */
  format(t) {
    return this.formatter.format(t);
  }
  /** Formats a date to an array of parts such as separators, numbers, punctuation, and more. */
  formatToParts(t) {
    return this.formatter.formatToParts(t);
  }
  /** Formats a date range as a string. */
  formatRange(t, n) {
    if (typeof this.formatter.formatRange == "function")
      return this.formatter.formatRange(t, n);
    if (n < t) throw new RangeError("End date must be >= start date");
    return `${this.formatter.format(t)} – ${this.formatter.format(n)}`;
  }
  /** Formats a date range as an array of parts. */
  formatRangeToParts(t, n) {
    if (typeof this.formatter.formatRangeToParts == "function")
      return this.formatter.formatRangeToParts(t, n);
    if (n < t) throw new RangeError("End date must be >= start date");
    let r = this.formatter.formatToParts(t), a = this.formatter.formatToParts(n);
    return [
      ...r.map((i) => ({
        ...i,
        source: "startRange"
      })),
      {
        type: "literal",
        value: " – ",
        source: "shared"
      },
      ...a.map((i) => ({
        ...i,
        source: "endRange"
      }))
    ];
  }
  /** Returns the resolved formatting options based on the values passed to the constructor. */
  resolvedOptions() {
    let t = this.formatter.resolvedOptions();
    return cC() && (this.resolvedHourCycle || (this.resolvedHourCycle = dC(t.locale, this.options)), t.hourCycle = this.resolvedHourCycle, t.hour12 = this.resolvedHourCycle === "h11" || this.resolvedHourCycle === "h12"), t.calendar === "ethiopic-amete-alem" && (t.calendar = "ethioaa"), t;
  }
  constructor(t, n = {}) {
    this.formatter = gg(t, n), this.options = n;
  }
}
const lC = {
  true: {
    // Only Japanese uses the h11 style for 12 hour time. All others use h12.
    ja: "h11"
  },
  false: {}
};
function gg(e, t = {}) {
  if (typeof t.hour12 == "boolean" && uC()) {
    t = {
      ...t
    };
    let a = lC[String(t.hour12)][e.split("-")[0]], i = t.hour12 ? "h12" : "h23";
    t.hourCycle = a ?? i, delete t.hour12;
  }
  let n = e + (t ? Object.entries(t).sort((a, i) => a[0] < i[0] ? -1 : 1).join() : "");
  if (Ao.has(n)) return Ao.get(n);
  let r = new Intl.DateTimeFormat(e, t);
  return Ao.set(n, r), r;
}
let jo = null;
function uC() {
  return jo == null && (jo = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: !1
  }).format(new Date(2020, 2, 3, 0)) === "24"), jo;
}
let Mo = null;
function cC() {
  return Mo == null && (Mo = new Intl.DateTimeFormat("fr", {
    hour: "numeric",
    hour12: !1
  }).resolvedOptions().hourCycle === "h12"), Mo;
}
function dC(e, t) {
  if (!t.timeStyle && !t.hour) return;
  e = e.replace(/(-u-)?-nu-[a-zA-Z0-9]+/, ""), e += (e.includes("-u-") ? "" : "-u") + "-nu-latn";
  let n = gg(e, {
    ...t,
    timeZone: void 0
    // use local timezone
  }), r = parseInt(n.formatToParts(new Date(2020, 2, 3, 0)).find((i) => i.type === "hour").value, 10), a = parseInt(n.formatToParts(new Date(2020, 2, 3, 23)).find((i) => i.type === "hour").value, 10);
  if (r === 0 && a === 23) return "h23";
  if (r === 24 && a === 23) return "h24";
  if (r === 0 && a === 11) return "h11";
  if (r === 12 && a === 11) return "h12";
  throw new Error("Unexpected hour cycle result");
}
function Ta(e) {
  e = ZD(e ?? {}, fC);
  let { locale: t } = Nt();
  return F(() => new Nn(t, e), [
    t,
    e
  ]);
}
function fC(e, t) {
  if (e === t) return !0;
  let n = Object.keys(e), r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (let a of n)
    if (t[a] !== e[a]) return !1;
  return !0;
}
let Ro = /* @__PURE__ */ new Map(), As = !1;
try {
  As = new Intl.NumberFormat("de-DE", {
    signDisplay: "exceptZero"
  }).resolvedOptions().signDisplay === "exceptZero";
} catch {
}
let di = !1;
try {
  di = new Intl.NumberFormat("de-DE", {
    style: "unit",
    unit: "degree"
  }).resolvedOptions().style === "unit";
} catch {
}
const vg = {
  degree: {
    narrow: {
      default: "°",
      "ja-JP": " 度",
      "zh-TW": "度",
      "sl-SI": " °"
    }
  }
};
class js {
  /** Formats a number value as a string, according to the locale and options provided to the constructor. */
  format(t) {
    let n = "";
    if (!As && this.options.signDisplay != null ? n = hC(this.numberFormatter, this.options.signDisplay, t) : n = this.numberFormatter.format(t), this.options.style === "unit" && !di) {
      var r;
      let { unit: a, unitDisplay: i = "short", locale: o } = this.resolvedOptions();
      if (!a) return n;
      let s = (r = vg[a]) === null || r === void 0 ? void 0 : r[i];
      n += s[o] || s.default;
    }
    return n;
  }
  /** Formats a number to an array of parts such as separators, digits, punctuation, and more. */
  formatToParts(t) {
    return this.numberFormatter.formatToParts(t);
  }
  /** Formats a number range as a string. */
  formatRange(t, n) {
    if (typeof this.numberFormatter.formatRange == "function") return this.numberFormatter.formatRange(t, n);
    if (n < t) throw new RangeError("End date must be >= start date");
    return `${this.format(t)} – ${this.format(n)}`;
  }
  /** Formats a number range as an array of parts. */
  formatRangeToParts(t, n) {
    if (typeof this.numberFormatter.formatRangeToParts == "function") return this.numberFormatter.formatRangeToParts(t, n);
    if (n < t) throw new RangeError("End date must be >= start date");
    let r = this.numberFormatter.formatToParts(t), a = this.numberFormatter.formatToParts(n);
    return [
      ...r.map((i) => ({
        ...i,
        source: "startRange"
      })),
      {
        type: "literal",
        value: " – ",
        source: "shared"
      },
      ...a.map((i) => ({
        ...i,
        source: "endRange"
      }))
    ];
  }
  /** Returns the resolved formatting options based on the values passed to the constructor. */
  resolvedOptions() {
    let t = this.numberFormatter.resolvedOptions();
    return !As && this.options.signDisplay != null && (t = {
      ...t,
      signDisplay: this.options.signDisplay
    }), !di && this.options.style === "unit" && (t = {
      ...t,
      style: "unit",
      unit: this.options.unit,
      unitDisplay: this.options.unitDisplay
    }), t;
  }
  constructor(t, n = {}) {
    this.numberFormatter = mC(t, n), this.options = n;
  }
}
function mC(e, t = {}) {
  let { numberingSystem: n } = t;
  if (n && e.includes("-nu-") && (e.includes("-u-") || (e += "-u-"), e += `-nu-${n}`), t.style === "unit" && !di) {
    var r;
    let { unit: o, unitDisplay: s = "short" } = t;
    if (!o) throw new Error('unit option must be provided with style: "unit"');
    if (!(!((r = vg[o]) === null || r === void 0) && r[s])) throw new Error(`Unsupported unit ${o} with unitDisplay = ${s}`);
    t = {
      ...t,
      style: "decimal"
    };
  }
  let a = e + (t ? Object.entries(t).sort((o, s) => o[0] < s[0] ? -1 : 1).join() : "");
  if (Ro.has(a)) return Ro.get(a);
  let i = new Intl.NumberFormat(e, t);
  return Ro.set(a, i), i;
}
function hC(e, t, n) {
  if (t === "auto") return e.format(n);
  if (t === "never") return e.format(Math.abs(n));
  {
    let r = !1;
    if (t === "always" ? r = n > 0 || Object.is(n, 0) : t === "exceptZero" && (Object.is(n, -0) || Object.is(n, 0) ? n = Math.abs(n) : r = n > 0), r) {
      let a = e.format(-n), i = e.format(n), o = a.replace(i, "").replace(/\u200e|\u061C/, "");
      return [
        ...o
      ].length !== 1 && console.warn("@react-aria/i18n polyfill for NumberFormat signDisplay: Unsupported case"), a.replace(i, "!!!").replace(o, "+").replace("!!!", i);
    } else return e.format(n);
  }
}
const pC = new RegExp("^.*\\(.*\\).*$"), gC = [
  "latn",
  "arab",
  "hanidec",
  "deva",
  "beng",
  "fullwide"
];
class bg {
  /**
  * Parses the given string to a number. Returns NaN if a valid number could not be parsed.
  */
  parse(t) {
    return Io(this.locale, this.options, t).parse(t);
  }
  /**
  * Returns whether the given string could potentially be a valid number. This should be used to
  * validate user input as the user types. If a `minValue` or `maxValue` is provided, the validity
  * of the minus/plus sign characters can be checked.
  */
  isValidPartialNumber(t, n, r) {
    return Io(this.locale, this.options, t).isValidPartialNumber(t, n, r);
  }
  /**
  * Returns a numbering system for which the given string is valid in the current locale.
  * If no numbering system could be detected, the default numbering system for the current
  * locale is returned.
  */
  getNumberingSystem(t) {
    return Io(this.locale, this.options, t).options.numberingSystem;
  }
  constructor(t, n = {}) {
    this.locale = t, this.options = n;
  }
}
const Qd = /* @__PURE__ */ new Map();
function Io(e, t, n) {
  let r = ef(e, t);
  if (!e.includes("-nu-") && !r.isValidPartialNumber(n)) {
    for (let a of gC) if (a !== r.options.numberingSystem) {
      let i = ef(e + (e.includes("-u-") ? "-nu-" : "-u-nu-") + a, t);
      if (i.isValidPartialNumber(n)) return i;
    }
  }
  return r;
}
function ef(e, t) {
  let n = e + (t ? Object.entries(t).sort((a, i) => a[0] < i[0] ? -1 : 1).join() : ""), r = Qd.get(n);
  return r || (r = new vC(e, t), Qd.set(n, r)), r;
}
class vC {
  parse(t) {
    let n = this.sanitize(t);
    if (this.symbols.group && (n = $n(n, this.symbols.group, "")), this.symbols.decimal && (n = n.replace(this.symbols.decimal, ".")), this.symbols.minusSign && (n = n.replace(this.symbols.minusSign, "-")), n = n.replace(this.symbols.numeral, this.symbols.index), this.options.style === "percent") {
      let o = n.indexOf("-");
      n = n.replace("-", ""), n = n.replace("+", "");
      let s = n.indexOf(".");
      s === -1 && (s = n.length), n = n.replace(".", ""), s - 2 === 0 ? n = `0.${n}` : s - 2 === -1 ? n = `0.0${n}` : s - 2 === -2 ? n = "0.00" : n = `${n.slice(0, s - 2)}.${n.slice(s - 2)}`, o > -1 && (n = `-${n}`);
    }
    let r = n ? +n : NaN;
    if (isNaN(r)) return NaN;
    if (this.options.style === "percent") {
      var a, i;
      let o = {
        ...this.options,
        style: "decimal",
        minimumFractionDigits: Math.min(((a = this.options.minimumFractionDigits) !== null && a !== void 0 ? a : 0) + 2, 20),
        maximumFractionDigits: Math.min(((i = this.options.maximumFractionDigits) !== null && i !== void 0 ? i : 0) + 2, 20)
      };
      return new bg(this.locale, o).parse(new js(this.locale, o).format(r));
    }
    return this.options.currencySign === "accounting" && pC.test(t) && (r = -1 * r), r;
  }
  sanitize(t) {
    return t = t.replace(this.symbols.literals, ""), this.symbols.minusSign && (t = t.replace("-", this.symbols.minusSign)), this.options.numberingSystem === "arab" && (this.symbols.decimal && (t = t.replace(",", this.symbols.decimal), t = t.replace("،", this.symbols.decimal)), this.symbols.group && (t = $n(t, ".", this.symbols.group))), this.symbols.group === "’" && t.includes("'") && (t = $n(t, "'", this.symbols.group)), this.options.locale === "fr-FR" && this.symbols.group && (t = $n(t, " ", this.symbols.group), t = $n(t, /\u00A0/g, this.symbols.group)), t;
  }
  isValidPartialNumber(t, n = -1 / 0, r = 1 / 0) {
    return t = this.sanitize(t), this.symbols.minusSign && t.startsWith(this.symbols.minusSign) && n < 0 ? t = t.slice(this.symbols.minusSign.length) : this.symbols.plusSign && t.startsWith(this.symbols.plusSign) && r > 0 && (t = t.slice(this.symbols.plusSign.length)), this.symbols.group && t.startsWith(this.symbols.group) || this.symbols.decimal && t.indexOf(this.symbols.decimal) > -1 && this.options.maximumFractionDigits === 0 ? !1 : (this.symbols.group && (t = $n(t, this.symbols.group, "")), t = t.replace(this.symbols.numeral, ""), this.symbols.decimal && (t = t.replace(this.symbols.decimal, "")), t.length === 0);
  }
  constructor(t, n = {}) {
    this.locale = t, n.roundingIncrement !== 1 && n.roundingIncrement != null && (n.maximumFractionDigits == null && n.minimumFractionDigits == null ? (n.maximumFractionDigits = 0, n.minimumFractionDigits = 0) : n.maximumFractionDigits == null ? n.maximumFractionDigits = n.minimumFractionDigits : n.minimumFractionDigits == null && (n.minimumFractionDigits = n.maximumFractionDigits)), this.formatter = new Intl.NumberFormat(t, n), this.options = this.formatter.resolvedOptions(), this.symbols = yC(t, this.formatter, this.options, n);
    var r, a;
    this.options.style === "percent" && (((r = this.options.minimumFractionDigits) !== null && r !== void 0 ? r : 0) > 18 || ((a = this.options.maximumFractionDigits) !== null && a !== void 0 ? a : 0) > 18) && console.warn("NumberParser cannot handle percentages with greater than 18 decimal places, please reduce the number in your options.");
  }
}
const tf = /* @__PURE__ */ new Set([
  "decimal",
  "fraction",
  "integer",
  "minusSign",
  "plusSign",
  "group"
]), bC = [
  0,
  4,
  2,
  1,
  11,
  20,
  3,
  7,
  100,
  21,
  0.1,
  1.1
];
function yC(e, t, n, r) {
  var a, i, o, s;
  let l = new Intl.NumberFormat(e, {
    ...n,
    // Resets so we get the full range of symbols
    minimumSignificantDigits: 1,
    maximumSignificantDigits: 21,
    roundingIncrement: 1,
    roundingPriority: "auto",
    roundingMode: "halfExpand"
  }), c = l.formatToParts(-10000.111), d = l.formatToParts(10000.111), f = bC.map((T) => l.formatToParts(T));
  var m;
  let h = (m = (a = c.find((T) => T.type === "minusSign")) === null || a === void 0 ? void 0 : a.value) !== null && m !== void 0 ? m : "-", p = (i = d.find((T) => T.type === "plusSign")) === null || i === void 0 ? void 0 : i.value;
  !p && (r?.signDisplay === "exceptZero" || r?.signDisplay === "always") && (p = "+");
  let v = (o = new Intl.NumberFormat(e, {
    ...n,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).formatToParts(1e-3).find((T) => T.type === "decimal")) === null || o === void 0 ? void 0 : o.value, b = (s = c.find((T) => T.type === "group")) === null || s === void 0 ? void 0 : s.value, x = c.filter((T) => !tf.has(T.type)).map((T) => nf(T.value)), C = f.flatMap((T) => T.filter((M) => !tf.has(M.type)).map((M) => nf(M.value))), w = [
    .../* @__PURE__ */ new Set([
      ...x,
      ...C
    ])
  ].sort((T, M) => M.length - T.length), E = w.length === 0 ? new RegExp("[\\p{White_Space}]", "gu") : new RegExp(`${w.join("|")}|[\\p{White_Space}]`, "gu"), k = [
    ...new Intl.NumberFormat(n.locale, {
      useGrouping: !1
    }).format(9876543210)
  ].reverse(), A = new Map(k.map((T, M) => [
    T,
    M
  ])), P = new RegExp(`[${k.join("")}]`, "g");
  return {
    minusSign: h,
    plusSign: p,
    decimal: v,
    group: b,
    literals: E,
    numeral: P,
    index: (T) => String(A.get(T))
  };
}
function $n(e, t, n) {
  return e.replaceAll ? e.replaceAll(t, n) : e.split(t).join(n);
}
function nf(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
let Vo = /* @__PURE__ */ new Map();
function xC(e) {
  let { locale: t } = Nt(), n = t + (e ? Object.entries(e).sort((a, i) => a[0] < i[0] ? -1 : 1).join() : "");
  if (Vo.has(n)) return Vo.get(n);
  let r = new Intl.Collator(t, e);
  return Vo.set(n, r), r;
}
function wC(e) {
  let t = xC({
    usage: "search",
    ...e
  }), n = G((i, o) => o.length === 0 ? !0 : (i = i.normalize("NFC"), o = o.normalize("NFC"), t.compare(i.slice(0, o.length), o) === 0), [
    t
  ]), r = G((i, o) => o.length === 0 ? !0 : (i = i.normalize("NFC"), o = o.normalize("NFC"), t.compare(i.slice(-o.length), o) === 0), [
    t
  ]), a = G((i, o) => {
    if (o.length === 0) return !0;
    i = i.normalize("NFC"), o = o.normalize("NFC");
    let s = 0, l = o.length;
    for (; s + l <= i.length; s++) {
      let c = i.slice(s, s + l);
      if (t.compare(o, c) === 0) return !0;
    }
    return !1;
  }, [
    t
  ]);
  return F(() => ({
    startsWith: n,
    endsWith: r,
    contains: a
  }), [
    n,
    r,
    a
  ]);
}
function ou(e) {
  let t = e;
  return t.nativeEvent = e, t.isDefaultPrevented = () => t.defaultPrevented, t.isPropagationStopped = () => t.cancelBubble, t.persist = () => {
  }, t;
}
function yg(e, t) {
  Object.defineProperty(e, "target", {
    value: t
  }), Object.defineProperty(e, "currentTarget", {
    value: t
  });
}
function xg(e) {
  let t = B({
    isFocused: !1,
    observer: null
  });
  return Ke(() => {
    const n = t.current;
    return () => {
      n.observer && (n.observer.disconnect(), n.observer = null);
    };
  }, []), G((n) => {
    let r = q(n);
    if (r instanceof HTMLButtonElement || r instanceof HTMLInputElement || r instanceof HTMLTextAreaElement || r instanceof HTMLSelectElement) {
      t.current.isFocused = !0;
      let a = r, i = (o) => {
        if (t.current.isFocused = !1, a.disabled) {
          let s = ou(o);
          e?.(s);
        }
        t.current.observer && (t.current.observer.disconnect(), t.current.observer = null);
      };
      a.addEventListener("focusout", i, {
        once: !0
      }), t.current.observer = new MutationObserver(() => {
        if (t.current.isFocused && a.disabled) {
          var o;
          (o = t.current.observer) === null || o === void 0 || o.disconnect();
          let s = a === st() ? null : st();
          a.dispatchEvent(new FocusEvent("blur", {
            relatedTarget: s
          })), a.dispatchEvent(new FocusEvent("focusout", {
            bubbles: !0,
            relatedTarget: s
          }));
        }
      }), t.current.observer.observe(a, {
        attributes: !0,
        attributeFilter: [
          "disabled"
        ]
      });
    }
  }, [
    e
  ]);
}
let fi = !1;
function rf(e) {
  for (; e && !Np(e); ) e = e.parentElement;
  let t = Oe(e), n = t.document.activeElement;
  if (!n || n === e) return;
  fi = !0;
  let r = !1, a = (d) => {
    (q(d) === n || r) && d.stopImmediatePropagation();
  }, i = (d) => {
    (q(d) === n || r) && (d.stopImmediatePropagation(), !e && !r && (r = !0, Hn(n), l()));
  }, o = (d) => {
    (q(d) === e || r) && d.stopImmediatePropagation();
  }, s = (d) => {
    (q(d) === e || r) && (d.stopImmediatePropagation(), r || (r = !0, Hn(n), l()));
  };
  t.addEventListener("blur", a, !0), t.addEventListener("focusout", i, !0), t.addEventListener("focusin", s, !0), t.addEventListener("focus", o, !0);
  let l = () => {
    cancelAnimationFrame(c), t.removeEventListener("blur", a, !0), t.removeEventListener("focusout", i, !0), t.removeEventListener("focusin", s, !0), t.removeEventListener("focus", o, !0), fi = !1, r = !1;
  }, c = requestAnimationFrame(l);
  return l;
}
let An = "default", Ms = "", Ka = /* @__PURE__ */ new WeakMap();
function af(e) {
  if (na()) {
    if (An === "default") {
      const t = me(e);
      Ms = t.documentElement.style.webkitUserSelect, t.documentElement.style.webkitUserSelect = "none";
    }
    An = "disabled";
  } else if (e instanceof HTMLElement || e instanceof SVGElement) {
    let t = "userSelect" in e.style ? "userSelect" : "webkitUserSelect";
    Ka.set(e, e.style[t]), e.style[t] = "none";
  }
}
function Bo(e) {
  if (na()) {
    if (An !== "disabled") return;
    An = "restoring", setTimeout(() => {
      Tp(() => {
        if (An === "restoring") {
          const t = me(e);
          t.documentElement.style.webkitUserSelect === "none" && (t.documentElement.style.webkitUserSelect = Ms || ""), Ms = "", An = "default";
        }
      });
    }, 300);
  } else if ((e instanceof HTMLElement || e instanceof SVGElement) && e && Ka.has(e)) {
    let t = Ka.get(e), n = "userSelect" in e.style ? "userSelect" : "webkitUserSelect";
    e.style[n] === "none" && (e.style[n] = t), e.getAttribute("style") === "" && e.removeAttribute("style"), Ka.delete(e);
  }
}
const wg = W.createContext({
  register: () => {
  }
});
wg.displayName = "PressResponderContext";
function $C(e, t) {
  return t.get ? t.get.call(e) : t.value;
}
function $g(e, t, n) {
  if (!t.has(e)) throw new TypeError("attempted to " + n + " private field on non-instance");
  return t.get(e);
}
function DC(e, t) {
  var n = $g(e, t, "get");
  return $C(e, n);
}
function CC(e, t, n) {
  if (t.set) t.set.call(e, n);
  else {
    if (!t.writable)
      throw new TypeError("attempted to set read only private field");
    t.value = n;
  }
}
function of(e, t, n) {
  var r = $g(e, t, "set");
  return CC(e, r, n), n;
}
function EC(e) {
  let t = ee(wg);
  if (t) {
    let { register: n, ref: r, ...a } = t;
    e = lt(a, e), n();
  }
  return HD(t, e.ref), e;
}
var Pa = /* @__PURE__ */ new WeakMap();
class ka {
  continuePropagation() {
    of(this, Pa, !1);
  }
  get shouldStopPropagation() {
    return DC(this, Pa);
  }
  constructor(t, n, r, a) {
    la(this, Pa, {
      writable: !0,
      value: void 0
    }), of(this, Pa, !0);
    var i;
    let o = (i = a?.target) !== null && i !== void 0 ? i : r.currentTarget;
    const s = o?.getBoundingClientRect();
    let l, c = 0, d, f = null;
    r.clientX != null && r.clientY != null && (d = r.clientX, f = r.clientY), s && (d != null && f != null ? (l = d - s.left, c = f - s.top) : (l = s.width / 2, c = s.height / 2)), this.type = t, this.pointerType = n, this.target = r.currentTarget, this.shiftKey = r.shiftKey, this.metaKey = r.metaKey, this.ctrlKey = r.ctrlKey, this.altKey = r.altKey, this.x = l, this.y = c, this.key = r.key;
  }
}
const sf = Symbol("linkClicked"), lf = "react-aria-pressable-style", uf = "data-react-aria-pressable";
function SC(e) {
  let { onPress: t, onPressChange: n, onPressStart: r, onPressEnd: a, onPressUp: i, onClick: o, isDisabled: s, isPressed: l, preventFocusOnPress: c, shouldCancelOnPointerExit: d, allowTextSelectionOnPress: f, ref: m, ...h } = EC(e), [p, g] = _(!1), v = B({
    isPressed: !1,
    ignoreEmulatedMouseEvents: !1,
    didFirePressStart: !1,
    isTriggeringEvent: !1,
    activePointerId: null,
    target: null,
    isOverTarget: !1,
    pointerType: null,
    disposables: []
  }), { addGlobalListener: b, removeAllGlobalListeners: x, removeGlobalListener: C } = _i(), w = G((S, $) => {
    let D = v.current;
    if (s || D.didFirePressStart) return !1;
    let N = !0;
    if (D.isTriggeringEvent = !0, r) {
      let I = new ka("pressstart", $, S);
      r(I), N = I.shouldStopPropagation;
    }
    return n && n(!0), D.isTriggeringEvent = !1, D.didFirePressStart = !0, g(!0), N;
  }, [
    s,
    r,
    n
  ]), E = G((S, $, D = !0) => {
    let N = v.current;
    if (!N.didFirePressStart) return !1;
    N.didFirePressStart = !1, N.isTriggeringEvent = !0;
    let I = !0;
    if (a) {
      let H = new ka("pressend", $, S);
      a(H), I = H.shouldStopPropagation;
    }
    if (n && n(!1), g(!1), t && D && !s) {
      let H = new ka("press", $, S);
      t(H), I && (I = H.shouldStopPropagation);
    }
    return N.isTriggeringEvent = !1, I;
  }, [
    s,
    a,
    n,
    t
  ]), k = Ne(E), A = G((S, $) => {
    let D = v.current;
    if (s) return !1;
    if (i) {
      D.isTriggeringEvent = !0;
      let N = new ka("pressup", $, S);
      return i(N), D.isTriggeringEvent = !1, N.shouldStopPropagation;
    }
    return !0;
  }, [
    s,
    i
  ]), P = Ne(A), j = G((S) => {
    let $ = v.current;
    if ($.isPressed && $.target) {
      $.didFirePressStart && $.pointerType != null && E(Yt($.target, S), $.pointerType, !1), $.isPressed = !1, K(null), $.isOverTarget = !1, $.activePointerId = null, $.pointerType = null, x(), f || Bo($.target);
      for (let D of $.disposables) D();
      $.disposables = [];
    }
  }, [
    f,
    x,
    E
  ]), T = Ne(j), M = G((S) => {
    d && j(S);
  }, [
    d,
    j
  ]), L = G((S) => {
    s || o?.(S);
  }, [
    s,
    o
  ]), O = G((S, $) => {
    if (!s && o) {
      let D = new MouseEvent("click", S);
      yg(D, $), o(ou(D));
    }
  }, [
    s,
    o
  ]), Z = Ne(O), [Q, J] = _(!1);
  Ke(() => {
    let S = v.current;
    if (Q) {
      let $ = (H) => {
        var ne;
        if (S.isPressed && S.target && Lo(H, S.target)) {
          var X;
          ff(q(H), H.key) && H.preventDefault();
          let le = q(H), V = ae(S.target, le);
          k(Yt(S.target, H), "keyboard", V), V && Z(H, S.target), x(), H.key !== "Enter" && su(S.target) && ae(S.target, le) && !H[sf] && (H[sf] = !0, on(S.target, H, !1)), S.isPressed = !1, J(!1), (X = S.metaKeyEvents) === null || X === void 0 || X.delete(H.key);
        } else if (H.key === "Meta" && (!((ne = S.metaKeyEvents) === null || ne === void 0) && ne.size)) {
          var oe;
          let le = S.metaKeyEvents;
          S.metaKeyEvents = void 0;
          for (let V of le.values()) (oe = S.target) === null || oe === void 0 || oe.dispatchEvent(new KeyboardEvent("keyup", V));
        }
      }, D = S.target, I = Dp((H) => {
        D && Lo(H, D) && !H.repeat && ae(D, q(H)) && S.target && P(Yt(S.target, H), "keyboard");
      }, $);
      return b(me(S.target), "keyup", I, !0), () => {
        C(me(S.target), "keyup", I, !0);
      };
    }
  }, [
    Q,
    b,
    x,
    C
  ]);
  let [Y, K] = _(null);
  Ke(() => {
    let S = v.current;
    if (Y === "pointer") {
      let $ = (N) => {
        if (N.pointerId === S.activePointerId && S.isPressed && N.button === 0 && S.target) {
          if (ae(S.target, q(N)) && S.pointerType != null) {
            let I = !1, H = setTimeout(() => {
              S.isPressed && S.target instanceof HTMLElement && (I ? T(N) : (Hn(S.target), S.target.click()));
            }, 80);
            N.currentTarget && b(N.currentTarget, "click", () => I = !0, !0), S.disposables.push(() => clearTimeout(H));
          } else T(N);
          S.isOverTarget = !1;
        }
      }, D = (N) => {
        T(N);
      };
      return b(me(S.target), "pointerup", $, !1), b(me(S.target), "pointercancel", D, !1), () => {
        C(me(S.target), "pointerup", $, !1), C(me(S.target), "pointercancel", D, !1);
      };
    } else if (Y === "mouse" && process.env.NODE_ENV === "test") {
      let $ = (D) => {
        if (D.button === 0) {
          if (S.ignoreEmulatedMouseEvents) {
            S.ignoreEmulatedMouseEvents = !1;
            return;
          }
          S.target && ae(S.target, D.target) && S.pointerType != null || T(D), S.isOverTarget = !1;
        }
      };
      return b(me(S.target), "mouseup", $, !1), () => {
        C(me(S.target), "mouseup", $, !1);
      };
    } else if (Y === "touch" && process.env.NODE_ENV === "test") {
      let $ = (D) => {
        S.isPressed && ae(q(D), S.target) && T({
          currentTarget: S.target,
          shiftKey: !1,
          ctrlKey: !1,
          metaKey: !1,
          altKey: !1
        });
      };
      return b(Oe(S.target), "scroll", $, !0), () => {
        C(Oe(S.target), "scroll", $, !0);
      };
    }
  }, [
    Y,
    b,
    C
  ]);
  let te = F(() => {
    let S = v.current, $ = {
      onKeyDown(D) {
        if (Lo(D.nativeEvent, D.currentTarget) && ae(D.currentTarget, q(D))) {
          var N;
          ff(q(D), D.key) && D.preventDefault();
          let I = !0;
          !S.isPressed && !D.repeat && (S.target = D.currentTarget, S.isPressed = !0, J(!0), S.pointerType = "keyboard", I = w(D, "keyboard")), I && D.stopPropagation(), D.metaKey && an() && ((N = S.metaKeyEvents) === null || N === void 0 || N.set(D.key, D.nativeEvent));
        } else D.key === "Meta" && (S.metaKeyEvents = /* @__PURE__ */ new Map());
      },
      onClick(D) {
        if (!(D && !ae(D.currentTarget, q(D))) && D && D.button === 0 && !S.isTriggeringEvent && !on.isOpening) {
          let N = !0;
          if (s && D.preventDefault(), !S.ignoreEmulatedMouseEvents && !S.isPressed && (S.pointerType === "virtual" || $s(D.nativeEvent))) {
            let I = w(D, "virtual"), H = A(D, "virtual"), ne = E(D, "virtual");
            L(D), N = I && H && ne;
          } else if (S.isPressed && S.pointerType !== "keyboard") {
            let I = S.pointerType || D.nativeEvent.pointerType || "virtual", H = A(Yt(D.currentTarget, D), I), ne = E(Yt(D.currentTarget, D), I, !0);
            N = H && ne, S.isOverTarget = !1, L(D), j(D);
          }
          S.ignoreEmulatedMouseEvents = !1, N && D.stopPropagation();
        }
      }
    };
    return typeof PointerEvent < "u" ? ($.onPointerDown = (D) => {
      if (D.button !== 0 || !ae(D.currentTarget, q(D))) return;
      if (qD(D.nativeEvent)) {
        S.pointerType = "virtual";
        return;
      }
      S.pointerType = D.pointerType;
      let N = !0;
      if (!S.isPressed) {
        S.isPressed = !0, K("pointer"), S.isOverTarget = !0, S.activePointerId = D.pointerId, S.target = D.currentTarget, f || af(S.target), N = w(D, S.pointerType);
        let I = q(D);
        "releasePointerCapture" in I && ("hasPointerCapture" in I ? I.hasPointerCapture(D.pointerId) && I.releasePointerCapture(D.pointerId) : I.releasePointerCapture(D.pointerId));
      }
      N && D.stopPropagation();
    }, $.onMouseDown = (D) => {
      if (ae(D.currentTarget, q(D)) && D.button === 0) {
        if (c) {
          let N = rf(D.target);
          N && S.disposables.push(N);
        }
        D.stopPropagation();
      }
    }, $.onPointerUp = (D) => {
      !ae(D.currentTarget, q(D)) || S.pointerType === "virtual" || D.button === 0 && !S.isPressed && A(D, S.pointerType || D.pointerType);
    }, $.onPointerEnter = (D) => {
      D.pointerId === S.activePointerId && S.target && !S.isOverTarget && S.pointerType != null && (S.isOverTarget = !0, w(Yt(S.target, D), S.pointerType));
    }, $.onPointerLeave = (D) => {
      D.pointerId === S.activePointerId && S.target && S.isOverTarget && S.pointerType != null && (S.isOverTarget = !1, E(Yt(S.target, D), S.pointerType, !1), M(D));
    }, $.onDragStart = (D) => {
      ae(D.currentTarget, q(D)) && j(D);
    }) : process.env.NODE_ENV === "test" && ($.onMouseDown = (D) => {
      if (D.button !== 0 || !ae(D.currentTarget, q(D))) return;
      if (S.ignoreEmulatedMouseEvents) {
        D.stopPropagation();
        return;
      }
      if (S.isPressed = !0, K("mouse"), S.isOverTarget = !0, S.target = D.currentTarget, S.pointerType = $s(D.nativeEvent) ? "virtual" : "mouse", Rb(() => w(D, S.pointerType)) && D.stopPropagation(), c) {
        let I = rf(D.target);
        I && S.disposables.push(I);
      }
    }, $.onMouseEnter = (D) => {
      if (!ae(D.currentTarget, q(D))) return;
      let N = !0;
      S.isPressed && !S.ignoreEmulatedMouseEvents && S.pointerType != null && (S.isOverTarget = !0, N = w(D, S.pointerType)), N && D.stopPropagation();
    }, $.onMouseLeave = (D) => {
      if (!ae(D.currentTarget, q(D))) return;
      let N = !0;
      S.isPressed && !S.ignoreEmulatedMouseEvents && S.pointerType != null && (S.isOverTarget = !1, N = E(D, S.pointerType, !1), M(D)), N && D.stopPropagation();
    }, $.onMouseUp = (D) => {
      ae(D.currentTarget, q(D)) && !S.ignoreEmulatedMouseEvents && D.button === 0 && !S.isPressed && A(D, S.pointerType || "mouse");
    }, $.onTouchStart = (D) => {
      if (!ae(D.currentTarget, q(D))) return;
      let N = TC(D.nativeEvent);
      if (!N) return;
      S.activePointerId = N.identifier, S.ignoreEmulatedMouseEvents = !0, S.isOverTarget = !0, S.isPressed = !0, K("touch"), S.target = D.currentTarget, S.pointerType = "touch", f || af(S.target), w(Vt(S.target, D), S.pointerType) && D.stopPropagation();
    }, $.onTouchMove = (D) => {
      if (!ae(D.currentTarget, q(D))) return;
      if (!S.isPressed) {
        D.stopPropagation();
        return;
      }
      let N = cf(D.nativeEvent, S.activePointerId), I = !0;
      N && df(N, D.currentTarget) ? !S.isOverTarget && S.pointerType != null && (S.isOverTarget = !0, I = w(Vt(S.target, D), S.pointerType)) : S.isOverTarget && S.pointerType != null && (S.isOverTarget = !1, I = E(Vt(S.target, D), S.pointerType, !1), M(Vt(S.target, D))), I && D.stopPropagation();
    }, $.onTouchEnd = (D) => {
      if (!ae(D.currentTarget, q(D))) return;
      if (!S.isPressed) {
        D.stopPropagation();
        return;
      }
      let N = cf(D.nativeEvent, S.activePointerId), I = !0;
      N && df(N, D.currentTarget) && S.pointerType != null ? (A(Vt(S.target, D), S.pointerType), I = E(Vt(S.target, D), S.pointerType), O(D.nativeEvent, S.target)) : S.isOverTarget && S.pointerType != null && (I = E(Vt(S.target, D), S.pointerType, !1)), I && D.stopPropagation(), S.isPressed = !1, K(null), S.activePointerId = null, S.isOverTarget = !1, S.ignoreEmulatedMouseEvents = !0, S.target && !f && Bo(S.target), x();
    }, $.onTouchCancel = (D) => {
      ae(D.currentTarget, q(D)) && (D.stopPropagation(), S.isPressed && j(Vt(S.target, D)));
    }, $.onDragStart = (D) => {
      ae(D.currentTarget, q(D)) && j(D);
    }), $;
  }, [
    s,
    c,
    x,
    f,
    j,
    M,
    E,
    w,
    A,
    L,
    O
  ]);
  return U(() => {
    if (!m || process.env.NODE_ENV === "test") return;
    const S = me(m.current);
    if (!S || !S.head || S.getElementById(lf)) return;
    const $ = S.createElement("style");
    $.id = lf, $.textContent = `
@layer {
  [${uf}] {
    touch-action: pan-x pan-y pinch-zoom;
  }
}
    `.trim(), S.head.prepend($);
  }, [
    m
  ]), U(() => {
    let S = v.current;
    return () => {
      var $;
      f || Bo(($ = S.target) !== null && $ !== void 0 ? $ : void 0);
      for (let D of S.disposables) D();
      S.disposables = [];
    };
  }, [
    f
  ]), {
    isPressed: l || p,
    pressProps: lt(h, te, {
      [uf]: !0
    })
  };
}
function su(e) {
  return e.tagName === "A" && e.hasAttribute("href");
}
function Lo(e, t) {
  const { key: n, code: r } = e, a = t, i = a.getAttribute("role");
  return (n === "Enter" || n === " " || n === "Spacebar" || r === "Space") && !(a instanceof Oe(a).HTMLInputElement && !Dg(a, n) || a instanceof Oe(a).HTMLTextAreaElement || a.isContentEditable) && // Links should only trigger with Enter key
  !((i === "link" || !i && su(a)) && n !== "Enter");
}
function TC(e) {
  const { targetTouches: t } = e;
  return t.length > 0 ? t[0] : null;
}
function cf(e, t) {
  const n = e.changedTouches;
  for (let r = 0; r < n.length; r++) {
    const a = n[r];
    if (a.identifier === t) return a;
  }
  return null;
}
function Vt(e, t) {
  let n = 0, r = 0;
  return t.targetTouches && t.targetTouches.length === 1 && (n = t.targetTouches[0].clientX, r = t.targetTouches[0].clientY), {
    currentTarget: e,
    shiftKey: t.shiftKey,
    ctrlKey: t.ctrlKey,
    metaKey: t.metaKey,
    altKey: t.altKey,
    clientX: n,
    clientY: r
  };
}
function Yt(e, t) {
  let n = t.clientX, r = t.clientY;
  return {
    currentTarget: e,
    shiftKey: t.shiftKey,
    ctrlKey: t.ctrlKey,
    metaKey: t.metaKey,
    altKey: t.altKey,
    clientX: n,
    clientY: r,
    key: t.key
  };
}
function PC(e) {
  let t = 0, n = 0;
  return e.width !== void 0 ? t = e.width / 2 : e.radiusX !== void 0 && (t = e.radiusX), e.height !== void 0 ? n = e.height / 2 : e.radiusY !== void 0 && (n = e.radiusY), {
    top: e.clientY - n,
    right: e.clientX + t,
    bottom: e.clientY + n,
    left: e.clientX - t
  };
}
function kC(e, t) {
  return !(e.left > t.right || t.left > e.right || e.top > t.bottom || t.top > e.bottom);
}
function df(e, t) {
  let n = t.getBoundingClientRect(), r = PC(e);
  return kC(n, r);
}
function NC(e) {
  return e instanceof HTMLInputElement ? !1 : e instanceof HTMLButtonElement ? e.type !== "submit" && e.type !== "reset" : !su(e);
}
function ff(e, t) {
  return e instanceof HTMLInputElement ? !Dg(e, t) : NC(e);
}
const AC = /* @__PURE__ */ new Set([
  "checkbox",
  "radio",
  "range",
  "color",
  "file",
  "image",
  "button",
  "submit",
  "reset"
]);
function Dg(e, t) {
  return e.type === "checkbox" || e.type === "radio" ? t === " " : AC.has(e.type);
}
let mn = null;
const Rs = /* @__PURE__ */ new Set();
let Sr = /* @__PURE__ */ new Map(), ln = !1, Is = !1;
const jC = {
  Tab: !0,
  Escape: !0
};
function Gi(e, t) {
  for (let n of Rs) n(e, t);
}
function MC(e) {
  return !(e.metaKey || !an() && e.altKey || e.ctrlKey || e.key === "Control" || e.key === "Shift" || e.key === "Meta");
}
function mi(e) {
  ln = !0, !on.isOpening && MC(e) && (mn = "keyboard", Gi("keyboard", e));
}
function Ze(e) {
  mn = "pointer", "pointerType" in e && e.pointerType, (e.type === "mousedown" || e.type === "pointerdown") && (ln = !0, Gi("pointer", e));
}
function Cg(e) {
  !on.isOpening && $s(e) && (ln = !0, mn = "virtual");
}
function Eg(e) {
  q(e) === window || q(e) === document || fi || !e.isTrusted || (!ln && !Is && (mn = "virtual", Gi("virtual", e)), ln = !1, Is = !1);
}
function Sg() {
  fi || (ln = !1, Is = !0);
}
function Vs(e) {
  if (typeof window > "u" || typeof document > "u" || Sr.get(Oe(e))) return;
  const t = Oe(e), n = me(e);
  let r = t.HTMLElement.prototype.focus;
  t.HTMLElement.prototype.focus = function() {
    ln = !0, r.apply(this, arguments);
  }, n.addEventListener("keydown", mi, !0), n.addEventListener("keyup", mi, !0), n.addEventListener("click", Cg, !0), t.addEventListener("focus", Eg, !0), t.addEventListener("blur", Sg, !1), typeof PointerEvent < "u" ? (n.addEventListener("pointerdown", Ze, !0), n.addEventListener("pointermove", Ze, !0), n.addEventListener("pointerup", Ze, !0)) : process.env.NODE_ENV === "test" && (n.addEventListener("mousedown", Ze, !0), n.addEventListener("mousemove", Ze, !0), n.addEventListener("mouseup", Ze, !0)), t.addEventListener("beforeunload", () => {
    Tg(e);
  }, {
    once: !0
  }), Sr.set(t, {
    focus: r
  });
}
const Tg = (e, t) => {
  const n = Oe(e), r = me(e);
  t && r.removeEventListener("DOMContentLoaded", t), Sr.has(n) && (n.HTMLElement.prototype.focus = Sr.get(n).focus, r.removeEventListener("keydown", mi, !0), r.removeEventListener("keyup", mi, !0), r.removeEventListener("click", Cg, !0), n.removeEventListener("focus", Eg, !0), n.removeEventListener("blur", Sg, !1), typeof PointerEvent < "u" ? (r.removeEventListener("pointerdown", Ze, !0), r.removeEventListener("pointermove", Ze, !0), r.removeEventListener("pointerup", Ze, !0)) : process.env.NODE_ENV === "test" && (r.removeEventListener("mousedown", Ze, !0), r.removeEventListener("mousemove", Ze, !0), r.removeEventListener("mouseup", Ze, !0)), Sr.delete(n));
};
function RC(e) {
  const t = me(e);
  let n;
  return t.readyState !== "loading" ? Vs(e) : (n = () => {
    Vs(e);
  }, t.addEventListener("DOMContentLoaded", n)), () => Tg(e, n);
}
typeof document < "u" && RC();
function Bs() {
  return mn !== "pointer";
}
function IC() {
  return mn;
}
function VC(e) {
  mn = e, Gi(e, null);
}
const BC = /* @__PURE__ */ new Set([
  "checkbox",
  "radio",
  "range",
  "color",
  "file",
  "image",
  "button",
  "submit",
  "reset"
]);
function LC(e, t, n) {
  let r = me(n ? q(n) : void 0), a = n ? q(n) : void 0;
  const i = typeof window < "u" ? Oe(a).HTMLInputElement : HTMLInputElement, o = typeof window < "u" ? Oe(a).HTMLTextAreaElement : HTMLTextAreaElement, s = typeof window < "u" ? Oe(a).HTMLElement : HTMLElement, l = typeof window < "u" ? Oe(a).KeyboardEvent : KeyboardEvent;
  let c = st(r);
  return e = e || c instanceof i && !BC.has(c.type) || c instanceof o || c instanceof s && c.isContentEditable, !(e && t === "keyboard" && n instanceof l && !jC[n.key]);
}
function FC(e, t, n) {
  Vs(), U(() => {
    if (n?.enabled === !1) return;
    let r = (a, i) => {
      LC(!!n?.isTextInput, a, i) && e(Bs());
    };
    return Rs.add(r), () => {
      Rs.delete(r);
    };
  }, t);
}
function OC(e) {
  if (!e.isConnected) return;
  const t = me(e);
  if (IC() === "virtual") {
    let n = st(t);
    Tp(() => {
      const r = st(t);
      (r === n || r === t.body) && e.isConnected && Hn(e);
    });
  } else Hn(e);
}
function zC(e) {
  let { isDisabled: t, onFocus: n, onBlur: r, onFocusChange: a } = e;
  const i = G((l) => {
    if (q(l) === l.currentTarget)
      return r && r(l), a && a(!1), !0;
  }, [
    r,
    a
  ]), o = xg(i), s = G((l) => {
    let c = q(l);
    const d = me(c), f = d ? st(d) : st();
    c === l.currentTarget && c === f && (n && n(l), a && a(!0), o(l));
  }, [
    a,
    n,
    o
  ]);
  return {
    focusProps: {
      onFocus: !t && (n || a || r) ? s : void 0,
      onBlur: !t && (r || a) ? i : void 0
    }
  };
}
function lu(e) {
  let { isDisabled: t, onBlurWithin: n, onFocusWithin: r, onFocusWithinChange: a } = e, i = B({
    isFocusWithin: !1
  }), { addGlobalListener: o, removeAllGlobalListeners: s } = _i(), l = G((f) => {
    ae(f.currentTarget, q(f)) && i.current.isFocusWithin && !ae(f.currentTarget, f.relatedTarget) && (i.current.isFocusWithin = !1, s(), n && n(f), a && a(!1));
  }, [
    n,
    a,
    i,
    s
  ]), c = xg(l), d = G((f) => {
    if (!ae(f.currentTarget, q(f))) return;
    let m = q(f);
    const h = me(m), p = st(h);
    if (!i.current.isFocusWithin && p === m) {
      r && r(f), a && a(!0), i.current.isFocusWithin = !0, c(f);
      let g = f.currentTarget;
      o(h, "focus", (v) => {
        let b = q(v);
        if (i.current.isFocusWithin && !ae(g, b)) {
          let x = new h.defaultView.FocusEvent("blur", {
            relatedTarget: b
          });
          yg(x, g);
          let C = ou(x);
          l(C);
        }
      }, {
        capture: !0
      });
    }
  }, [
    r,
    a,
    c,
    o,
    l
  ]);
  return t ? {
    focusWithinProps: {
      // These cannot be null, that would conflict in mergeProps
      onFocus: void 0,
      onBlur: void 0
    }
  } : {
    focusWithinProps: {
      onFocus: d,
      onBlur: l
    }
  };
}
let hi = !1, Na = 0;
function Ls() {
  hi = !0, setTimeout(() => {
    hi = !1;
  }, 50);
}
function mf(e) {
  e.pointerType === "touch" && Ls();
}
function _C() {
  if (!(typeof document > "u"))
    return Na === 0 && (typeof PointerEvent < "u" ? document.addEventListener("pointerup", mf) : process.env.NODE_ENV === "test" && document.addEventListener("touchend", Ls)), Na++, () => {
      Na--, !(Na > 0) && (typeof PointerEvent < "u" ? document.removeEventListener("pointerup", mf) : process.env.NODE_ENV === "test" && document.removeEventListener("touchend", Ls));
    };
}
function uu(e) {
  let { onHoverStart: t, onHoverChange: n, onHoverEnd: r, isDisabled: a } = e, [i, o] = _(!1), s = B({
    isHovered: !1,
    ignoreEmulatedMouseEvents: !1,
    pointerType: "",
    target: null
  }).current;
  U(_C, []);
  let { addGlobalListener: l, removeAllGlobalListeners: c } = _i(), { hoverProps: d, triggerHoverEnd: f } = F(() => {
    let m = (g, v) => {
      if (s.pointerType = v, a || v === "touch" || s.isHovered || !ae(g.currentTarget, q(g))) return;
      s.isHovered = !0;
      let b = g.currentTarget;
      s.target = b, l(me(q(g)), "pointerover", (x) => {
        s.isHovered && s.target && !ae(s.target, q(x)) && h(x, x.pointerType);
      }, {
        capture: !0
      }), t && t({
        type: "hoverstart",
        target: b,
        pointerType: v
      }), n && n(!0), o(!0);
    }, h = (g, v) => {
      let b = s.target;
      s.pointerType = "", s.target = null, !(v === "touch" || !s.isHovered || !b) && (s.isHovered = !1, c(), r && r({
        type: "hoverend",
        target: b,
        pointerType: v
      }), n && n(!1), o(!1));
    }, p = {};
    return typeof PointerEvent < "u" ? (p.onPointerEnter = (g) => {
      hi && g.pointerType === "mouse" || m(g, g.pointerType);
    }, p.onPointerLeave = (g) => {
      !a && ae(g.currentTarget, q(g)) && h(g, g.pointerType);
    }) : process.env.NODE_ENV === "test" && (p.onTouchStart = () => {
      s.ignoreEmulatedMouseEvents = !0;
    }, p.onMouseEnter = (g) => {
      !s.ignoreEmulatedMouseEvents && !hi && m(g, "mouse"), s.ignoreEmulatedMouseEvents = !1;
    }, p.onMouseLeave = (g) => {
      !a && ae(g.currentTarget, q(g)) && h(g, "mouse");
    }), {
      hoverProps: p,
      triggerHoverEnd: h
    };
  }, [
    t,
    n,
    r,
    a,
    s,
    l,
    c
  ]);
  return U(() => {
    a && f({
      currentTarget: s.target
    }, s.pointerType);
  }, [
    a
  ]), {
    hoverProps: d,
    isHovered: i
  };
}
function UC(e) {
  if (!e.form)
    return Array.from(me(e).querySelectorAll(`input[type="radio"][name="${CSS.escape(e.name)}"]`)).filter((r) => !r.form);
  const t = e.form.elements.namedItem(e.name);
  let n = Oe(e);
  return t instanceof n.RadioNodeList ? Array.from(t).filter((r) => r instanceof n.HTMLInputElement) : t instanceof n.HTMLInputElement ? [
    t
  ] : [];
}
function HC(e) {
  if (e.checked) return !0;
  const t = UC(e);
  return t.length > 0 && !t.some((n) => n.checked);
}
function Pg(e, t) {
  return !e || !t ? !1 : t.some((n) => ae(n, e));
}
function dr(e, t = !1) {
  if (e != null && !t) try {
    OC(e);
  } catch {
  }
  else if (e != null) try {
    e.focus();
  } catch {
  }
}
function jn(e, t, n) {
  let r = t?.tabbable ? r2 : Np, a = e?.nodeType === Node.ELEMENT_NODE ? e : null, i = me(a), o = ND(i, e || i, NodeFilter.SHOW_ELEMENT, {
    acceptNode(s) {
      return ae(t?.from, s) || t?.tabbable && s.tagName === "INPUT" && s.getAttribute("type") === "radio" && (!HC(s) || o.currentNode.tagName === "INPUT" && o.currentNode.type === "radio" && o.currentNode.name === s.name) ? NodeFilter.FILTER_REJECT : r(s) && (!n || Pg(s, n)) && (!t?.accept || t.accept(s)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  return t?.from && (o.currentNode = t.from), o;
}
function kg(e, t = {}) {
  return {
    focusNext(n = {}) {
      let r = e.current;
      if (!r) return null;
      let { from: a, tabbable: i = t.tabbable, wrap: o = t.wrap, accept: s = t.accept } = n, l = a || st(me(r)), c = jn(r, {
        tabbable: i,
        accept: s
      });
      ae(r, l) && (c.currentNode = l);
      let d = c.nextNode();
      return !d && o && (c.currentNode = r, d = c.nextNode()), d && dr(d, !0), d;
    },
    focusPrevious(n = t) {
      let r = e.current;
      if (!r) return null;
      let { from: a, tabbable: i = t.tabbable, wrap: o = t.wrap, accept: s = t.accept } = n, l = a || st(me(r)), c = jn(r, {
        tabbable: i,
        accept: s
      });
      if (ae(r, l)) c.currentNode = l;
      else {
        let f = Fo(c);
        return f && dr(f, !0), f ?? null;
      }
      let d = c.previousNode();
      if (!d && o) {
        c.currentNode = r;
        let f = Fo(c);
        if (!f)
          return null;
        d = f;
      }
      return d && dr(d, !0), d ?? null;
    },
    focusFirst(n = t) {
      let r = e.current;
      if (!r) return null;
      let { tabbable: a = t.tabbable, accept: i = t.accept } = n, s = jn(r, {
        tabbable: a,
        accept: i
      }).nextNode();
      return s && dr(s, !0), s;
    },
    focusLast(n = t) {
      let r = e.current;
      if (!r) return null;
      let { tabbable: a = t.tabbable, accept: i = t.accept } = n, o = jn(r, {
        tabbable: a,
        accept: i
      }), s = Fo(o);
      return s && dr(s, !0), s ?? null;
    }
  };
}
function Fo(e) {
  let t, n;
  do
    n = e.lastChild(), n && (t = n);
  while (n);
  return t;
}
class cu {
  get size() {
    return this.fastMap.size;
  }
  getTreeNode(t) {
    return this.fastMap.get(t);
  }
  addTreeNode(t, n, r) {
    let a = this.fastMap.get(n ?? null);
    if (!a) return;
    let i = new hf({
      scopeRef: t
    });
    a.addChild(i), i.parent = a, this.fastMap.set(t, i), r && (i.nodeToRestore = r);
  }
  addNode(t) {
    this.fastMap.set(t.scopeRef, t);
  }
  removeTreeNode(t) {
    if (t === null) return;
    let n = this.fastMap.get(t);
    if (!n) return;
    let r = n.parent;
    for (let i of this.traverse()) i !== n && n.nodeToRestore && i.nodeToRestore && n.scopeRef && n.scopeRef.current && Pg(i.nodeToRestore, n.scopeRef.current) && (i.nodeToRestore = n.nodeToRestore);
    let a = n.children;
    r && (r.removeChild(n), a.size > 0 && a.forEach((i) => r && r.addChild(i))), this.fastMap.delete(n.scopeRef);
  }
  // Pre Order Depth First
  *traverse(t = this.root) {
    if (t.scopeRef != null && (yield t), t.children.size > 0) for (let n of t.children) yield* this.traverse(n);
  }
  clone() {
    var t;
    let n = new cu();
    var r;
    for (let a of this.traverse()) n.addTreeNode(a.scopeRef, (r = (t = a.parent) === null || t === void 0 ? void 0 : t.scopeRef) !== null && r !== void 0 ? r : null, a.nodeToRestore);
    return n;
  }
  constructor() {
    this.fastMap = /* @__PURE__ */ new Map(), this.root = new hf({
      scopeRef: null
    }), this.fastMap.set(null, this.root);
  }
}
class hf {
  addChild(t) {
    this.children.add(t), t.parent = this;
  }
  removeChild(t) {
    this.children.delete(t), t.parent = void 0;
  }
  constructor(t) {
    this.children = /* @__PURE__ */ new Set(), this.contain = !1, this.scopeRef = t.scopeRef;
  }
}
new cu();
function du(e = {}) {
  let { autoFocus: t = !1, isTextInput: n, within: r } = e, a = B({
    isFocused: !1,
    isFocusVisible: t || Bs()
  }), [i, o] = _(!1), [s, l] = _(() => a.current.isFocused && a.current.isFocusVisible), c = G(() => l(a.current.isFocused && a.current.isFocusVisible), []), d = G((h) => {
    a.current.isFocused = h, a.current.isFocusVisible = Bs(), o(h), c();
  }, [
    c
  ]);
  FC((h) => {
    a.current.isFocusVisible = h, c();
  }, [
    n,
    i
  ], {
    enabled: i,
    isTextInput: n
  });
  let { focusProps: f } = zC({
    isDisabled: r,
    onFocusChange: d
  }), { focusWithinProps: m } = lu({
    isDisabled: !r,
    onFocusWithinChange: d
  });
  return {
    isFocused: i,
    isFocusVisible: s,
    focusProps: r ? m : f
  };
}
const pf = {
  border: 0,
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  width: "1px",
  whiteSpace: "nowrap"
};
function KC(e = {}) {
  let { style: t, isFocusable: n } = e, [r, a] = _(!1), { focusWithinProps: i } = lu({
    isDisabled: !n,
    onFocusWithinChange: (s) => a(s)
  }), o = F(() => r ? t : t ? {
    ...pf,
    ...t
  } : pf, [
    r
  ]);
  return {
    visuallyHiddenProps: {
      ...i,
      style: o
    }
  };
}
function WC(e) {
  let { id: t, label: n, "aria-labelledby": r, "aria-label": a, labelElementType: i = "label" } = e;
  t = zr(t);
  let o = zr(), s = {};
  n ? (r = r ? `${o} ${r}` : o, s = {
    id: o,
    htmlFor: i === "label" ? t : void 0
  }) : !r && !a && process.env.NODE_ENV !== "production" && console.warn("If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility");
  let l = Pp({
    id: t,
    "aria-label": a,
    "aria-labelledby": r
  });
  return {
    labelProps: s,
    fieldProps: l
  };
}
function GC(e) {
  let { description: t, errorMessage: n, isInvalid: r, validationState: a } = e, { labelProps: i, fieldProps: o } = WC(e), s = Cd([
    !!t,
    !!n,
    r,
    a
  ]), l = Cd([
    !!t,
    !!n,
    r,
    a
  ]);
  return o = lt(o, {
    "aria-describedby": [
      s,
      // Use aria-describedby for error message because aria-errormessage is unsupported using VoiceOver or NVDA. See https://github.com/adobe/react-spectrum/issues/1346#issuecomment-740136268
      l,
      e["aria-describedby"]
    ].filter(Boolean).join(" ") || void 0
  }), {
    labelProps: i,
    fieldProps: o,
    descriptionProps: {
      id: s
    },
    errorMessageProps: {
      id: l
    }
  };
}
const Ng = {
  badInput: !1,
  customError: !1,
  patternMismatch: !1,
  rangeOverflow: !1,
  rangeUnderflow: !1,
  stepMismatch: !1,
  tooLong: !1,
  tooShort: !1,
  typeMismatch: !1,
  valueMissing: !1,
  valid: !0
}, Ag = {
  ...Ng,
  customError: !0,
  valid: !1
}, fr = {
  isInvalid: !1,
  validationDetails: Ng,
  validationErrors: []
}, YC = fe({}), gf = "__formValidationState" + Date.now();
function qC(e) {
  if (e[gf]) {
    let { realtimeValidation: t, displayValidation: n, updateValidation: r, resetValidation: a, commitValidation: i } = e[gf];
    return {
      realtimeValidation: t,
      displayValidation: n,
      updateValidation: r,
      resetValidation: a,
      commitValidation: i
    };
  }
  return ZC(e);
}
function ZC(e) {
  let { isInvalid: t, validationState: n, name: r, value: a, builtinValidation: i, validate: o, validationBehavior: s = "aria" } = e;
  n && (t || (t = n === "invalid"));
  let l = t !== void 0 ? {
    isInvalid: t,
    validationErrors: [],
    validationDetails: Ag
  } : null, c = F(() => {
    if (!o || a == null) return null;
    let T = XC(o, a);
    return vf(T);
  }, [
    o,
    a
  ]);
  i?.validationDetails.valid && (i = void 0);
  let d = ee(YC), f = F(() => r ? Array.isArray(r) ? r.flatMap((T) => Fs(d[T])) : Fs(d[r]) : [], [
    d,
    r
  ]), [m, h] = _(d), [p, g] = _(!1);
  d !== m && (h(d), g(!1));
  let v = F(() => vf(p ? [] : f), [
    p,
    f
  ]), b = B(fr), [x, C] = _(fr), w = B(fr), E = () => {
    if (!k) return;
    A(!1);
    let T = c || i || b.current;
    Oo(T, w.current) || (w.current = T, C(T));
  }, [k, A] = _(!1);
  return U(E), {
    realtimeValidation: l || v || c || i || fr,
    displayValidation: s === "native" ? l || v || x : l || v || c || i || x,
    updateValidation(T) {
      s === "aria" && !Oo(x, T) ? C(T) : b.current = T;
    },
    resetValidation() {
      let T = fr;
      Oo(T, w.current) || (w.current = T, C(T)), s === "native" && A(!1), g(!0);
    },
    commitValidation() {
      s === "native" && A(!0), g(!0);
    }
  };
}
function Fs(e) {
  return e ? Array.isArray(e) ? e : [
    e
  ] : [];
}
function XC(e, t) {
  if (typeof e == "function") {
    let n = e(t);
    if (n && typeof n != "boolean") return Fs(n);
  }
  return [];
}
function vf(e) {
  return e.length ? {
    isInvalid: !0,
    validationErrors: e,
    validationDetails: Ag
  } : null;
}
function Oo(e, t) {
  return e === t ? !0 : !!e && !!t && e.isInvalid === t.isInvalid && e.validationErrors.length === t.validationErrors.length && e.validationErrors.every((n, r) => n === t.validationErrors[r]) && Object.entries(e.validationDetails).every(([n, r]) => t.validationDetails[n] === r);
}
function JC(e, t, n) {
  let { validationBehavior: r, focus: a } = e;
  Ke(() => {
    if (r === "native" && n?.current && !n.current.disabled) {
      let c = t.realtimeValidation.isInvalid ? t.realtimeValidation.validationErrors.join(" ") || "Invalid value." : "";
      n.current.setCustomValidity(c), n.current.hasAttribute("title") || (n.current.title = ""), t.realtimeValidation.isInvalid || t.updateValidation(e6(n.current));
    }
  });
  let i = B(!1), o = Ne(() => {
    i.current || t.resetValidation();
  }), s = Ne((c) => {
    var d;
    t.displayValidation.isInvalid || t.commitValidation();
    let f = n == null || (d = n.current) === null || d === void 0 ? void 0 : d.form;
    if (!c.defaultPrevented && n && f && t6(f) === n.current) {
      var m;
      a ? a() : (m = n.current) === null || m === void 0 || m.focus(), VC("keyboard");
    }
    c.preventDefault();
  }), l = Ne(() => {
    t.commitValidation();
  });
  U(() => {
    let c = n?.current;
    if (!c) return;
    let d = c.form, f = d?.reset;
    return d && (d.reset = () => {
      i.current = !window.event || window.event.type === "message" && q(window.event) instanceof MessagePort, f?.call(d), i.current = !1;
    }), c.addEventListener("invalid", s), c.addEventListener("change", l), d?.addEventListener("reset", o), () => {
      c.removeEventListener("invalid", s), c.removeEventListener("change", l), d?.removeEventListener("reset", o), d && (d.reset = f);
    };
  }, [
    n,
    r
  ]);
}
function QC(e) {
  let t = e.validity;
  return {
    badInput: t.badInput,
    customError: t.customError,
    patternMismatch: t.patternMismatch,
    rangeOverflow: t.rangeOverflow,
    rangeUnderflow: t.rangeUnderflow,
    stepMismatch: t.stepMismatch,
    tooLong: t.tooLong,
    tooShort: t.tooShort,
    typeMismatch: t.typeMismatch,
    valueMissing: t.valueMissing,
    valid: t.valid
  };
}
function e6(e) {
  return {
    isInvalid: !e.validity.valid,
    validationDetails: QC(e),
    validationErrors: e.validationMessage ? [
      e.validationMessage
    ] : []
  };
}
function t6(e) {
  for (let n = 0; n < e.elements.length; n++) {
    var t;
    let r = e.elements[n];
    if (((t = r.validity) === null || t === void 0 ? void 0 : t.valid) === !1) return r;
  }
  return null;
}
typeof HTMLTemplateElement < "u" && (Object.defineProperty(HTMLTemplateElement.prototype, "firstChild", {
  configurable: !0,
  enumerable: !0,
  get: function() {
    return this.content.firstChild;
  }
}), Object.defineProperty(HTMLTemplateElement.prototype, "appendChild", {
  configurable: !0,
  enumerable: !0,
  value: function(e) {
    return this.content.appendChild(e);
  }
}), Object.defineProperty(HTMLTemplateElement.prototype, "removeChild", {
  configurable: !0,
  enumerable: !0,
  value: function(e) {
    return this.content.removeChild(e);
  }
}), Object.defineProperty(HTMLTemplateElement.prototype, "insertBefore", {
  configurable: !0,
  enumerable: !0,
  value: function(e, t) {
    return this.content.insertBefore(e, t);
  }
}));
const n6 = /* @__PURE__ */ fe(!1);
function r6(e) {
  let t = (n, r) => ee(n6) ? null : e(n, r);
  return t.displayName = e.displayName || e.name, ut(t);
}
var jg = {};
jg = {
  Empty: "فارغ"
};
var Mg = {};
Mg = {
  Empty: "Изпразни"
};
var Rg = {};
Rg = {
  Empty: "Prázdné"
};
var Ig = {};
Ig = {
  Empty: "Tom"
};
var Vg = {};
Vg = {
  Empty: "Leer"
};
var Bg = {};
Bg = {
  Empty: "Άδειο"
};
var Lg = {};
Lg = {
  Empty: "Empty"
};
var Fg = {};
Fg = {
  Empty: "Vacío"
};
var Og = {};
Og = {
  Empty: "Tühjenda"
};
var zg = {};
zg = {
  Empty: "Tyhjä"
};
var _g = {};
_g = {
  Empty: "Vide"
};
var Ug = {};
Ug = {
  Empty: "ריק"
};
var Hg = {};
Hg = {
  Empty: "Prazno"
};
var Kg = {};
Kg = {
  Empty: "Üres"
};
var Wg = {};
Wg = {
  Empty: "Vuoto"
};
var Gg = {};
Gg = {
  Empty: "空"
};
var Yg = {};
Yg = {
  Empty: "비어 있음"
};
var qg = {};
qg = {
  Empty: "Tuščias"
};
var Zg = {};
Zg = {
  Empty: "Tukšs"
};
var Xg = {};
Xg = {
  Empty: "Tom"
};
var Jg = {};
Jg = {
  Empty: "Leeg"
};
var Qg = {};
Qg = {
  Empty: "Pusty"
};
var ev = {};
ev = {
  Empty: "Vazio"
};
var tv = {};
tv = {
  Empty: "Vazio"
};
var nv = {};
nv = {
  Empty: "Gol"
};
var rv = {};
rv = {
  Empty: "Не заполнено"
};
var av = {};
av = {
  Empty: "Prázdne"
};
var iv = {};
iv = {
  Empty: "Prazen"
};
var ov = {};
ov = {
  Empty: "Prazno"
};
var sv = {};
sv = {
  Empty: "Tomt"
};
var lv = {};
lv = {
  Empty: "Boş"
};
var uv = {};
uv = {
  Empty: "Пусто"
};
var cv = {};
cv = {
  Empty: "空"
};
var dv = {};
dv = {
  Empty: "空白"
};
var fv = {};
fv = {
  "ar-AE": jg,
  "bg-BG": Mg,
  "cs-CZ": Rg,
  "da-DK": Ig,
  "de-DE": Vg,
  "el-GR": Bg,
  "en-US": Lg,
  "es-ES": Fg,
  "et-EE": Og,
  "fi-FI": zg,
  "fr-FR": _g,
  "he-IL": Ug,
  "hr-HR": Hg,
  "hu-HU": Kg,
  "it-IT": Wg,
  "ja-JP": Gg,
  "ko-KR": Yg,
  "lt-LT": qg,
  "lv-LV": Zg,
  "nb-NO": Xg,
  "nl-NL": Jg,
  "pl-PL": Qg,
  "pt-BR": ev,
  "pt-PT": tv,
  "ro-RO": nv,
  "ru-RU": rv,
  "sk-SK": av,
  "sl-SI": iv,
  "sr-SP": ov,
  "sv-SE": sv,
  "tr-TR": lv,
  "uk-UA": uv,
  "zh-CN": cv,
  "zh-TW": dv
};
function a6(e) {
  return e && e.__esModule ? e.default : e;
}
const bf = () => {
};
function i6(e) {
  const t = B(void 0);
  let { value: n, textValue: r, minValue: a, maxValue: i, isDisabled: o, isReadOnly: s, isRequired: l, onIncrement: c, onIncrementPage: d, onDecrement: f, onDecrementPage: m, onDecrementToMin: h, onIncrementToMax: p } = e;
  const g = Fp(a6(fv), "@react-aria/spinbutton");
  let v = B(!1);
  const b = G(() => {
    clearTimeout(t.current), v.current = !1;
  }, []), x = Ne(() => {
    b();
  });
  U(() => () => x(), []);
  let C = (N) => {
    if (!(N.ctrlKey || N.metaKey || N.shiftKey || N.altKey || s || N.nativeEvent.isComposing))
      switch (N.key) {
        case "PageUp":
          if (d) {
            N.preventDefault(), d?.();
            break;
          }
        // fallthrough!
        case "ArrowUp":
        case "Up":
          c && (N.preventDefault(), c?.());
          break;
        case "PageDown":
          if (m) {
            N.preventDefault(), m?.();
            break;
          }
        // fallthrough
        case "ArrowDown":
        case "Down":
          f && (N.preventDefault(), f?.());
          break;
        case "Home":
          h && (N.preventDefault(), h?.());
          break;
        case "End":
          p && (N.preventDefault(), p?.());
          break;
      }
  }, w = B(!1), E = () => {
    w.current = !0;
  }, k = () => {
    w.current = !1;
  }, A = r === "" ? g.format("Empty") : (r || `${n}`).replace("-", "−");
  U(() => {
    w.current && (l2("assertive"), s2(A, "assertive"));
  }, [
    A
  ]);
  let P = G(() => {
    b();
  }, [
    b
  ]);
  const j = Ne(c ?? bf), T = Ne(f ?? bf), M = Ne(() => {
    (i === void 0 || isNaN(i) || n === void 0 || isNaN(n) || n < i) && (j(), L(60));
  }), L = Ne((N) => {
    x(), v.current = !0, t.current = window.setTimeout(M, N);
  }), O = Ne(() => {
    (a === void 0 || isNaN(a) || n === void 0 || isNaN(n) || n > a) && (T(), Z(60));
  }), Z = Ne((N) => {
    x(), v.current = !0, t.current = window.setTimeout(O, N);
  });
  let Q = (N) => {
    N.preventDefault();
  }, { addGlobalListener: J, removeAllGlobalListeners: Y } = _i(), K = B(!1), [te, S] = _(null);
  U(() => {
    te === "touch" ? L(600) : te && L(400);
  }, [
    te
  ]);
  let [$, D] = _(null);
  return U(() => {
    $ === "touch" ? Z(600) : $ && Z(400);
  }, [
    $
  ]), {
    spinButtonProps: {
      role: "spinbutton",
      "aria-valuenow": n !== void 0 && !isNaN(n) ? n : void 0,
      "aria-valuetext": A,
      "aria-valuemin": a,
      "aria-valuemax": i,
      "aria-disabled": o || void 0,
      "aria-readonly": s || void 0,
      "aria-required": l || void 0,
      onKeyDown: C,
      onFocus: E,
      onBlur: k
    },
    incrementButtonProps: {
      onPressStart: (N) => {
        b(), N.pointerType !== "touch" ? (c?.(), S("mouse")) : (J(window, "pointercancel", P, {
          capture: !0
        }), K.current = !1, S("touch")), J(window, "contextmenu", Q);
      },
      onPressUp: (N) => {
        b(), N.pointerType === "touch" && (K.current = !0), Y(), S(null);
      },
      onPressEnd: (N) => {
        b(), N.pointerType === "touch" && !v.current && K.current && c?.(), K.current = !1, S(null);
      },
      onFocus: E,
      onBlur: k
    },
    decrementButtonProps: {
      onPressStart: (N) => {
        b(), N.pointerType !== "touch" ? (f?.(), D("mouse")) : (J(window, "pointercancel", P, {
          capture: !0
        }), K.current = !1, D("touch"));
      },
      onPressUp: (N) => {
        b(), N.pointerType === "touch" && (K.current = !0), Y(), D(null);
      },
      onPressEnd: (N) => {
        b(), N.pointerType === "touch" && !v.current && K.current && f?.(), K.current = !1, D(null);
      },
      onFocus: E,
      onBlur: k
    }
  };
}
var mv = {};
mv = {
  calendar: "التقويم",
  day: "يوم",
  dayPeriod: "ص/م",
  endDate: "تاريخ الانتهاء",
  era: "العصر",
  hour: "الساعات",
  minute: "الدقائق",
  month: "الشهر",
  second: "الثواني",
  selectedDateDescription: (e) => `تاريخ محدد: ${e.date}`,
  selectedRangeDescription: (e) => `المدى الزمني المحدد: ${e.startDate} إلى ${e.endDate}`,
  selectedTimeDescription: (e) => `الوقت المحدد: ${e.time}`,
  startDate: "تاريخ البدء",
  timeZoneName: "التوقيت",
  weekday: "اليوم",
  year: "السنة"
};
var hv = {};
hv = {
  calendar: "Календар",
  day: "ден",
  dayPeriod: "пр.об./сл.об.",
  endDate: "Крайна дата",
  era: "ера",
  hour: "час",
  minute: "минута",
  month: "месец",
  second: "секунда",
  selectedDateDescription: (e) => `Избрана дата: ${e.date}`,
  selectedRangeDescription: (e) => `Избран диапазон: ${e.startDate} до ${e.endDate}`,
  selectedTimeDescription: (e) => `Избрано време: ${e.time}`,
  startDate: "Начална дата",
  timeZoneName: "часова зона",
  weekday: "ден от седмицата",
  year: "година"
};
var pv = {};
pv = {
  calendar: "Kalendář",
  day: "den",
  dayPeriod: "část dne",
  endDate: "Konečné datum",
  era: "letopočet",
  hour: "hodina",
  minute: "minuta",
  month: "měsíc",
  second: "sekunda",
  selectedDateDescription: (e) => `Vybrané datum: ${e.date}`,
  selectedRangeDescription: (e) => `Vybrané období: ${e.startDate} až ${e.endDate}`,
  selectedTimeDescription: (e) => `Vybraný čas: ${e.time}`,
  startDate: "Počáteční datum",
  timeZoneName: "časové pásmo",
  weekday: "den v týdnu",
  year: "rok"
};
var gv = {};
gv = {
  calendar: "Kalender",
  day: "dag",
  dayPeriod: "AM/PM",
  endDate: "Slutdato",
  era: "æra",
  hour: "time",
  minute: "minut",
  month: "måned",
  second: "sekund",
  selectedDateDescription: (e) => `Valgt dato: ${e.date}`,
  selectedRangeDescription: (e) => `Valgt interval: ${e.startDate} til ${e.endDate}`,
  selectedTimeDescription: (e) => `Valgt tidspunkt: ${e.time}`,
  startDate: "Startdato",
  timeZoneName: "tidszone",
  weekday: "ugedag",
  year: "år"
};
var vv = {};
vv = {
  calendar: "Kalender",
  day: "Tag",
  dayPeriod: "Tageshälfte",
  endDate: "Enddatum",
  era: "Epoche",
  hour: "Stunde",
  minute: "Minute",
  month: "Monat",
  second: "Sekunde",
  selectedDateDescription: (e) => `Ausgewähltes Datum: ${e.date}`,
  selectedRangeDescription: (e) => `Ausgewählter Bereich: ${e.startDate} bis ${e.endDate}`,
  selectedTimeDescription: (e) => `Ausgewählte Zeit: ${e.time}`,
  startDate: "Startdatum",
  timeZoneName: "Zeitzone",
  weekday: "Wochentag",
  year: "Jahr"
};
var bv = {};
bv = {
  calendar: "Ημερολόγιο",
  day: "ημέρα",
  dayPeriod: "π.μ./μ.μ.",
  endDate: "Ημερομηνία λήξης",
  era: "περίοδος",
  hour: "ώρα",
  minute: "λεπτό",
  month: "μήνας",
  second: "δευτερόλεπτο",
  selectedDateDescription: (e) => `Επιλεγμένη ημερομηνία: ${e.date}`,
  selectedRangeDescription: (e) => `Επιλεγμένο εύρος: ${e.startDate} έως ${e.endDate}`,
  selectedTimeDescription: (e) => `Επιλεγμένη ώρα: ${e.time}`,
  startDate: "Ημερομηνία έναρξης",
  timeZoneName: "ζώνη ώρας",
  weekday: "καθημερινή",
  year: "έτος"
};
var yv = {};
yv = {
  era: "era",
  year: "year",
  month: "month",
  day: "day",
  hour: "hour",
  minute: "minute",
  second: "second",
  dayPeriod: "AM/PM",
  calendar: "Calendar",
  startDate: "Start Date",
  endDate: "End Date",
  weekday: "day of the week",
  timeZoneName: "time zone",
  selectedDateDescription: (e) => `Selected Date: ${e.date}`,
  selectedRangeDescription: (e) => `Selected Range: ${e.startDate} to ${e.endDate}`,
  selectedTimeDescription: (e) => `Selected Time: ${e.time}`
};
var xv = {};
xv = {
  calendar: "Calendario",
  day: "día",
  dayPeriod: "a. m./p. m.",
  endDate: "Fecha final",
  era: "era",
  hour: "hora",
  minute: "minuto",
  month: "mes",
  second: "segundo",
  selectedDateDescription: (e) => `Fecha seleccionada: ${e.date}`,
  selectedRangeDescription: (e) => `Rango seleccionado: ${e.startDate} a ${e.endDate}`,
  selectedTimeDescription: (e) => `Hora seleccionada: ${e.time}`,
  startDate: "Fecha de inicio",
  timeZoneName: "zona horaria",
  weekday: "día de la semana",
  year: "año"
};
var wv = {};
wv = {
  calendar: "Kalender",
  day: "päev",
  dayPeriod: "enne/pärast lõunat",
  endDate: "Lõppkuupäev",
  era: "ajastu",
  hour: "tund",
  minute: "minut",
  month: "kuu",
  second: "sekund",
  selectedDateDescription: (e) => `Valitud kuupäev: ${e.date}`,
  selectedRangeDescription: (e) => `Valitud vahemik: ${e.startDate} kuni ${e.endDate}`,
  selectedTimeDescription: (e) => `Valitud aeg: ${e.time}`,
  startDate: "Alguskuupäev",
  timeZoneName: "ajavöönd",
  weekday: "nädalapäev",
  year: "aasta"
};
var $v = {};
$v = {
  calendar: "Kalenteri",
  day: "päivä",
  dayPeriod: "vuorokaudenaika",
  endDate: "Päättymispäivä",
  era: "aikakausi",
  hour: "tunti",
  minute: "minuutti",
  month: "kuukausi",
  second: "sekunti",
  selectedDateDescription: (e) => `Valittu päivämäärä: ${e.date}`,
  selectedRangeDescription: (e) => `Valittu aikaväli: ${e.startDate} – ${e.endDate}`,
  selectedTimeDescription: (e) => `Valittu aika: ${e.time}`,
  startDate: "Alkamispäivä",
  timeZoneName: "aikavyöhyke",
  weekday: "viikonpäivä",
  year: "vuosi"
};
var Dv = {};
Dv = {
  calendar: "Calendrier",
  day: "jour",
  dayPeriod: "cadran",
  endDate: "Date de fin",
  era: "ère",
  hour: "heure",
  minute: "minute",
  month: "mois",
  second: "seconde",
  selectedDateDescription: (e) => `Date sélectionnée : ${e.date}`,
  selectedRangeDescription: (e) => `Plage sélectionnée : ${e.startDate} au ${e.endDate}`,
  selectedTimeDescription: (e) => `Heure choisie : ${e.time}`,
  startDate: "Date de début",
  timeZoneName: "fuseau horaire",
  weekday: "jour de la semaine",
  year: "année"
};
var Cv = {};
Cv = {
  calendar: "לוח שנה",
  day: "יום",
  dayPeriod: "לפנה״צ/אחה״צ",
  endDate: "תאריך סיום",
  era: "תקופה",
  hour: "שעה",
  minute: "דקה",
  month: "חודש",
  second: "שנייה",
  selectedDateDescription: (e) => `תאריך נבחר: ${e.date}`,
  selectedRangeDescription: (e) => `טווח נבחר: ${e.startDate} עד ${e.endDate}`,
  selectedTimeDescription: (e) => `זמן נבחר: ${e.time}`,
  startDate: "תאריך התחלה",
  timeZoneName: "אזור זמן",
  weekday: "יום בשבוע",
  year: "שנה"
};
var Ev = {};
Ev = {
  calendar: "Kalendar",
  day: "dan",
  dayPeriod: "AM/PM",
  endDate: "Datum završetka",
  era: "era",
  hour: "sat",
  minute: "minuta",
  month: "mjesec",
  second: "sekunda",
  selectedDateDescription: (e) => `Odabrani datum: ${e.date}`,
  selectedRangeDescription: (e) => `Odabrani raspon: ${e.startDate} do ${e.endDate}`,
  selectedTimeDescription: (e) => `Odabrano vrijeme: ${e.time}`,
  startDate: "Datum početka",
  timeZoneName: "vremenska zona",
  weekday: "dan u tjednu",
  year: "godina"
};
var Sv = {};
Sv = {
  calendar: "Naptár",
  day: "nap",
  dayPeriod: "napszak",
  endDate: "Befejező dátum",
  era: "éra",
  hour: "óra",
  minute: "perc",
  month: "hónap",
  second: "másodperc",
  selectedDateDescription: (e) => `Kijelölt dátum: ${e.date}`,
  selectedRangeDescription: (e) => `Kijelölt tartomány: ${e.startDate}–${e.endDate}`,
  selectedTimeDescription: (e) => `Kijelölt idő: ${e.time}`,
  startDate: "Kezdő dátum",
  timeZoneName: "időzóna",
  weekday: "hét napja",
  year: "év"
};
var Tv = {};
Tv = {
  calendar: "Calendario",
  day: "giorno",
  dayPeriod: "AM/PM",
  endDate: "Data finale",
  era: "era",
  hour: "ora",
  minute: "minuto",
  month: "mese",
  second: "secondo",
  selectedDateDescription: (e) => `Data selezionata: ${e.date}`,
  selectedRangeDescription: (e) => `Intervallo selezionato: da ${e.startDate} a ${e.endDate}`,
  selectedTimeDescription: (e) => `Ora selezionata: ${e.time}`,
  startDate: "Data iniziale",
  timeZoneName: "fuso orario",
  weekday: "giorno della settimana",
  year: "anno"
};
var Pv = {};
Pv = {
  calendar: "カレンダー",
  day: "日",
  dayPeriod: "午前/午後",
  endDate: "終了日",
  era: "時代",
  hour: "時",
  minute: "分",
  month: "月",
  second: "秒",
  selectedDateDescription: (e) => `選択した日付 : ${e.date}`,
  selectedRangeDescription: (e) => `選択範囲 : ${e.startDate} から ${e.endDate}`,
  selectedTimeDescription: (e) => `選択した時間 : ${e.time}`,
  startDate: "開始日",
  timeZoneName: "タイムゾーン",
  weekday: "曜日",
  year: "年"
};
var kv = {};
kv = {
  calendar: "달력",
  day: "일",
  dayPeriod: "오전/오후",
  endDate: "종료일",
  era: "연호",
  hour: "시",
  minute: "분",
  month: "월",
  second: "초",
  selectedDateDescription: (e) => `선택 일자: ${e.date}`,
  selectedRangeDescription: (e) => `선택 범위: ${e.startDate} ~ ${e.endDate}`,
  selectedTimeDescription: (e) => `선택 시간: ${e.time}`,
  startDate: "시작일",
  timeZoneName: "시간대",
  weekday: "요일",
  year: "년"
};
var Nv = {};
Nv = {
  calendar: "Kalendorius",
  day: "diena",
  dayPeriod: "iki pietų / po pietų",
  endDate: "Pabaigos data",
  era: "era",
  hour: "valanda",
  minute: "minutė",
  month: "mėnuo",
  second: "sekundė",
  selectedDateDescription: (e) => `Pasirinkta data: ${e.date}`,
  selectedRangeDescription: (e) => `Pasirinktas intervalas: nuo ${e.startDate} iki ${e.endDate}`,
  selectedTimeDescription: (e) => `Pasirinktas laikas: ${e.time}`,
  startDate: "Pradžios data",
  timeZoneName: "laiko juosta",
  weekday: "savaitės diena",
  year: "metai"
};
var Av = {};
Av = {
  calendar: "Kalendārs",
  day: "diena",
  dayPeriod: "priekšpusdienā/pēcpusdienā",
  endDate: "Beigu datums",
  era: "ēra",
  hour: "stundas",
  minute: "minūtes",
  month: "mēnesis",
  second: "sekundes",
  selectedDateDescription: (e) => `Atlasītais datums: ${e.date}`,
  selectedRangeDescription: (e) => `Atlasītais diapazons: no ${e.startDate} līdz ${e.endDate}`,
  selectedTimeDescription: (e) => `Atlasītais laiks: ${e.time}`,
  startDate: "Sākuma datums",
  timeZoneName: "laika josla",
  weekday: "nedēļas diena",
  year: "gads"
};
var jv = {};
jv = {
  calendar: "Kalender",
  day: "dag",
  dayPeriod: "a.m./p.m.",
  endDate: "Sluttdato",
  era: "tidsalder",
  hour: "time",
  minute: "minutt",
  month: "måned",
  second: "sekund",
  selectedDateDescription: (e) => `Valgt dato: ${e.date}`,
  selectedRangeDescription: (e) => `Valgt område: ${e.startDate} til ${e.endDate}`,
  selectedTimeDescription: (e) => `Valgt tid: ${e.time}`,
  startDate: "Startdato",
  timeZoneName: "tidssone",
  weekday: "ukedag",
  year: "år"
};
var Mv = {};
Mv = {
  calendar: "Kalender",
  day: "dag",
  dayPeriod: "a.m./p.m.",
  endDate: "Einddatum",
  era: "tijdperk",
  hour: "uur",
  minute: "minuut",
  month: "maand",
  second: "seconde",
  selectedDateDescription: (e) => `Geselecteerde datum: ${e.date}`,
  selectedRangeDescription: (e) => `Geselecteerd bereik: ${e.startDate} tot ${e.endDate}`,
  selectedTimeDescription: (e) => `Geselecteerde tijd: ${e.time}`,
  startDate: "Startdatum",
  timeZoneName: "tijdzone",
  weekday: "dag van de week",
  year: "jaar"
};
var Rv = {};
Rv = {
  calendar: "Kalendarz",
  day: "dzień",
  dayPeriod: "rano / po południu / wieczorem",
  endDate: "Data końcowa",
  era: "era",
  hour: "godzina",
  minute: "minuta",
  month: "miesiąc",
  second: "sekunda",
  selectedDateDescription: (e) => `Wybrana data: ${e.date}`,
  selectedRangeDescription: (e) => `Wybrany zakres: ${e.startDate} do ${e.endDate}`,
  selectedTimeDescription: (e) => `Wybrany czas: ${e.time}`,
  startDate: "Data początkowa",
  timeZoneName: "strefa czasowa",
  weekday: "dzień tygodnia",
  year: "rok"
};
var Iv = {};
Iv = {
  calendar: "Calendário",
  day: "dia",
  dayPeriod: "AM/PM",
  endDate: "Data final",
  era: "era",
  hour: "hora",
  minute: "minuto",
  month: "mês",
  second: "segundo",
  selectedDateDescription: (e) => `Data selecionada: ${e.date}`,
  selectedRangeDescription: (e) => `Intervalo selecionado: ${e.startDate} a ${e.endDate}`,
  selectedTimeDescription: (e) => `Hora selecionada: ${e.time}`,
  startDate: "Data inicial",
  timeZoneName: "fuso horário",
  weekday: "dia da semana",
  year: "ano"
};
var Vv = {};
Vv = {
  calendar: "Calendário",
  day: "dia",
  dayPeriod: "am/pm",
  endDate: "Data de Término",
  era: "era",
  hour: "hora",
  minute: "minuto",
  month: "mês",
  second: "segundo",
  selectedDateDescription: (e) => `Data selecionada: ${e.date}`,
  selectedRangeDescription: (e) => `Intervalo selecionado: ${e.startDate} a ${e.endDate}`,
  selectedTimeDescription: (e) => `Hora selecionada: ${e.time}`,
  startDate: "Data de Início",
  timeZoneName: "fuso horário",
  weekday: "dia da semana",
  year: "ano"
};
var Bv = {};
Bv = {
  calendar: "Calendar",
  day: "zi",
  dayPeriod: "a.m/p.m.",
  endDate: "Dată final",
  era: "eră",
  hour: "oră",
  minute: "minut",
  month: "lună",
  second: "secundă",
  selectedDateDescription: (e) => `Dată selectată: ${e.date}`,
  selectedRangeDescription: (e) => `Interval selectat: de la ${e.startDate} până la ${e.endDate}`,
  selectedTimeDescription: (e) => `Ora selectată: ${e.time}`,
  startDate: "Dată început",
  timeZoneName: "fus orar",
  weekday: "ziua din săptămână",
  year: "an"
};
var Lv = {};
Lv = {
  calendar: "Календарь",
  day: "день",
  dayPeriod: "AM/PM",
  endDate: "Дата окончания",
  era: "эра",
  hour: "час",
  minute: "минута",
  month: "месяц",
  second: "секунда",
  selectedDateDescription: (e) => `Выбранная дата: ${e.date}`,
  selectedRangeDescription: (e) => `Выбранный диапазон: с ${e.startDate} по ${e.endDate}`,
  selectedTimeDescription: (e) => `Выбранное время: ${e.time}`,
  startDate: "Дата начала",
  timeZoneName: "часовой пояс",
  weekday: "день недели",
  year: "год"
};
var Fv = {};
Fv = {
  calendar: "Kalendár",
  day: "deň",
  dayPeriod: "AM/PM",
  endDate: "Dátum ukončenia",
  era: "letopočet",
  hour: "hodina",
  minute: "minúta",
  month: "mesiac",
  second: "sekunda",
  selectedDateDescription: (e) => `Vybratý dátum: ${e.date}`,
  selectedRangeDescription: (e) => `Vybratý rozsah: od ${e.startDate} do ${e.endDate}`,
  selectedTimeDescription: (e) => `Vybratý čas: ${e.time}`,
  startDate: "Dátum začatia",
  timeZoneName: "časové pásmo",
  weekday: "deň týždňa",
  year: "rok"
};
var Ov = {};
Ov = {
  calendar: "Koledar",
  day: "dan",
  dayPeriod: "dop/pop",
  endDate: "Datum konca",
  era: "doba",
  hour: "ura",
  minute: "minuta",
  month: "mesec",
  second: "sekunda",
  selectedDateDescription: (e) => `Izbrani datum: ${e.date}`,
  selectedRangeDescription: (e) => `Izbrano območje: ${e.startDate} do ${e.endDate}`,
  selectedTimeDescription: (e) => `Izbrani čas: ${e.time}`,
  startDate: "Datum začetka",
  timeZoneName: "časovni pas",
  weekday: "dan v tednu",
  year: "leto"
};
var zv = {};
zv = {
  calendar: "Kalendar",
  day: "дан",
  dayPeriod: "пре подне/по подне",
  endDate: "Datum završetka",
  era: "ера",
  hour: "сат",
  minute: "минут",
  month: "месец",
  second: "секунд",
  selectedDateDescription: (e) => `Izabrani datum: ${e.date}`,
  selectedRangeDescription: (e) => `Izabrani opseg: od ${e.startDate} do ${e.endDate}`,
  selectedTimeDescription: (e) => `Izabrano vreme: ${e.time}`,
  startDate: "Datum početka",
  timeZoneName: "временска зона",
  weekday: "дан у недељи",
  year: "година"
};
var _v = {};
_v = {
  calendar: "Kalender",
  day: "dag",
  dayPeriod: "fm/em",
  endDate: "Slutdatum",
  era: "era",
  hour: "timme",
  minute: "minut",
  month: "månad",
  second: "sekund",
  selectedDateDescription: (e) => `Valt datum: ${e.date}`,
  selectedRangeDescription: (e) => `Valt intervall: ${e.startDate} till ${e.endDate}`,
  selectedTimeDescription: (e) => `Vald tid: ${e.time}`,
  startDate: "Startdatum",
  timeZoneName: "tidszon",
  weekday: "veckodag",
  year: "år"
};
var Uv = {};
Uv = {
  calendar: "Takvim",
  day: "gün",
  dayPeriod: "ÖÖ/ÖS",
  endDate: "Bitiş Tarihi",
  era: "çağ",
  hour: "saat",
  minute: "dakika",
  month: "ay",
  second: "saniye",
  selectedDateDescription: (e) => `Seçilen Tarih: ${e.date}`,
  selectedRangeDescription: (e) => `Seçilen Aralık: ${e.startDate} - ${e.endDate}`,
  selectedTimeDescription: (e) => `Seçilen Zaman: ${e.time}`,
  startDate: "Başlangıç Tarihi",
  timeZoneName: "saat dilimi",
  weekday: "haftanın günü",
  year: "yıl"
};
var Hv = {};
Hv = {
  calendar: "Календар",
  day: "день",
  dayPeriod: "дп/пп",
  endDate: "Дата завершення",
  era: "ера",
  hour: "година",
  minute: "хвилина",
  month: "місяць",
  second: "секунда",
  selectedDateDescription: (e) => `Вибрана дата: ${e.date}`,
  selectedRangeDescription: (e) => `Вибраний діапазон: ${e.startDate} — ${e.endDate}`,
  selectedTimeDescription: (e) => `Вибраний час: ${e.time}`,
  startDate: "Дата початку",
  timeZoneName: "часовий пояс",
  weekday: "день тижня",
  year: "рік"
};
var Kv = {};
Kv = {
  calendar: "日历",
  day: "日",
  dayPeriod: "上午/下午",
  endDate: "结束日期",
  era: "纪元",
  hour: "小时",
  minute: "分钟",
  month: "月",
  second: "秒",
  selectedDateDescription: (e) => `选定的日期：${e.date}`,
  selectedRangeDescription: (e) => `选定的范围：${e.startDate} 至 ${e.endDate}`,
  selectedTimeDescription: (e) => `选定的时间：${e.time}`,
  startDate: "开始日期",
  timeZoneName: "时区",
  weekday: "工作日",
  year: "年"
};
var Wv = {};
Wv = {
  calendar: "日曆",
  day: "日",
  dayPeriod: "上午/下午",
  endDate: "結束日期",
  era: "纪元",
  hour: "小时",
  minute: "分钟",
  month: "月",
  second: "秒",
  selectedDateDescription: (e) => `選定的日期：${e.date}`,
  selectedRangeDescription: (e) => `選定的範圍：${e.startDate} 至 ${e.endDate}`,
  selectedTimeDescription: (e) => `選定的時間：${e.time}`,
  startDate: "開始日期",
  timeZoneName: "时区",
  weekday: "工作日",
  year: "年"
};
var fu = {};
fu = {
  "ar-AE": mv,
  "bg-BG": hv,
  "cs-CZ": pv,
  "da-DK": gv,
  "de-DE": vv,
  "el-GR": bv,
  "en-US": yv,
  "es-ES": xv,
  "et-EE": wv,
  "fi-FI": $v,
  "fr-FR": Dv,
  "he-IL": Cv,
  "hr-HR": Ev,
  "hu-HU": Sv,
  "it-IT": Tv,
  "ja-JP": Pv,
  "ko-KR": kv,
  "lt-LT": Nv,
  "lv-LV": Av,
  "nb-NO": jv,
  "nl-NL": Mv,
  "pl-PL": Rv,
  "pt-BR": Iv,
  "pt-PT": Vv,
  "ro-RO": Bv,
  "ru-RU": Lv,
  "sk-SK": Fv,
  "sl-SI": Ov,
  "sr-SP": zv,
  "sv-SE": _v,
  "tr-TR": Uv,
  "uk-UA": Hv,
  "zh-CN": Kv,
  "zh-TW": Wv
};
function o6(e, t, n) {
  let { direction: r } = Nt(), a = F(() => kg(t), [
    t
  ]), i = (l) => {
    if (ae(l.currentTarget, q(l)) && (l.altKey && (l.key === "ArrowDown" || l.key === "ArrowUp") && "setOpen" in e && (l.preventDefault(), l.stopPropagation(), e.setOpen(!0)), !n))
      switch (l.key) {
        case "ArrowLeft":
          if (l.preventDefault(), l.stopPropagation(), r === "rtl") {
            if (t.current) {
              let c = q(l), d = yf(t.current, c.getBoundingClientRect().left, -1);
              d && d.focus();
            }
          } else a.focusPrevious();
          break;
        case "ArrowRight":
          if (l.preventDefault(), l.stopPropagation(), r === "rtl") {
            if (t.current) {
              let c = q(l), d = yf(t.current, c.getBoundingClientRect().left, 1);
              d && d.focus();
            }
          } else a.focusNext();
          break;
      }
  }, o = () => {
    if (!t.current) return;
    let l = window.event ? q(window.event) : null, c = jn(t.current, {
      tabbable: !0
    });
    if (l && (c.currentNode = l, l = c.previousNode()), !l) {
      let d;
      do
        d = c.lastChild(), d && (l = d);
      while (d);
    }
    for (; l?.hasAttribute("data-placeholder"); ) {
      let d = c.previousNode();
      if (d && d.hasAttribute("data-placeholder")) l = d;
      else break;
    }
    l && l.focus();
  }, { pressProps: s } = SC({
    preventFocusOnPress: !0,
    allowTextSelectionOnPress: !0,
    onPressStart(l) {
      l.pointerType === "mouse" && o();
    },
    onPress(l) {
      (l.pointerType === "touch" || l.pointerType === "pen") && o();
    }
  });
  return lt(s, {
    onKeyDown: i
  });
}
function yf(e, t, n) {
  let r = jn(e, {
    tabbable: !0
  }), a = r.nextNode(), i = null, o = 1 / 0;
  for (; a; ) {
    let l = a.getBoundingClientRect().left - t, c = Math.abs(l);
    Math.sign(l) === n && c < o && (i = a, o = c), a = r.nextNode();
  }
  return i;
}
function s6(e) {
  return e && e.__esModule ? e.default : e;
}
const Gv = /* @__PURE__ */ new WeakMap(), zo = "__role_" + Date.now(), l6 = "__focusManager_" + Date.now();
function mu(e, t, n) {
  var r;
  let { isInvalid: a, validationErrors: i, validationDetails: o } = t.displayValidation, { labelProps: s, fieldProps: l, descriptionProps: c, errorMessageProps: d } = GC({
    ...e,
    labelElementType: "span",
    isInvalid: a,
    errorMessage: e.errorMessage || i
  }), f = B(null), { focusWithinProps: m } = lu({
    ...e,
    onFocusWithin(T) {
      var M;
      f.current = t.value, (M = e.onFocus) === null || M === void 0 || M.call(e, T);
    },
    onBlurWithin: (T) => {
      var M;
      t.confirmPlaceholder(), t.value !== f.current && t.commitValidation(), (M = e.onBlur) === null || M === void 0 || M.call(e, T);
    },
    onFocusWithinChange: e.onFocusChange
  }), h = Fp(s6(fu), "@react-aria/datepicker"), p = t.maxGranularity === "hour" ? "selectedTimeDescription" : "selectedDateDescription", g = t.maxGranularity === "hour" ? "time" : "date", v = t.value ? h.format(p, {
    [g]: t.formatValue({
      month: "long"
    })
  }) : "", b = GD(v), x = e[zo] === "presentation" ? l["aria-describedby"] : [
    b["aria-describedby"],
    l["aria-describedby"]
  ].filter(Boolean).join(" ") || void 0, C = e[l6], w = F(() => C || kg(n), [
    C,
    n
  ]), E = o6(t, n, e[zo] === "presentation");
  Gv.set(t, {
    ariaLabel: e["aria-label"],
    ariaLabelledBy: [
      s.id,
      e["aria-labelledby"]
    ].filter(Boolean).join(" ") || void 0,
    ariaDescribedBy: x,
    focusManager: w
  });
  let k = B(e.autoFocus), A;
  e[zo] === "presentation" ? A = {
    role: "presentation"
  } : A = lt(l, {
    role: "group",
    "aria-disabled": e.isDisabled || void 0,
    "aria-describedby": x
  }), U(() => {
    k.current && w.focusFirst(), k.current = !1;
  }, [
    w
  ]), XD(e.inputRef, t.defaultValue, t.setValue), JC({
    ...e,
    focus() {
      w.focusFirst();
    }
  }, t, e.inputRef);
  let P = {
    type: "hidden",
    name: e.name,
    form: e.form,
    value: ((r = t.value) === null || r === void 0 ? void 0 : r.toString()) || "",
    disabled: e.isDisabled
  };
  e.validationBehavior === "native" && (P.type = "text", P.hidden = !0, P.required = e.isRequired, P.onChange = () => {
  });
  let j = Oi(e);
  return {
    labelProps: {
      ...s,
      onClick: () => {
        w.focusFirst();
      }
    },
    fieldProps: lt(j, A, E, m, {
      onKeyDown(T) {
        e.onKeyDown && e.onKeyDown(T);
      },
      onKeyUp(T) {
        e.onKeyUp && e.onKeyUp(T);
      },
      style: {
        unicodeBidi: "isolate"
      }
    }),
    inputProps: P,
    descriptionProps: c,
    errorMessageProps: d,
    isInvalid: a,
    validationErrors: i,
    validationDetails: o
  };
}
function u6(e, t, n) {
  var r;
  let a = mu(e, t, n);
  return a.inputProps.value = ((r = t.timeValue) === null || r === void 0 ? void 0 : r.toString()) || "", a;
}
function c6(e) {
  return e && e.__esModule ? e.default : e;
}
function d6() {
  let { locale: e } = Nt(), t = Lp(c6(fu), "@react-aria/datepicker");
  return F(() => {
    try {
      return new Intl.DisplayNames(e, {
        type: "dateTimeField"
      });
    } catch {
      return new f6(e, t);
    }
  }, [
    e,
    t
  ]);
}
class f6 {
  of(t) {
    return this.dictionary.getStringForLocale(t, this.locale);
  }
  constructor(t, n) {
    this.locale = t, this.dictionary = n;
  }
}
function m6(e, t, n) {
  let r = B(""), { locale: a, direction: i } = Nt(), o = d6(), { ariaLabel: s, ariaLabelledBy: l, ariaDescribedBy: c, focusManager: d } = Gv.get(t), f = e.isPlaceholder ? "" : e.text, m = F(() => t.dateFormatter.resolvedOptions(), [
    t.dateFormatter
  ]), h = Ta({
    month: "long",
    timeZone: m.timeZone
  }), p = Ta({
    hour: "numeric",
    hour12: m.hour12,
    timeZone: m.timeZone
  });
  if (e.type === "month" && !e.isPlaceholder) {
    let $ = h.format(t.dateValue);
    f = $ !== f ? `${f} – ${$}` : $;
  } else e.type === "hour" && !e.isPlaceholder && (f = p.format(t.dateValue));
  var g;
  let { spinButtonProps: v } = i6({
    // The ARIA spec says aria-valuenow is optional if there's no value, but aXe seems to require it.
    // This doesn't seem to have any negative effects with real AT since we also use aria-valuetext.
    // https://github.com/dequelabs/axe-core/issues/3505
    value: (g = e.value) !== null && g !== void 0 ? g : void 0,
    textValue: f,
    minValue: e.minValue,
    maxValue: e.maxValue,
    isDisabled: t.isDisabled,
    isReadOnly: t.isReadOnly || !e.isEditable,
    isRequired: t.isRequired,
    onIncrement: () => {
      r.current = "", t.increment(e.type);
    },
    onDecrement: () => {
      r.current = "", t.decrement(e.type);
    },
    onIncrementPage: () => {
      r.current = "", t.incrementPage(e.type);
    },
    onDecrementPage: () => {
      r.current = "", t.decrementPage(e.type);
    },
    onIncrementToMax: () => {
      r.current = "", t.incrementToMax(e.type);
    },
    onDecrementToMin: () => {
      r.current = "", t.decrementToMin(e.type);
    }
  }), b = F(() => new bg(a, {
    maximumFractionDigits: 0
  }), [
    a
  ]), x = () => {
    if (e.text === e.placeholder && d.focusPrevious(), b.isValidPartialNumber(e.text) && !t.isReadOnly && !e.isPlaceholder) {
      let $ = e.text.slice(0, -1), D = b.parse($);
      $ = D === 0 ? "" : $, $.length === 0 || D === 0 ? t.clearSegment(e.type) : t.setSegment(e.type, D), r.current = $;
    } else (e.type === "dayPeriod" || e.type === "era") && t.clearSegment(e.type);
  }, C = ($) => {
    if ($.key === "a" && (an() ? $.metaKey : $.ctrlKey) && $.preventDefault(), !($.ctrlKey || $.metaKey || $.shiftKey || $.altKey))
      switch ($.key) {
        case "Backspace":
        case "Delete":
          $.preventDefault(), $.stopPropagation(), x();
          break;
      }
  }, { startsWith: w } = wC({
    sensitivity: "base"
  }), E = Ta({
    hour: "numeric",
    hour12: !0
  }), k = F(() => {
    let $ = /* @__PURE__ */ new Date();
    return $.setHours(0), E.formatToParts($).find((D) => D.type === "dayPeriod").value;
  }, [
    E
  ]), A = F(() => {
    let $ = /* @__PURE__ */ new Date();
    return $.setHours(12), E.formatToParts($).find((D) => D.type === "dayPeriod").value;
  }, [
    E
  ]), P = Ta({
    year: "numeric",
    era: "narrow",
    timeZone: "UTC"
  }), j = F(() => {
    if (e.type !== "era") return [];
    let $ = Ae(new pe(1, 1, 1), t.calendar), D = t.calendar.getEras().map((I) => {
      let H = $.set({
        year: 1,
        month: 1,
        day: 1,
        era: I
      }).toDate("UTC"), X = P.formatToParts(H).find((oe) => oe.type === "era").value;
      return {
        era: I,
        formatted: X
      };
    }), N = h6(D.map((I) => I.formatted));
    if (N) for (let I of D) I.formatted = I.formatted.slice(N);
    return D;
  }, [
    P,
    t.calendar,
    e.type
  ]), T = ($) => {
    if (t.isDisabled || t.isReadOnly) return;
    let D = r.current + $;
    switch (e.type) {
      case "dayPeriod":
        if (w(k, $)) t.setSegment("dayPeriod", 0);
        else if (w(A, $)) t.setSegment("dayPeriod", 1);
        else break;
        d.focusNext();
        break;
      case "era": {
        let N = j.find((I) => w(I.formatted, $));
        N && (t.setSegment("era", N.era), d.focusNext());
        break;
      }
      case "day":
      case "hour":
      case "minute":
      case "second":
      case "month":
      case "year": {
        if (!b.isValidPartialNumber(D)) return;
        let N = b.parse(D), I = N;
        if (e.maxValue !== void 0 && N > e.maxValue && (I = b.parse($)), isNaN(N)) return;
        t.setSegment(e.type, I), e.maxValue !== void 0 && (+(N + "0") > e.maxValue || D.length >= String(e.maxValue).length) ? (r.current = "", d.focusNext()) : r.current = D;
        break;
      }
    }
  }, M = () => {
    r.current = "", n.current && YD(n.current, {
      containingElement: KD(n.current)
    });
    let $ = window.getSelection();
    $?.collapse(n.current);
  }, L = B(typeof document < "u" ? document : null);
  So(L, "selectionchange", () => {
    let $ = window.getSelection();
    $?.anchorNode && ae(n.current, $?.anchorNode) && $.collapse(n.current);
  });
  let O = B("");
  So(n, "beforeinput", ($) => {
    if (n.current)
      switch ($.preventDefault(), $.inputType) {
        case "deleteContentBackward":
        case "deleteContentForward":
          b.isValidPartialNumber(e.text) && !t.isReadOnly && x();
          break;
        case "insertCompositionText":
          O.current = n.current.textContent, n.current.textContent = n.current.textContent;
          break;
        default:
          $.data != null && T($.data);
          break;
      }
  }), So(n, "input", ($) => {
    let { inputType: D, data: N } = $;
    switch (D) {
      case "insertCompositionText":
        n.current && (n.current.textContent = O.current), N != null && (w(k, N) || w(A, N)) && T(N);
        break;
    }
  }), Ke(() => {
    let $ = n.current;
    return () => {
      st() === $ && (d.focusPrevious() || d.focusNext());
    };
  }, [
    n,
    d
  ]);
  let Z = na() || e.type === "timeZoneName" ? {
    role: "textbox",
    "aria-valuemax": null,
    "aria-valuemin": null,
    "aria-valuetext": null,
    "aria-valuenow": null
  } : {}, Q = F(() => t.segments.find(($) => $.isEditable), [
    t.segments
  ]);
  e !== Q && !t.isInvalid && (c = void 0);
  let J = zr(), Y = !t.isDisabled && !t.isReadOnly && e.isEditable, K = e.type === "literal" ? "" : o.of(e.type), te = Pp({
    "aria-label": `${K}${s ? `, ${s}` : ""}${l ? ", " : ""}`,
    "aria-labelledby": l
  });
  if (e.type === "literal") return {
    segmentProps: {
      "aria-hidden": !0
    }
  };
  let S = {
    caretColor: "transparent"
  };
  if (i === "rtl") {
    S.unicodeBidi = "embed";
    let $ = m[e.type];
    ($ === "numeric" || $ === "2-digit") && (S.direction = "ltr");
  }
  return {
    segmentProps: lt(v, te, {
      id: J,
      ...Z,
      "aria-invalid": t.isInvalid ? "true" : void 0,
      "aria-describedby": c,
      "aria-readonly": t.isReadOnly || !e.isEditable ? "true" : void 0,
      "data-placeholder": e.isPlaceholder || void 0,
      contentEditable: Y,
      suppressContentEditableWarning: Y,
      spellCheck: Y ? "false" : void 0,
      autoCorrect: Y ? "off" : void 0,
      // Capitalization was changed in React 17...
      [parseInt(W.version, 10) >= 17 ? "enterKeyHint" : "enterkeyhint"]: Y ? "next" : void 0,
      inputMode: t.isDisabled || e.type === "dayPeriod" || e.type === "era" || !Y ? void 0 : "numeric",
      tabIndex: t.isDisabled ? void 0 : 0,
      onKeyDown: C,
      onFocus: M,
      style: S,
      // Prevent pointer events from reaching useDatePickerGroup, and allow native browser behavior to focus the segment.
      onPointerDown($) {
        $.stopPropagation();
      },
      onMouseDown($) {
        $.stopPropagation();
      }
    })
  };
}
function h6(e) {
  e.sort();
  let t = e[0], n = e[e.length - 1];
  for (let r = 0; r < t.length; r++)
    if (t[r] !== n[r]) return r;
  return 0;
}
const Yv = /* @__PURE__ */ fe({}), qv = /* @__PURE__ */ fe({});
var Zv = {};
Zv = {
  rangeOverflow: (e) => `يجب أن تكون القيمة ${e.maxValue} أو قبل ذلك.`,
  rangeReversed: "تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء.",
  rangeUnderflow: (e) => `يجب أن تكون القيمة ${e.minValue} أو بعد ذلك.`,
  unavailableDate: "البيانات المحددة غير متاحة."
};
var Xv = {};
Xv = {
  rangeOverflow: (e) => `Стойността трябва да е ${e.maxValue} или по-ранна.`,
  rangeReversed: "Началната дата трябва да е преди крайната.",
  rangeUnderflow: (e) => `Стойността трябва да е ${e.minValue} или по-късно.`,
  unavailableDate: "Избраната дата не е налична."
};
var Jv = {};
Jv = {
  rangeOverflow: (e) => `Hodnota musí být ${e.maxValue} nebo dřívější.`,
  rangeReversed: "Datum zahájení musí předcházet datu ukončení.",
  rangeUnderflow: (e) => `Hodnota musí být ${e.minValue} nebo pozdější.`,
  unavailableDate: "Vybrané datum není k dispozici."
};
var Qv = {};
Qv = {
  rangeOverflow: (e) => `Værdien skal være ${e.maxValue} eller tidligere.`,
  rangeReversed: "Startdatoen skal være før slutdatoen.",
  rangeUnderflow: (e) => `Værdien skal være ${e.minValue} eller nyere.`,
  unavailableDate: "Den valgte dato er ikke tilgængelig."
};
var e0 = {};
e0 = {
  rangeOverflow: (e) => `Der Wert muss ${e.maxValue} oder früher sein.`,
  rangeReversed: "Das Startdatum muss vor dem Enddatum liegen.",
  rangeUnderflow: (e) => `Der Wert muss ${e.minValue} oder später sein.`,
  unavailableDate: "Das ausgewählte Datum ist nicht verfügbar."
};
var t0 = {};
t0 = {
  rangeOverflow: (e) => `Η τιμή πρέπει να είναι ${e.maxValue} ή παλαιότερη.`,
  rangeReversed: "Η ημερομηνία έναρξης πρέπει να είναι πριν από την ημερομηνία λήξης.",
  rangeUnderflow: (e) => `Η τιμή πρέπει να είναι ${e.minValue} ή μεταγενέστερη.`,
  unavailableDate: "Η επιλεγμένη ημερομηνία δεν είναι διαθέσιμη."
};
var n0 = {};
n0 = {
  rangeUnderflow: (e) => `Value must be ${e.minValue} or later.`,
  rangeOverflow: (e) => `Value must be ${e.maxValue} or earlier.`,
  rangeReversed: "Start date must be before end date.",
  unavailableDate: "Selected date unavailable."
};
var r0 = {};
r0 = {
  rangeOverflow: (e) => `El valor debe ser ${e.maxValue} o anterior.`,
  rangeReversed: "La fecha de inicio debe ser anterior a la fecha de finalización.",
  rangeUnderflow: (e) => `El valor debe ser ${e.minValue} o posterior.`,
  unavailableDate: "Fecha seleccionada no disponible."
};
var a0 = {};
a0 = {
  rangeOverflow: (e) => `Väärtus peab olema ${e.maxValue} või varasem.`,
  rangeReversed: "Alguskuupäev peab olema enne lõppkuupäeva.",
  rangeUnderflow: (e) => `Väärtus peab olema ${e.minValue} või hilisem.`,
  unavailableDate: "Valitud kuupäev pole saadaval."
};
var i0 = {};
i0 = {
  rangeOverflow: (e) => `Arvon on oltava ${e.maxValue} tai sitä aikaisempi.`,
  rangeReversed: "Aloituspäivän on oltava ennen lopetuspäivää.",
  rangeUnderflow: (e) => `Arvon on oltava ${e.minValue} tai sitä myöhäisempi.`,
  unavailableDate: "Valittu päivämäärä ei ole käytettävissä."
};
var o0 = {};
o0 = {
  rangeOverflow: (e) => `La valeur doit être ${e.maxValue} ou antérieure.`,
  rangeReversed: "La date de début doit être antérieure à la date de fin.",
  rangeUnderflow: (e) => `La valeur doit être ${e.minValue} ou ultérieure.`,
  unavailableDate: "La date sélectionnée n’est pas disponible."
};
var s0 = {};
s0 = {
  rangeOverflow: (e) => `הערך חייב להיות ${e.maxValue} או מוקדם יותר.`,
  rangeReversed: "תאריך ההתחלה חייב להיות לפני תאריך הסיום.",
  rangeUnderflow: (e) => `הערך חייב להיות ${e.minValue} או מאוחר יותר.`,
  unavailableDate: "התאריך הנבחר אינו זמין."
};
var l0 = {};
l0 = {
  rangeOverflow: (e) => `Vrijednost mora biti ${e.maxValue} ili ranije.`,
  rangeReversed: "Datum početka mora biti prije datuma završetka.",
  rangeUnderflow: (e) => `Vrijednost mora biti ${e.minValue} ili kasnije.`,
  unavailableDate: "Odabrani datum nije dostupan."
};
var u0 = {};
u0 = {
  rangeOverflow: (e) => `Az értéknek ${e.maxValue} vagy korábbinak kell lennie.`,
  rangeReversed: "A kezdő dátumnak a befejező dátumnál korábbinak kell lennie.",
  rangeUnderflow: (e) => `Az értéknek ${e.minValue} vagy későbbinek kell lennie.`,
  unavailableDate: "A kiválasztott dátum nem érhető el."
};
var c0 = {};
c0 = {
  rangeOverflow: (e) => `Il valore deve essere ${e.maxValue} o precedente.`,
  rangeReversed: "La data di inizio deve essere antecedente alla data di fine.",
  rangeUnderflow: (e) => `Il valore deve essere ${e.minValue} o successivo.`,
  unavailableDate: "Data selezionata non disponibile."
};
var d0 = {};
d0 = {
  rangeOverflow: (e) => `値は ${e.maxValue} 以下にする必要があります。`,
  rangeReversed: "開始日は終了日より前にする必要があります。",
  rangeUnderflow: (e) => `値は ${e.minValue} 以上にする必要があります。`,
  unavailableDate: "選択した日付は使用できません。"
};
var f0 = {};
f0 = {
  rangeOverflow: (e) => `값은 ${e.maxValue} 이전이어야 합니다.`,
  rangeReversed: "시작일은 종료일 이전이어야 합니다.",
  rangeUnderflow: (e) => `값은 ${e.minValue} 이후여야 합니다.`,
  unavailableDate: "선택한 날짜를 사용할 수 없습니다."
};
var m0 = {};
m0 = {
  rangeOverflow: (e) => `Reikšmė turi būti ${e.maxValue} arba ankstesnė.`,
  rangeReversed: "Pradžios data turi būti ankstesnė nei pabaigos data.",
  rangeUnderflow: (e) => `Reikšmė turi būti ${e.minValue} arba naujesnė.`,
  unavailableDate: "Pasirinkta data nepasiekiama."
};
var h0 = {};
h0 = {
  rangeOverflow: (e) => `Vērtībai ir jābūt ${e.maxValue} vai agrākai.`,
  rangeReversed: "Sākuma datumam ir jābūt pirms beigu datuma.",
  rangeUnderflow: (e) => `Vērtībai ir jābūt ${e.minValue} vai vēlākai.`,
  unavailableDate: "Atlasītais datums nav pieejams."
};
var p0 = {};
p0 = {
  rangeOverflow: (e) => `Verdien må være ${e.maxValue} eller tidligere.`,
  rangeReversed: "Startdatoen må være før sluttdatoen.",
  rangeUnderflow: (e) => `Verdien må være ${e.minValue} eller senere.`,
  unavailableDate: "Valgt dato utilgjengelig."
};
var g0 = {};
g0 = {
  rangeOverflow: (e) => `Waarde moet ${e.maxValue} of eerder zijn.`,
  rangeReversed: "De startdatum moet voor de einddatum liggen.",
  rangeUnderflow: (e) => `Waarde moet ${e.minValue} of later zijn.`,
  unavailableDate: "Geselecteerde datum niet beschikbaar."
};
var v0 = {};
v0 = {
  rangeOverflow: (e) => `Wartość musi mieć wartość ${e.maxValue} lub wcześniejszą.`,
  rangeReversed: "Data rozpoczęcia musi być wcześniejsza niż data zakończenia.",
  rangeUnderflow: (e) => `Wartość musi mieć wartość ${e.minValue} lub późniejszą.`,
  unavailableDate: "Wybrana data jest niedostępna."
};
var b0 = {};
b0 = {
  rangeOverflow: (e) => `O valor deve ser ${e.maxValue} ou anterior.`,
  rangeReversed: "A data inicial deve ser anterior à data final.",
  rangeUnderflow: (e) => `O valor deve ser ${e.minValue} ou posterior.`,
  unavailableDate: "Data selecionada indisponível."
};
var y0 = {};
y0 = {
  rangeOverflow: (e) => `O valor tem de ser ${e.maxValue} ou anterior.`,
  rangeReversed: "A data de início deve ser anterior à data de fim.",
  rangeUnderflow: (e) => `O valor tem de ser ${e.minValue} ou posterior.`,
  unavailableDate: "Data selecionada indisponível."
};
var x0 = {};
x0 = {
  rangeOverflow: (e) => `Valoarea trebuie să fie ${e.maxValue} sau anterioară.`,
  rangeReversed: "Data de început trebuie să fie anterioară datei de sfârșit.",
  rangeUnderflow: (e) => `Valoarea trebuie să fie ${e.minValue} sau ulterioară.`,
  unavailableDate: "Data selectată nu este disponibilă."
};
var w0 = {};
w0 = {
  rangeOverflow: (e) => `Значение должно быть не позже ${e.maxValue}.`,
  rangeReversed: "Дата начала должна предшествовать дате окончания.",
  rangeUnderflow: (e) => `Значение должно быть не раньше ${e.minValue}.`,
  unavailableDate: "Выбранная дата недоступна."
};
var $0 = {};
$0 = {
  rangeOverflow: (e) => `Hodnota musí byť ${e.maxValue} alebo skoršia.`,
  rangeReversed: "Dátum začiatku musí byť skorší ako dátum konca.",
  rangeUnderflow: (e) => `Hodnota musí byť ${e.minValue} alebo neskoršia.`,
  unavailableDate: "Vybratý dátum je nedostupný."
};
var D0 = {};
D0 = {
  rangeOverflow: (e) => `Vrednost mora biti ${e.maxValue} ali starejša.`,
  rangeReversed: "Začetni datum mora biti pred končnim datumom.",
  rangeUnderflow: (e) => `Vrednost mora biti ${e.minValue} ali novejša.`,
  unavailableDate: "Izbrani datum ni na voljo."
};
var C0 = {};
C0 = {
  rangeOverflow: (e) => `Vrednost mora da bude ${e.maxValue} ili starija.`,
  rangeReversed: "Datum početka mora biti pre datuma završetka.",
  rangeUnderflow: (e) => `Vrednost mora da bude ${e.minValue} ili novija.`,
  unavailableDate: "Izabrani datum nije dostupan."
};
var E0 = {};
E0 = {
  rangeOverflow: (e) => `Värdet måste vara ${e.maxValue} eller tidigare.`,
  rangeReversed: "Startdatumet måste vara före slutdatumet.",
  rangeUnderflow: (e) => `Värdet måste vara ${e.minValue} eller senare.`,
  unavailableDate: "Det valda datumet är inte tillgängligt."
};
var S0 = {};
S0 = {
  rangeOverflow: (e) => `Değer, ${e.maxValue} veya öncesi olmalıdır.`,
  rangeReversed: "Başlangıç tarihi bitiş tarihinden önce olmalıdır.",
  rangeUnderflow: (e) => `Değer, ${e.minValue} veya sonrası olmalıdır.`,
  unavailableDate: "Seçilen tarih kullanılamıyor."
};
var T0 = {};
T0 = {
  rangeOverflow: (e) => `Значення має бути не пізніше ${e.maxValue}.`,
  rangeReversed: "Дата початку має передувати даті завершення.",
  rangeUnderflow: (e) => `Значення має бути не раніше ${e.minValue}.`,
  unavailableDate: "Вибрана дата недоступна."
};
var P0 = {};
P0 = {
  rangeOverflow: (e) => `值必须是 ${e.maxValue} 或更早日期。`,
  rangeReversed: "开始日期必须早于结束日期。",
  rangeUnderflow: (e) => `值必须是 ${e.minValue} 或更晚日期。`,
  unavailableDate: "所选日期不可用。"
};
var k0 = {};
k0 = {
  rangeOverflow: (e) => `值必須是 ${e.maxValue} 或更早。`,
  rangeReversed: "開始日期必須在結束日期之前。",
  rangeUnderflow: (e) => `值必須是 ${e.minValue} 或更晚。`,
  unavailableDate: "所選日期無法使用。"
};
var N0 = {};
N0 = {
  "ar-AE": Zv,
  "bg-BG": Xv,
  "cs-CZ": Jv,
  "da-DK": Qv,
  "de-DE": e0,
  "el-GR": t0,
  "en-US": n0,
  "es-ES": r0,
  "et-EE": a0,
  "fi-FI": i0,
  "fr-FR": o0,
  "he-IL": s0,
  "hr-HR": l0,
  "hu-HU": u0,
  "it-IT": c0,
  "ja-JP": d0,
  "ko-KR": f0,
  "lt-LT": m0,
  "lv-LV": h0,
  "nb-NO": p0,
  "nl-NL": g0,
  "pl-PL": v0,
  "pt-BR": b0,
  "pt-PT": y0,
  "ro-RO": x0,
  "ru-RU": w0,
  "sk-SK": $0,
  "sl-SI": D0,
  "sr-SP": C0,
  "sv-SE": E0,
  "tr-TR": S0,
  "uk-UA": T0,
  "zh-CN": P0,
  "zh-TW": k0
};
function p6(e) {
  return e && e.__esModule ? e.default : e;
}
const g6 = new fn(p6(N0));
function v6() {
  let e = typeof navigator < "u" && (navigator.language || navigator.userLanguage) || "en-US";
  try {
    Intl.DateTimeFormat.supportedLocalesOf([
      e
    ]);
  } catch {
    e = "en-US";
  }
  return e;
}
function b6(e, t, n, r, a) {
  let i = e != null && n != null && e.compare(n) > 0, o = e != null && t != null && e.compare(t) < 0, s = e != null && r?.(e) || !1, l = i || o || s, c = [];
  if (l) {
    let d = v6(), f = fn.getGlobalDictionaryForPackage("@react-stately/datepicker") || g6, m = new Bp(d, f), h = new Nn(d, Wa({}, a)), p = h.resolvedOptions().timeZone;
    o && t != null && c.push(m.format("rangeUnderflow", {
      minValue: h.format(t.toDate(p))
    })), i && n != null && c.push(m.format("rangeOverflow", {
      maxValue: h.format(n.toDate(p))
    })), s && c.push(m.format("unavailableDate"));
  }
  return {
    isInvalid: l,
    validationErrors: c,
    validationDetails: {
      badInput: s,
      customError: !1,
      patternMismatch: !1,
      rangeOverflow: i,
      rangeUnderflow: o,
      stepMismatch: !1,
      tooLong: !1,
      tooShort: !1,
      typeMismatch: !1,
      valueMissing: !1,
      valid: !l
    }
  };
}
const y6 = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit"
}, x6 = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
};
function Wa(e, t) {
  e = {
    ...t.shouldForceLeadingZeros ? x6 : y6,
    ...e
  };
  let r = t.granularity || "minute", a = Object.keys(e);
  var i;
  let o = a.indexOf((i = t.maxGranularity) !== null && i !== void 0 ? i : "year");
  o < 0 && (o = 0);
  let s = a.indexOf(r);
  if (s < 0 && (s = 2), o > s) throw new Error("maxGranularity must be greater than granularity");
  let l = a.slice(o, s + 1).reduce((d, f) => (d[f] = e[f], d), {});
  return t.hourCycle != null && (l.hour12 = t.hourCycle === 12), l.timeZone = t.timeZone || "UTC", (r === "hour" || r === "minute" || r === "second") && t.timeZone && !t.hideTimeZone && (l.timeZoneName = "short"), t.showEra && o === 0 && (l.era = "short"), l;
}
function A0(e, t) {
  if (e === null) return null;
  if (e)
    return Ae(e, t);
}
function w6(e, t, n, r) {
  if (e) return A0(e, n);
  let a = Ae(_p(r ?? sa()).set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  }), n);
  return t === "year" || t === "month" || t === "day" ? Xl(a) : r ? a : St(a);
}
function $6(e, t) {
  let n = e && "timeZone" in e ? e.timeZone : void 0, r = e && "minute" in e ? "minute" : "day";
  if (e && t && !(t in e)) throw new Error("Invalid granularity " + t + " for value " + e.toString());
  let [a, i] = _([
    r,
    n
  ]);
  e && (a[0] !== r || a[1] !== n) && i([
    r,
    n
  ]), t || (t = e ? r : a[0]);
  let o = e ? n : a[1];
  return [
    t,
    o
  ];
}
const D6 = new fn({
  ach: {
    year: "mwaka",
    month: "dwe",
    day: "nino"
  },
  af: {
    year: "jjjj",
    month: "mm",
    day: "dd"
  },
  am: {
    year: "ዓዓዓዓ",
    month: "ሚሜ",
    day: "ቀቀ"
  },
  an: {
    year: "aaaa",
    month: "mm",
    day: "dd"
  },
  ar: {
    year: "سنة",
    month: "شهر",
    day: "يوم"
  },
  ast: {
    year: "aaaa",
    month: "mm",
    day: "dd"
  },
  az: {
    year: "iiii",
    month: "aa",
    day: "gg"
  },
  be: {
    year: "гггг",
    month: "мм",
    day: "дд"
  },
  bg: {
    year: "гггг",
    month: "мм",
    day: "дд"
  },
  bn: {
    year: "yyyy",
    month: "মিমি",
    day: "dd"
  },
  br: {
    year: "bbbb",
    month: "mm",
    day: "dd"
  },
  bs: {
    year: "gggg",
    month: "mm",
    day: "dd"
  },
  ca: {
    year: "aaaa",
    month: "mm",
    day: "dd"
  },
  cak: {
    year: "jjjj",
    month: "ii",
    day: "q'q'"
  },
  ckb: {
    year: "ساڵ",
    month: "مانگ",
    day: "ڕۆژ"
  },
  cs: {
    year: "rrrr",
    month: "mm",
    day: "dd"
  },
  cy: {
    year: "bbbb",
    month: "mm",
    day: "dd"
  },
  da: {
    year: "åååå",
    month: "mm",
    day: "dd"
  },
  de: {
    year: "jjjj",
    month: "mm",
    day: "tt"
  },
  dsb: {
    year: "llll",
    month: "mm",
    day: "źź"
  },
  el: {
    year: "εεεε",
    month: "μμ",
    day: "ηη"
  },
  en: {
    year: "yyyy",
    month: "mm",
    day: "dd"
  },
  eo: {
    year: "jjjj",
    month: "mm",
    day: "tt"
  },
  es: {
    year: "aaaa",
    month: "mm",
    day: "dd"
  },
  et: {
    year: "aaaa",
    month: "kk",
    day: "pp"
  },
  eu: {
    year: "uuuu",
    month: "hh",
    day: "ee"
  },
  fa: {
    year: "سال",
    month: "ماه",
    day: "روز"
  },
  ff: {
    year: "hhhh",
    month: "ll",
    day: "ññ"
  },
  fi: {
    year: "vvvv",
    month: "kk",
    day: "pp"
  },
  fr: {
    year: "aaaa",
    month: "mm",
    day: "jj"
  },
  fy: {
    year: "jjjj",
    month: "mm",
    day: "dd"
  },
  ga: {
    year: "bbbb",
    month: "mm",
    day: "ll"
  },
  gd: {
    year: "bbbb",
    month: "mm",
    day: "ll"
  },
  gl: {
    year: "aaaa",
    month: "mm",
    day: "dd"
  },
  he: {
    year: "שנה",
    month: "חודש",
    day: "יום"
  },
  hr: {
    year: "gggg",
    month: "mm",
    day: "dd"
  },
  hsb: {
    year: "llll",
    month: "mm",
    day: "dd"
  },
  hu: {
    year: "éééé",
    month: "hh",
    day: "nn"
  },
  ia: {
    year: "aaaa",
    month: "mm",
    day: "dd"
  },
  id: {
    year: "tttt",
    month: "bb",
    day: "hh"
  },
  is: {
    year: "áááá",
    month: "mm",
    day: "dd"
  },
  it: {
    year: "aaaa",
    month: "mm",
    day: "gg"
  },
  ja: {
    year: "年",
    month: "月",
    day: "日"
  },
  ka: {
    year: "წწწწ",
    month: "თთ",
    day: "რრ"
  },
  kk: {
    year: "жжжж",
    month: "аа",
    day: "кк"
  },
  kn: {
    year: "ವವವವ",
    month: "ಮಿಮೀ",
    day: "ದಿದಿ"
  },
  ko: {
    year: "연도",
    month: "월",
    day: "일"
  },
  lb: {
    year: "jjjj",
    month: "mm",
    day: "dd"
  },
  lo: {
    year: "ປປປປ",
    month: "ດດ",
    day: "ວວ"
  },
  lt: {
    year: "mmmm",
    month: "mm",
    day: "dd"
  },
  lv: {
    year: "gggg",
    month: "mm",
    day: "dd"
  },
  meh: {
    year: "aaaa",
    month: "mm",
    day: "dd"
  },
  ml: {
    year: "വർഷം",
    month: "മാസം",
    day: "തീയതി"
  },
  ms: {
    year: "tttt",
    month: "mm",
    day: "hh"
  },
  nb: {
    year: "åååå",
    month: "mm",
    day: "dd"
  },
  nl: {
    year: "jjjj",
    month: "mm",
    day: "dd"
  },
  nn: {
    year: "åååå",
    month: "mm",
    day: "dd"
  },
  no: {
    year: "åååå",
    month: "mm",
    day: "dd"
  },
  oc: {
    year: "aaaa",
    month: "mm",
    day: "jj"
  },
  pl: {
    year: "rrrr",
    month: "mm",
    day: "dd"
  },
  pt: {
    year: "aaaa",
    month: "mm",
    day: "dd"
  },
  rm: {
    year: "oooo",
    month: "mm",
    day: "dd"
  },
  ro: {
    year: "aaaa",
    month: "ll",
    day: "zz"
  },
  ru: {
    year: "гггг",
    month: "мм",
    day: "дд"
  },
  sc: {
    year: "aaaa",
    month: "mm",
    day: "dd"
  },
  scn: {
    year: "aaaa",
    month: "mm",
    day: "jj"
  },
  sk: {
    year: "rrrr",
    month: "mm",
    day: "dd"
  },
  sl: {
    year: "llll",
    month: "mm",
    day: "dd"
  },
  sr: {
    year: "гггг",
    month: "мм",
    day: "дд"
  },
  sv: {
    year: "åååå",
    month: "mm",
    day: "dd"
  },
  szl: {
    year: "rrrr",
    month: "mm",
    day: "dd"
  },
  tg: {
    year: "сссс",
    month: "мм",
    day: "рр"
  },
  th: {
    year: "ปปปป",
    month: "ดด",
    day: "วว"
  },
  tr: {
    year: "yyyy",
    month: "aa",
    day: "gg"
  },
  uk: {
    year: "рррр",
    month: "мм",
    day: "дд"
  },
  "zh-CN": {
    year: "年",
    month: "月",
    day: "日"
  },
  "zh-TW": {
    year: "年",
    month: "月",
    day: "日"
  }
}, "en");
function C6(e, t, n) {
  return e === "era" || e === "dayPeriod" ? t : e === "year" || e === "month" || e === "day" ? D6.getStringForLocale(e, n) : "––";
}
class ht {
  copy() {
    let t = new ht(this.calendar, this.hourCycle);
    return t.era = this.era, t.year = this.year, t.month = this.month, t.day = this.day, t.hour = this.hour, t.dayPeriod = this.dayPeriod, t.minute = this.minute, t.second = this.second, t.millisecond = this.millisecond, t.offset = this.offset, t;
  }
  /** Checks whether all the specified segments have a value. */
  isComplete(t) {
    return t.every((n) => this[n] != null);
  }
  /** Checks whether the given date value matches this value for the specified segments. */
  validate(t, n) {
    return n.every((r) => {
      if ((r === "hour" || r === "dayPeriod") && "hour" in t) {
        let [a, i] = Dn(t.hour, this.hourCycle);
        return this.dayPeriod === a && this.hour === i;
      }
      return this[r] === t[r];
    });
  }
  /** Checks if the date is empty (i.e. all specified segments are null). */
  isCleared(t) {
    return t.every((n) => this[n] === null);
  }
  /** Sets the given field. */
  set(t, n, r) {
    let a = this.copy();
    return a[t] = n, t === "hour" && a.dayPeriod == null && "hour" in r && (a.dayPeriod = Dn(r.hour, this.hourCycle)[0]), t === "year" && a.era == null && (a.era = r.era), t !== "second" && t !== "literal" && t !== "timeZoneName" && (a.offset = null), a;
  }
  /** Sets the given field to null. */
  clear(t) {
    let n = this.copy();
    return n[t] = null, t === "year" && (n.era = null), n.offset = null, n;
  }
  /** Increments or decrements the given field. If it is null, then it is set to the placeholder value. */
  cycle(t, n, r, a) {
    let i = this.copy();
    if (i[t] == null && t !== "dayPeriod" && t !== "era") {
      if (t === "hour" && "hour" in r) {
        let [v, b] = Dn(r.hour, this.hourCycle);
        i.dayPeriod = v, i.hour = b;
      } else i[t] = r[t];
      return t === "year" && i.era == null && (i.era = r.era), i;
    }
    switch (t) {
      case "era": {
        let v = this.calendar.getEras(), b = v.indexOf(i.era);
        b = qt(b, n, 0, v.length - 1), i.era = v[b];
        break;
      }
      case "year": {
        var o, s, l, c;
        let v = new pe(this.calendar, (o = this.era) !== null && o !== void 0 ? o : r.era, (s = this.year) !== null && s !== void 0 ? s : r.year, (l = this.month) !== null && l !== void 0 ? l : 1, (c = this.day) !== null && c !== void 0 ? c : 1);
        v = v.cycle(t, n, {
          round: t === "year"
        }), i.era = v.era, i.year = v.year;
        break;
      }
      case "month":
        var d;
        i.month = qt((d = i.month) !== null && d !== void 0 ? d : 1, n, 1, this.calendar.getMaximumMonthsInYear());
        break;
      case "day":
        var f;
        i.day = qt((f = i.day) !== null && f !== void 0 ? f : 1, n, 1, this.calendar.getMaximumDaysInMonth());
        break;
      case "hour": {
        let v = a.some((b) => [
          "year",
          "month",
          "day"
        ].includes(b));
        if ("timeZone" in r && (!v || i.year != null && i.month != null && i.day != null)) {
          let b = this.toValue(r);
          b = b.cycle("hour", n, {
            hourCycle: this.hourCycle === "h12" ? 12 : 24,
            round: !1
          });
          let [x, C] = Dn(b.hour, this.hourCycle);
          i.hour = C, i.dayPeriod = x, i.offset = b.offset;
        } else {
          var m;
          let b = (m = i.hour) !== null && m !== void 0 ? m : 0, x = this.getSegmentLimits("hour");
          i.hour = qt(b, n, x.minValue, x.maxValue), i.dayPeriod == null && "hour" in r && (i.dayPeriod = Dn(r.hour, this.hourCycle)[0]);
        }
        break;
      }
      case "dayPeriod":
        var h;
        i.dayPeriod = qt((h = i.dayPeriod) !== null && h !== void 0 ? h : 0, n, 0, 1);
        break;
      case "minute":
        var p;
        i.minute = qt((p = i.minute) !== null && p !== void 0 ? p : 0, n, 0, 59, !0);
        break;
      case "second":
        var g;
        i.second = qt((g = i.second) !== null && g !== void 0 ? g : 0, n, 0, 59, !0);
        break;
    }
    return i;
  }
  /** Converts the incomplete date to a full date value, using the provided value for any unset fields. */
  toValue(t) {
    var n, r, a, i;
    if ("hour" in t) {
      let p = this.hour;
      var o;
      p != null ? p = E6(p, (o = this.dayPeriod) !== null && o !== void 0 ? o : 0, this.hourCycle) : (this.hourCycle === "h12" || this.hourCycle === "h11") && (p = this.dayPeriod === 1 ? 12 : 0);
      var s, l, c, d, f, m, h;
      let g = t.set({
        era: (s = this.era) !== null && s !== void 0 ? s : t.era,
        year: (l = this.year) !== null && l !== void 0 ? l : t.year,
        month: (c = this.month) !== null && c !== void 0 ? c : t.month,
        day: (d = this.day) !== null && d !== void 0 ? d : t.day,
        hour: p ?? t.hour,
        minute: (f = this.minute) !== null && f !== void 0 ? f : t.minute,
        second: (m = this.second) !== null && m !== void 0 ? m : t.second,
        millisecond: (h = this.millisecond) !== null && h !== void 0 ? h : t.millisecond
      });
      return "offset" in g && this.offset != null && g.offset !== this.offset && (g = g.add({
        milliseconds: g.offset - this.offset
      })), g;
    } else return t.set({
      era: (n = this.era) !== null && n !== void 0 ? n : t.era,
      year: (r = this.year) !== null && r !== void 0 ? r : t.year,
      month: (a = this.month) !== null && a !== void 0 ? a : t.month,
      day: (i = this.day) !== null && i !== void 0 ? i : t.day
    });
  }
  getSegmentLimits(t) {
    switch (t) {
      case "era": {
        let n = this.calendar.getEras();
        return {
          value: this.era != null ? n.indexOf(this.era) : n.length - 1,
          minValue: 0,
          maxValue: n.length - 1
        };
      }
      case "year":
        return {
          value: this.year,
          minValue: 1,
          maxValue: 9999
        };
      case "month":
        return {
          value: this.month,
          minValue: 1,
          maxValue: this.calendar.getMaximumMonthsInYear()
        };
      case "day":
        return {
          value: this.day,
          minValue: 1,
          maxValue: this.calendar.getMaximumDaysInMonth()
        };
      case "dayPeriod":
        return {
          value: this.dayPeriod,
          minValue: 0,
          maxValue: 1
        };
      case "hour": {
        let n = 0, r = 23;
        return this.hourCycle === "h12" ? (n = 1, r = 12) : this.hourCycle === "h11" && (n = 0, r = 11), {
          value: this.hour,
          minValue: n,
          maxValue: r
        };
      }
      case "minute":
        return {
          value: this.minute,
          minValue: 0,
          maxValue: 59
        };
      case "second":
        return {
          value: this.second,
          minValue: 0,
          maxValue: 59
        };
    }
  }
  constructor(t, n, r) {
    var a;
    this.era = (a = r?.era) !== null && a !== void 0 ? a : null, this.calendar = t;
    var i;
    this.year = (i = r?.year) !== null && i !== void 0 ? i : null;
    var o;
    this.month = (o = r?.month) !== null && o !== void 0 ? o : null;
    var s;
    this.day = (s = r?.day) !== null && s !== void 0 ? s : null;
    var l;
    this.hour = (l = r?.hour) !== null && l !== void 0 ? l : null, this.hourCycle = n, this.dayPeriod = null;
    var c;
    this.minute = (c = r?.minute) !== null && c !== void 0 ? c : null;
    var d;
    this.second = (d = r?.second) !== null && d !== void 0 ? d : null;
    var f;
    if (this.millisecond = (f = r?.millisecond) !== null && f !== void 0 ? f : null, this.offset = "offset" in (r ?? {}) ? r.offset : null, this.hour != null) {
      let [m, h] = Dn(this.hour, n);
      this.dayPeriod = m, this.hour = h;
    }
  }
}
function qt(e, t, n, r, a = !1) {
  if (a) {
    e += Math.sign(t), e < n && (e = r);
    let i = Math.abs(t);
    t > 0 ? e = Math.ceil(e / i) * i : e = Math.floor(e / i) * i, e > r && (e = n);
  } else
    e += t, e < n ? e = r - (n - e - 1) : e > r && (e = n + (e - r - 1));
  return e;
}
function Dn(e, t) {
  let n = e >= 12 ? 1 : 0;
  switch (t) {
    case "h11":
      e >= 12 && (e -= 12);
      break;
    case "h12":
      e === 0 ? e = 12 : e > 12 && (e -= 12);
      break;
    case "h23":
      n = null;
      break;
    case "h24":
      e += 1, n = null;
  }
  return [
    n,
    e
  ];
}
function E6(e, t, n) {
  switch (n) {
    case "h11":
      t === 1 && (e += 12);
      break;
    case "h12":
      e === 12 && (e = 0), t === 1 && (e += 12);
      break;
    case "h24":
      e -= 1;
      break;
  }
  return e;
}
const _o = {
  year: !0,
  month: !0,
  day: !0,
  hour: !0,
  minute: !0,
  second: !0,
  dayPeriod: !0,
  era: !0
}, xf = {
  year: 5,
  month: 2,
  day: 7,
  hour: 2,
  minute: 15,
  second: 15
}, S6 = {
  // Node seems to convert everything to lowercase...
  dayperiod: "dayPeriod",
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts#named_years
  relatedYear: "year",
  yearName: "literal",
  unknown: "literal"
};
function hu(e) {
  let { locale: t, createCalendar: n, hideTimeZone: r, isDisabled: a = !1, isReadOnly: i = !1, isRequired: o = !1, minValue: s, maxValue: l, isDateUnavailable: c } = e, d = e.value || e.defaultValue || e.placeholderValue || null, [f, m] = $6(d, e.granularity), h = m || "UTC";
  if (d && !(f in d)) throw new Error("Invalid granularity " + f + " for value " + d.toString());
  let [p, g] = F(() => {
    let se = new Nn(t, {
      dateStyle: "short",
      timeStyle: "short",
      hour12: e.hourCycle != null ? e.hourCycle === 12 : void 0
    }).resolvedOptions();
    return [
      n(se.calendar),
      se.hourCycle
    ];
  }, [
    t,
    e.hourCycle,
    n
  ]);
  var v;
  let [b, x] = jp(e.value, (v = e.defaultValue) !== null && v !== void 0 ? v : null, e.onChange), [C] = _(b), w = F(() => {
    var V;
    return (V = A0(b, p)) !== null && V !== void 0 ? V : null;
  }, [
    b,
    p
  ]), [E, k] = _(() => new ht(p, g, w)), A = p.identifier === "gregory" && E.era === "BC", P = F(() => {
    var V;
    return {
      granularity: f,
      maxGranularity: (V = e.maxGranularity) !== null && V !== void 0 ? V : "year",
      timeZone: m,
      hideTimeZone: r,
      hourCycle: e.hourCycle,
      showEra: A,
      shouldForceLeadingZeros: e.shouldForceLeadingZeros
    };
  }, [
    e.maxGranularity,
    f,
    e.hourCycle,
    e.shouldForceLeadingZeros,
    m,
    r,
    A
  ]), j = F(() => Wa({}, P), [
    P
  ]), T = F(() => new Nn(t, j), [
    t,
    j
  ]), M = F(() => T.resolvedOptions(), [
    T
  ]), L = F(() => w6(e.placeholderValue, f, p, m), [
    e.placeholderValue,
    f,
    p,
    m
  ]), O = F(() => {
    let V = g === "h11" || g === "h12", se = [
      "era",
      "year",
      "month",
      "day",
      "hour",
      ...V ? [
        "dayPeriod"
      ] : [],
      "minute",
      "second"
    ], xe = se.indexOf(e.maxGranularity || "era"), ct = se.indexOf(f === "hour" && V ? "dayPeriod" : f);
    return se.slice(xe, ct + 1);
  }, [
    e.maxGranularity,
    f,
    g
  ]), [Z, Q] = _(w), [J, Y] = _(p), [K, te] = _(g);
  (w !== Z || g !== K || !zp(p, J)) && (E = new ht(p, g, w), Q(w), Y(p), te(g), k(E));
  let S = (V) => {
    if (!(e.isDisabled || e.isReadOnly))
      if (V == null || V instanceof ht && V.isCleared(O))
        k(new ht(p, g, w)), x(null);
      else if (!(V instanceof ht))
        V = Ae(V, d?.calendar || new Le()), k(new ht(p, g, w)), x(V);
      else {
        if (V.isComplete(O)) {
          let se = V.toValue(w ?? L);
          if (V.validate(se, O)) {
            let xe = Ae(se, d?.calendar || new Le());
            if (!b || xe.compare(b) !== 0) {
              k(new ht(p, g, w)), x(xe);
              return;
            }
          }
        }
        k(V);
      }
  }, $ = F(() => E.toValue(w ?? L).toDate(h), [
    E,
    h,
    w,
    L
  ]), D = F(() => T6($, E, T, M, p, t, f), [
    $,
    T,
    M,
    E,
    p,
    t,
    f
  ]), N = (V, se) => {
    S(E.cycle(V, se, L, O));
  }, I = F(() => b6(b, s, l, c, P), [
    b,
    s,
    l,
    c,
    P
  ]), H = qC({
    ...e,
    value: b,
    builtinValidation: I
  }), ne = H.displayValidation.isInvalid, X = e.validationState || (ne ? "invalid" : null);
  var oe, le;
  return {
    ...H,
    value: w,
    defaultValue: (oe = e.defaultValue) !== null && oe !== void 0 ? oe : C,
    dateValue: $,
    calendar: p,
    setValue: S,
    segments: D,
    dateFormatter: T,
    validationState: X,
    isInvalid: ne,
    granularity: f,
    maxGranularity: (le = e.maxGranularity) !== null && le !== void 0 ? le : "year",
    isDisabled: a,
    isReadOnly: i,
    isRequired: o,
    increment(V) {
      N(V, 1);
    },
    decrement(V) {
      N(V, -1);
    },
    incrementPage(V) {
      N(V, xf[V] || 1);
    },
    decrementPage(V) {
      N(V, -(xf[V] || 1));
    },
    incrementToMax(V) {
      let se = V === "hour" && g === "h12" ? 11 : E.getSegmentLimits(V).maxValue;
      S(E.set(V, se, L));
    },
    decrementToMin(V) {
      let se = V === "hour" && g === "h12" ? 12 : E.getSegmentLimits(V).minValue;
      S(E.set(V, se, L));
    },
    setSegment(V, se) {
      S(E.set(V, se, L));
    },
    confirmPlaceholder() {
      if (!(e.isDisabled || e.isReadOnly) && E.isComplete(O)) {
        let V = E.toValue(w ?? L), se = Ae(V, d?.calendar || new Le());
        (!b || se.compare(b) !== 0) && x(se), k(new ht(p, g, w));
      }
    },
    clearSegment(V) {
      let se = E;
      V !== "timeZoneName" && V !== "literal" && (se = E.clear(V)), S(se);
    },
    formatValue(V) {
      if (!w) return "";
      let se = Wa(V, P);
      return new Nn(t, se).format($);
    },
    getDateFormatter(V, se) {
      let xe = {
        ...P,
        ...se
      }, ct = Wa({}, xe);
      return new Nn(V, ct);
    }
  };
}
function T6(e, t, n, r, a, i, o) {
  let s = [
    "hour",
    "minute",
    "second"
  ], l = n.formatToParts(e), c = new js(i, {
    useGrouping: !1
  }), d = new js(i, {
    useGrouping: !1,
    minimumIntegerDigits: 2
  });
  for (let h of l) if (h.type === "year" || h.type === "month" || h.type === "day" || h.type === "hour") {
    var f;
    let p = (f = t[h.type]) !== null && f !== void 0 ? f : 0;
    r[h.type] === "2-digit" ? h.value = d.format(p) : h.value = c.format(p);
  }
  let m = [];
  for (let h of l) {
    let p = S6[h.type] || h.type, g = _o[p];
    p === "era" && a.getEras().length === 1 && (g = !1);
    let v = _o[p] && t[h.type] == null, b = _o[p] ? C6(p, h.value, i) : null, x = {
      type: p,
      text: v ? b : h.value,
      ...t.getSegmentLimits(p),
      isPlaceholder: v,
      placeholder: b,
      isEditable: g
    };
    p === "hour" ? (m.push({
      type: "literal",
      text: "⁦",
      isPlaceholder: !1,
      placeholder: "",
      isEditable: !1
    }), m.push(x), p === o && m.push({
      type: "literal",
      text: "⁩",
      isPlaceholder: !1,
      placeholder: "",
      isEditable: !1
    })) : s.includes(p) && p === o ? (m.push(x), m.push({
      type: "literal",
      text: "⁩",
      isPlaceholder: !1,
      placeholder: "",
      isEditable: !1
    })) : m.push(x);
  }
  return m;
}
function P6(e) {
  let { placeholderValue: t = new Wi(), minValue: n, maxValue: r, defaultValue: a, granularity: i, validate: o } = e, [s, l] = jp(e.value, a ?? null, e.onChange), c = s || t, d = c && "day" in c ? c : void 0, f = a && "timeZone" in a ? a.timeZone : void 0, m = F(() => {
    let w = c && "timeZone" in c ? c.timeZone : void 0;
    return (w || f) && t ? qp(Cn(t), w || f) : Cn(t);
  }, [
    t,
    c,
    f
  ]), h = F(() => Cn(n, d), [
    n,
    d
  ]), p = F(() => Cn(r, d), [
    r,
    d
  ]), g = F(() => s && "day" in s ? Ld(s) : s, [
    s
  ]), v = F(() => s == null ? null : Cn(s), [
    s
  ]), b = F(() => a == null ? null : Cn(a), [
    a
  ]);
  return {
    ...hu({
      ...e,
      value: v,
      defaultValue: b,
      minValue: h,
      maxValue: p,
      onChange: (w) => {
        l(d || f ? w : w && Ld(w));
      },
      granularity: i || "minute",
      maxGranularity: "hour",
      placeholderValue: m ?? void 0,
      // Calendar should not matter for time fields.
      createCalendar: () => new Le(),
      validate: G(() => o?.(s), [
        o,
        s
      ])
    }),
    timeValue: g
  };
}
function Cn(e, t = w2(sa())) {
  return e ? "day" in e ? e : St(t, e) : null;
}
const j0 = /* @__PURE__ */ fe(null), M0 = /* @__PURE__ */ fe(null), Yi = /* @__PURE__ */ fe({}), k6 = /* @__PURE__ */ ut(function(t, n) {
  [t, n] = aa(t, n, Yi);
  let { isDisabled: r, isInvalid: a, isReadOnly: i, onHoverStart: o, onHoverChange: s, onHoverEnd: l, ...c } = t;
  r ?? (r = !!t["aria-disabled"] && t["aria-disabled"] !== "false"), a ?? (a = !!t["aria-invalid"] && t["aria-invalid"] !== "false");
  let { hoverProps: d, isHovered: f } = uu({
    onHoverStart: o,
    onHoverChange: s,
    onHoverEnd: l,
    isDisabled: r
  }), { isFocused: m, isFocusVisible: h, focusProps: p } = du({
    within: !0
  }), g = ra({
    ...t,
    values: {
      isHovered: f,
      isFocusWithin: m,
      isFocusVisible: h,
      isDisabled: r,
      isInvalid: a
    },
    defaultClassName: "react-aria-Group"
  });
  var v, b;
  return /* @__PURE__ */ W.createElement(ia.div, {
    ...lt(c, p, d),
    ...g,
    ref: n,
    role: (v = t.role) !== null && v !== void 0 ? v : "group",
    slot: (b = t.slot) !== null && b !== void 0 ? b : void 0,
    "data-focus-within": m || void 0,
    "data-hovered": f || void 0,
    "data-focus-visible": h || void 0,
    "data-disabled": r || void 0,
    "data-invalid": a || void 0,
    "data-readonly": i || void 0
  }, g.children);
}), qi = /* @__PURE__ */ fe({});
let N6 = (e) => {
  let { onHoverStart: t, onHoverChange: n, onHoverEnd: r, ...a } = e;
  return a;
};
const A6 = /* @__PURE__ */ r6(function(t, n) {
  [t, n] = aa(t, n, qi);
  let { hoverProps: r, isHovered: a } = uu({
    ...t,
    isDisabled: t.disabled
  }), { isFocused: i, isFocusVisible: o, focusProps: s } = du({
    isTextInput: !0,
    autoFocus: t.autoFocus
  }), l = !!t["aria-invalid"] && t["aria-invalid"] !== "false", c = ra({
    ...t,
    values: {
      isHovered: a,
      isFocused: i,
      isFocusVisible: o,
      isDisabled: t.disabled || !1,
      isInvalid: l
    },
    defaultClassName: "react-aria-Input"
  });
  return /* @__PURE__ */ W.createElement(ia.input, {
    ...lt(N6(t), s, r),
    ...c,
    ref: n,
    "data-focused": i || void 0,
    "data-disabled": t.disabled || void 0,
    "data-hovered": a || void 0,
    "data-focus-visible": o || void 0,
    "data-invalid": l || void 0
  });
}), j6 = [
  "day",
  "month",
  "year"
], M6 = {
  hour: 1,
  minute: 2,
  second: 3
};
function R6(e, t) {
  let { autoComplete: n, isDisabled: r, name: a } = e, { visuallyHiddenProps: i } = KC({
    style: {
      // Prevent page scrolling.
      position: "fixed",
      top: 0,
      left: 0
    }
  }), o = 60;
  t.granularity === "second" ? o = 1 : t.granularity === "hour" && (o = 3600);
  let s = "";
  t.value && (t.granularity === "day" ? s = Xl(t.value).toString() : s = St("timeZone" in t.value ? S2(t.value) : t.value).toString());
  let l = t.granularity === "day" ? "date" : "datetime-local", c = [
    "hour",
    "minute",
    "second"
  ], d = 0;
  return c.includes(t.granularity) && (d = M6[t.granularity], c = c.slice(0, d)), {
    containerProps: {
      ...i,
      "aria-hidden": !0,
      // @ts-ignore
      "data-react-aria-prevent-focus": !0,
      // @ts-ignore
      "data-a11y-ignore": "aria-hidden-focus"
    },
    inputProps: {
      tabIndex: -1,
      autoComplete: n,
      disabled: r,
      type: l,
      // We set the form prop to an empty string to prevent the hidden date input's value from being submitted
      form: "",
      name: a,
      step: o,
      value: s,
      onChange: (f) => {
        let m = q(f).value.toString();
        if (m) try {
          let h = V2(m);
          if (t.granularity === "day" && (h = I2(m)), "setSegment" in t) for (let p in h)
            j6.includes(p) && t.setSegment(p, h[p]), c.includes(p) && t.setSegment(p, h[p]);
          t.setValue(h);
        } catch {
        }
      }
    }
  };
}
function I6(e) {
  let { state: t } = e, { containerProps: n, inputProps: r } = R6({
    ...e
  }, t);
  return /* @__PURE__ */ W.createElement("div", {
    ...n,
    "data-testid": "hidden-dateinput-container"
  }, /* @__PURE__ */ W.createElement("input", r));
}
const R0 = /* @__PURE__ */ fe(null), V6 = /* @__PURE__ */ fe(null), ua = /* @__PURE__ */ fe(null), Zi = /* @__PURE__ */ fe(null), B6 = /* @__PURE__ */ ut(function(t, n) {
  [t, n] = aa(t, n, R0);
  let { validationBehavior: r } = Zl(M0) || {};
  var a, i;
  let o = (i = (a = t.validationBehavior) !== null && a !== void 0 ? a : r) !== null && i !== void 0 ? i : "native", { locale: s } = Nt(), l = hu({
    ...t,
    locale: s,
    createCalendar: pg,
    validationBehavior: o
  }), c = B(null), [d, f] = Mp(!t["aria-label"] && !t["aria-labelledby"]), m = B(null), { labelProps: h, fieldProps: p, inputProps: g, descriptionProps: v, errorMessageProps: b, ...x } = mu({
    ...Ds(t),
    label: f,
    inputRef: m,
    validationBehavior: o
  }, l, c), C = ra({
    ...Ds(t),
    values: {
      state: l,
      isInvalid: l.isInvalid,
      isDisabled: l.isDisabled,
      isReadOnly: l.isReadOnly,
      isRequired: t.isRequired || !1
    },
    defaultClassName: "react-aria-DateField"
  }), w = Oi(t, {
    global: !0
  });
  return delete w.id, /* @__PURE__ */ W.createElement(ql, {
    values: [
      [
        ua,
        l
      ],
      [
        Yi,
        {
          ...p,
          ref: c,
          isInvalid: l.isInvalid,
          isDisabled: l.isDisabled
        }
      ],
      [
        qi,
        {
          ...g,
          ref: m
        }
      ],
      [
        Yv,
        {
          ...h,
          ref: d,
          elementType: "span"
        }
      ],
      [
        qv,
        {
          slots: {
            description: v,
            errorMessage: b
          }
        }
      ],
      [
        j0,
        x
      ]
    ]
  }, /* @__PURE__ */ W.createElement(ia.div, {
    ...w,
    ...C,
    ref: n,
    slot: t.slot || void 0,
    "data-invalid": l.isInvalid || void 0,
    "data-disabled": l.isDisabled || void 0,
    "data-readonly": l.isReadOnly || void 0,
    "data-required": t.isRequired || void 0
  }), /* @__PURE__ */ W.createElement(I6, {
    autoComplete: t.autoComplete,
    name: t.name,
    isDisabled: t.isDisabled,
    state: l
  }));
}), L6 = /* @__PURE__ */ ut(function(t, n) {
  [t, n] = aa(t, n, V6);
  let { validationBehavior: r } = Zl(M0) || {};
  var a, i;
  let o = (i = (a = t.validationBehavior) !== null && a !== void 0 ? a : r) !== null && i !== void 0 ? i : "native", { locale: s } = Nt(), l = P6({
    ...t,
    locale: s,
    validationBehavior: o
  }), c = B(null), [d, f] = Mp(!t["aria-label"] && !t["aria-labelledby"]), m = B(null), { labelProps: h, fieldProps: p, inputProps: g, descriptionProps: v, errorMessageProps: b, ...x } = u6({
    ...Ds(t),
    label: f,
    inputRef: m,
    validationBehavior: o
  }, l, c), C = ra({
    ...t,
    values: {
      state: l,
      isInvalid: l.isInvalid,
      isDisabled: l.isDisabled,
      isReadOnly: l.isReadOnly,
      isRequired: t.isRequired || !1
    },
    defaultClassName: "react-aria-TimeField"
  }), w = Oi(t, {
    global: !0
  });
  return delete w.id, /* @__PURE__ */ W.createElement(ql, {
    values: [
      [
        Zi,
        l
      ],
      [
        Yi,
        {
          ...p,
          ref: c,
          isInvalid: l.isInvalid,
          isDisabled: l.isDisabled
        }
      ],
      [
        qi,
        {
          ...g,
          ref: m
        }
      ],
      [
        Yv,
        {
          ...h,
          ref: d,
          elementType: "span"
        }
      ],
      [
        qv,
        {
          slots: {
            description: v,
            errorMessage: b
          }
        }
      ],
      [
        j0,
        x
      ]
    ]
  }, /* @__PURE__ */ W.createElement(ia.div, {
    ...w,
    ...C,
    ref: n,
    slot: t.slot || void 0,
    "data-invalid": l.isInvalid || void 0,
    "data-disabled": l.isDisabled || void 0,
    "data-readonly": l.isReadOnly || void 0,
    "data-required": t.isRequired || void 0
  }));
}), F6 = /* @__PURE__ */ ut(function(t, n) {
  let r = ee(ua), a = ee(Zi);
  return r || a ? /* @__PURE__ */ W.createElement(I0, {
    ...t,
    ref: n
  }) : /* @__PURE__ */ W.createElement(O6, {
    ...t,
    ref: n
  });
}), O6 = /* @__PURE__ */ ut((e, t) => {
  let [n, r] = aa({
    slot: e.slot
  }, t, R0), { locale: a } = Nt(), i = hu({
    ...n,
    locale: a,
    createCalendar: pg
  }), o = B(null), { fieldProps: s, inputProps: l } = mu({
    ...n,
    inputRef: o
  }, i, r);
  return /* @__PURE__ */ W.createElement(ql, {
    values: [
      [
        ua,
        i
      ],
      [
        qi,
        {
          ...l,
          ref: o
        }
      ],
      [
        Yi,
        {
          ...s,
          ref: r,
          isInvalid: i.isInvalid,
          isDisabled: i.isDisabled
        }
      ]
    ]
  }, /* @__PURE__ */ W.createElement(I0, e));
}), I0 = /* @__PURE__ */ ut((e, t) => {
  let { className: n, children: r } = e, a = ee(ua), i = ee(Zi), o = a ?? i;
  return /* @__PURE__ */ W.createElement(W.Fragment, null, /* @__PURE__ */ W.createElement(k6, {
    ...e,
    ref: t,
    slot: e.slot || void 0,
    className: n ?? "react-aria-DateInput",
    isReadOnly: o.isReadOnly,
    isInvalid: o.isInvalid,
    isDisabled: o.isDisabled
  }, o.segments.map((s, l) => /* @__PURE__ */ Cf(r(s), {
    key: l
  }))), /* @__PURE__ */ W.createElement(A6, {
    className: ""
  }));
}), z6 = /* @__PURE__ */ ut(function({ segment: t, ...n }, r) {
  let a = ee(ua), i = ee(Zi), o = a ?? i, s = kp(r), { segmentProps: l } = m6(t, o, s), { focusProps: c, isFocused: d, isFocusVisible: f } = du(), { hoverProps: m, isHovered: h } = uu({
    ...n,
    isDisabled: o.isDisabled || t.type === "literal"
  }), p = ra({
    ...n,
    values: {
      ...t,
      isReadOnly: o.isReadOnly,
      isInvalid: o.isInvalid,
      isDisabled: o.isDisabled,
      isHovered: h,
      isFocused: d,
      isFocusVisible: f
    },
    defaultChildren: t.text,
    defaultClassName: "react-aria-DateSegment"
  });
  return /* @__PURE__ */ W.createElement(ia.span, {
    ...lt(Oi(n, {
      global: !0
    }), l, c, m),
    ...p,
    style: l.style,
    ref: s,
    "data-placeholder": t.isPlaceholder || void 0,
    "data-invalid": o.isInvalid || void 0,
    "data-readonly": o.isReadOnly || void 0,
    "data-disabled": o.isDisabled || void 0,
    "data-type": t.type,
    "data-hovered": h || void 0,
    "data-focused": d || void 0,
    "data-focus-visible": f || void 0
  });
});
function qT({ className: e, children: t, ...n }) {
  return /* @__PURE__ */ u.jsx(
    B6,
    {
      className: Ui(e, (r) => y(r)),
      "data-slot": "datefield",
      ...n,
      children: t
    }
  );
}
function ZT({ className: e, children: t, ...n }) {
  return /* @__PURE__ */ u.jsx(
    L6,
    {
      className: Ui(e, (r) => y(r)),
      "data-slot": "datefield",
      ...n,
      children: t
    }
  );
}
function _6({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    z6,
    {
      className: Ui(
        e,
        (n) => y(
          `
            text-foreground inline-flex rounded px-0.5 caret-transparent outline-hidden data-[type=literal]:text-muted-foreground/70 data-[type=literal]:px-0
            data-placeholder:text-muted-foreground/70
            data-invalid:data-focused:bg-destructive data-invalid:data-placeholder:text-destructive data-invalid:text-destructive data-invalid:data-focused:data-placeholder:text-destructive-foreground data-invalid:data-focused:text-destructive-foreground 
            data-focused:bg-accent data-focused:data-placeholder:text-foreground data-focused:text-foreground             
            data-disabled:cursor-not-allowed data-disabled:opacity-50
          `,
          n
        )
      ),
      ...t,
      "data-invalid": !0
    }
  );
}
const U6 = `
  relative inline-flex items-center overflow-hidden whitespace-nowrap
  data-focus-within:ring-ring/30 data-focus-within:border-ring data-focus-within:outline-none data-focus-within:ring-[3px] 
  data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 data-focus-within:has-aria-invalid:border-destructive
`;
function XT({ className: e, variant: t = "md", ...n }) {
  return /* @__PURE__ */ u.jsx(
    F6,
    {
      "data-slot": "input",
      className: Ui(
        e,
        (r) => y(Hl({ variant: t }), U6, r)
      ),
      ...n,
      children: (r) => /* @__PURE__ */ u.jsx(_6, { segment: r })
    }
  );
}
const JT = ({ shouldScaleBackground: e = !0, ...t }) => /* @__PURE__ */ u.jsx(Ib, { shouldScaleBackground: e, ...t });
function QT({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(Re, { "data-slot": "drawer-trigger", className: e, ...t });
}
function H6({ ...e }) {
  return /* @__PURE__ */ u.jsx(Lb, { "data-slot": "drawer-portal", ...e });
}
function e7({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ u.jsx(ye.Close, { "data-slot": "drawer-close", className: e, ...t });
}
function K6({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    Bb,
    {
      "data-slot": "drawer-overlay",
      className: y("fixed inset-0 z-50 bg-black/80", e),
      ...t
    }
  );
}
function t7({ className: e, children: t, ...n }) {
  return /* @__PURE__ */ u.jsxs(H6, { children: [
    /* @__PURE__ */ u.jsx(K6, {}),
    /* @__PURE__ */ u.jsxs(
      Vb,
      {
        "data-slot": "drawer-content",
        className: y(
          "bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border",
          e
        ),
        ...n,
        children: [
          /* @__PURE__ */ u.jsx("div", { className: "mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" }),
          t
        ]
      }
    )
  ] });
}
const n7 = ({ className: e, ...t }) => /* @__PURE__ */ u.jsx("div", { "data-slot": "drawer-header", className: y("grid gap-1.5 p-4 text-center sm:text-left", e), ...t }), r7 = ({ className: e, ...t }) => /* @__PURE__ */ u.jsx("div", { "data-slot": "drawer-footer", className: y("mt-auto flex flex-col gap-2 p-4", e), ...t });
function a7({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    ye.Title,
    {
      "data-slot": "drawer-title",
      className: y("text-lg font-semibold leading-none tracking-tight", e),
      ...t
    }
  );
}
function i7({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    ye.Description,
    {
      "data-slot": "drawer-description",
      className: y("text-sm text-muted-foreground", e),
      ...t
    }
  );
}
const W6 = re(
  "text-sm leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "font-medium",
        secondary: "font-normal"
      }
    },
    defaultVariants: {
      variant: "primary"
    }
  }
);
function G6({
  className: e,
  variant: t,
  ...n
}) {
  return /* @__PURE__ */ u.jsx(Fb.Root, { "data-slot": "label", className: y(W6({ variant: t }), e), ...n });
}
const o7 = Ob, V0 = R.createContext({}), s7 = ({
  ...e
}) => /* @__PURE__ */ u.jsx(V0.Provider, { value: { name: e.name }, children: /* @__PURE__ */ u.jsx(zb, { ...e }) }), ca = () => {
  const e = R.useContext(V0), t = R.useContext(B0), { getFieldState: n, formState: r } = _b(), a = n(e.name, r);
  if (!e)
    throw new Error("useFormField should be used within <FormField>");
  const { id: i } = t;
  return {
    id: i,
    name: e.name,
    formItemId: `${i}-form-item`,
    formDescriptionId: `${i}-form-item-description`,
    formMessageId: `${i}-form-item-message`,
    ...a
  };
}, B0 = R.createContext({});
function l7({ className: e, ...t }) {
  const n = R.useId(), { error: r } = ca();
  return /* @__PURE__ */ u.jsx(B0.Provider, { value: { id: n }, children: /* @__PURE__ */ u.jsx("div", { "data-slot": "form-item", className: y("flex flex-col gap-2.5", e), "data-invalid": !!r, ...t }) });
}
function u7({ className: e, ...t }) {
  const { formItemId: n } = ca();
  return /* @__PURE__ */ u.jsx(
    G6,
    {
      "data-slot": "form-label",
      className: y("font-medium text-foreground", e),
      htmlFor: n,
      ...t
    }
  );
}
function c7({ ...e }) {
  const { error: t, formItemId: n, formDescriptionId: r, formMessageId: a } = ca();
  return /* @__PURE__ */ u.jsx(
    Qe,
    {
      "data-slot": "form-control",
      id: n,
      "aria-describedby": t ? `${r} ${a}` : `${r}`,
      "aria-invalid": !!t,
      ...e
    }
  );
}
function d7({ className: e, ...t }) {
  const { formDescriptionId: n, error: r } = ca();
  return r ? null : /* @__PURE__ */ u.jsx(
    "div",
    {
      "data-slot": "form-description",
      id: n,
      className: y("text-xs text-muted-foreground -mt-0.5", e),
      ...t
    }
  );
}
function f7({ className: e, children: t, ...n }) {
  const { error: r, formMessageId: a } = ca(), i = r ? String(r?.message) : t;
  return i ? /* @__PURE__ */ u.jsx(
    "div",
    {
      "data-slot": "form-message",
      id: a,
      className: y("-mt-0.5 text-xs font-normal text-destructive", e),
      ...n,
      children: i
    }
  ) : null;
}
const Y6 = re(
  "cursor-pointer relative overflow-hidden will-change-transform backface-visibility-hidden transform-gpu transition-transform duration-200 ease-out hover:scale-105 group whitespace-nowrap focus-visible:outline-hidden inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background disabled:pointer-events-none disabled:opacity-60 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-zinc-950 hover:bg-zinc-900 text-white border-gray-700 dark:bg-zinc-50 dark:border-gray-300 dark:text-zinc-950 dark:hover:bg-zinc-50",
        outline: "bg-background text-accent-foreground border border-input hover:bg-accent"
      },
      size: {
        default: "h-8.5 rounded-md px-3 gap-2 text-[0.8125rem] leading-none [&_svg]:size-4 gap-2",
        sm: "h-7 rounded-md px-2.5 gap-1.5 text-xs leading-none [&_svg]:size-3.5 gap-1.5",
        lg: "h-10 rounded-md px-4 gap-2.5 text-sm leading-none [&_svg]:size-5 gap-2.5"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function m7({
  initialStars: e = 0,
  targetStars: t = 0,
  starsClass: n = "",
  fixedWidth: r = !0,
  animationDuration: a = 2,
  animationDelay: i = 0,
  autoAnimate: o = !0,
  className: s,
  variant: l = "default",
  size: c = "default",
  showGithubIcon: d = !0,
  showStarIcon: f = !0,
  roundStars: m = !1,
  separator: h = !1,
  filled: p = !1,
  repoUrl: g,
  onClick: v,
  label: b = "",
  useInViewTrigger: x = !1,
  inViewOptions: C = { once: !0 },
  transition: w,
  ...E
}) {
  const [k, A] = _(e), [P, j] = _(!1), [T, M] = _(p ? 100 : 0), [L, O] = _(!1), Z = ($) => {
    const D = ["k", "M", "B", "T"];
    if (m && $ >= 1e3) {
      let N = -1, I = $;
      for (; I >= 1e3 && N < D.length - 1; )
        I /= 1e3, N++;
      return `${I % 1 === 0 ? I.toString() : I.toFixed(1)}${D[N]}`;
    }
    return $.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, Q = G(() => {
    if (P || L) return;
    j(!0);
    const $ = Date.now(), D = 0, N = t, I = a * 1e3, H = () => {
      const ne = Date.now() - $, X = Math.min(ne / I, 1), oe = 1 - Math.pow(1 - X, 4), le = Math.round(D + (N - D) * oe);
      A(le), M(X * 100), X < 1 ? requestAnimationFrame(H) : (A(N), M(100), j(!1), O(!0));
    };
    setTimeout(() => {
      requestAnimationFrame(H);
    }, i * 1e3);
  }, [P, L, t, a, i]), J = W.useRef(null), Y = cn(J, C);
  U(() => {
    O(!1), A(e);
  }, [t, e]), U(() => {
    x ? Y && !L && Q() : o && !L && Q();
  }, [o, x, Y, L, Q]);
  const K = () => {
    if (g)
      try {
        const $ = document.createElement("a");
        $.href = g, $.target = "_blank", $.rel = "noopener noreferrer", document.body.appendChild($), $.click(), document.body.removeChild($);
      } catch {
        try {
          window.open(g, "_blank", "noopener,noreferrer");
        } catch {
          window.location.href = g;
        }
      }
  }, te = ($) => {
    if (v) {
      v($);
      return;
    }
    g ? K() : L || Q();
  }, S = ($) => {
    ($.key === "Enter" || $.key === " ") && ($.preventDefault(), g ? K() : L || Q());
  };
  return /* @__PURE__ */ u.jsxs(
    "button",
    {
      ref: J,
      className: y(Y6({ variant: l, size: c, className: s }), h && "ps-0"),
      onClick: te,
      onKeyDown: S,
      role: "button",
      tabIndex: 0,
      "aria-label": g ? `Star ${b} on GitHub` : b,
      ...E,
      children: [
        d && /* @__PURE__ */ u.jsx(
          "div",
          {
            className: y(
              "h-full relative flex items-center justify-center",
              h && "w-9 bg-muted/60 border-e border-input"
            ),
            children: /* @__PURE__ */ u.jsx("svg", { role: "img", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ u.jsx("path", { d: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" }) })
          }
        ),
        b && /* @__PURE__ */ u.jsx("span", { children: b }),
        f && /* @__PURE__ */ u.jsxs("div", { className: "relative inline-flex shrink-0", children: [
          /* @__PURE__ */ u.jsx(Tu, { className: "fill-muted-foreground text-muted-foreground", "aria-hidden": "true" }),
          /* @__PURE__ */ u.jsx(
            Tu,
            {
              className: "absolute top-0 start-0 text-yellow-400 fill-yellow-400",
              size: 18,
              "aria-hidden": "true",
              style: {
                clipPath: `inset(${100 - T}% 0 0 0)`
              }
            }
          )
        ] }),
        /* @__PURE__ */ u.jsxs("div", { className: y("flex flex-col font-semibold relative overflow-hidden", n), children: [
          /* @__PURE__ */ u.jsx(
            de.div,
            {
              animate: { opacity: 1 },
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 30,
                ...w
              },
              className: "tabular-nums",
              children: /* @__PURE__ */ u.jsx("span", { children: k > 0 && Z(k) })
            }
          ),
          r && /* @__PURE__ */ u.jsx("span", { className: "opacity-0 h-0 overflow-hidden tabular-nums", children: Z(t) })
        ] })
      ]
    }
  );
}
function h7({
  className: e,
  transition: t = { duration: 10, ease: "easeInOut", repeat: 1 / 0 },
  ...n
}) {
  return /* @__PURE__ */ u.jsx(
    de.div,
    {
      "data-slot": "gradient-background",
      className: y(
        "size-full bg-gradient-to-br from-fuchsia-400 from-0% via-50% via-violet-500 to-fuchsia-600 to-100% bg-[length:300%_300%]",
        e
      ),
      animate: {
        backgroundPosition: ["0% 0%", "50% 50%", "100% 0%", "50% 100%", "0% 50%", "100% 100%", "0% 0%"]
      },
      whileTap: {
        scale: 0.98
      },
      transition: t,
      ...n
    }
  );
}
function p7({
  className: e,
  children: t,
  gridSize: n = "8:8",
  colors: r = {},
  beams: a = {},
  ...i
}) {
  const {
    background: o = "bg-slate-900",
    borderColor: s = "border-slate-700/50",
    borderSize: l = "1px",
    borderStyle: c = "solid"
  } = r, {
    count: d = 12,
    colors: f = [
      "bg-cyan-400",
      "bg-purple-400",
      "bg-fuchsia-400",
      "bg-violet-400",
      "bg-blue-400",
      "bg-indigo-400",
      "bg-green-400",
      "bg-yellow-400",
      "bg-orange-400",
      "bg-red-400",
      "bg-pink-400",
      "bg-rose-400"
    ],
    shadow: m = "shadow-lg shadow-cyan-400/50 rounded-full",
    speed: h = 4
  } = a, [p, g] = n.split(":").map(Number), v = R.useMemo(
    () => Array.from({ length: Math.min(d, 12) }, (x, C) => {
      const w = Math.random() > 0.5 ? "horizontal" : "vertical", E = Math.random() > 0.5 ? "start" : "end";
      return {
        id: C,
        color: f[C % f.length],
        direction: w,
        startPosition: E,
        // For horizontal beams: choose a row index (1 to rows-1) - exclude edges
        // For vertical beams: choose a column index (1 to cols-1) - exclude edges
        gridLine: w === "horizontal" ? Math.floor(Math.random() * (g - 1)) + 1 : Math.floor(Math.random() * (p - 1)) + 1,
        delay: Math.random() * 2,
        duration: h + Math.random() * 2
      };
    }),
    [d, f, h, p, g]
  ), b = {
    "--border-style": c
  };
  return /* @__PURE__ */ u.jsxs(
    de.div,
    {
      "data-slot": "grid-background",
      className: y("relative size-full overflow-hidden", o, e),
      style: b,
      ...i,
      children: [
        /* @__PURE__ */ u.jsx(
          "div",
          {
            className: y("absolute inset-0 size-full", s),
            style: {
              display: "grid",
              gridTemplateColumns: `repeat(${p}, 1fr)`,
              gridTemplateRows: `repeat(${g}, 1fr)`,
              borderRightWidth: l,
              borderBottomWidth: l,
              borderRightStyle: c,
              borderBottomStyle: c
            },
            children: Array.from({ length: p * g }).map((x, C) => /* @__PURE__ */ u.jsx(
              "div",
              {
                className: y("relative", s),
                style: {
                  borderTopWidth: l,
                  borderLeftWidth: l,
                  borderTopStyle: c,
                  borderLeftStyle: c
                }
              },
              C
            ))
          }
        ),
        v.map((x) => {
          const C = x.gridLine / g * 100, w = x.gridLine / p * 100;
          return /* @__PURE__ */ u.jsx(
            de.div,
            {
              className: y(
                "absolute rounded-full backdrop-blur-sm z-20",
                x.color,
                x.direction === "horizontal" ? "w-6 h-0.5" : "w-0.5 h-6",
                m
              ),
              style: {
                ...x.direction === "horizontal" ? {
                  // Position exactly on the horizontal grid line
                  top: `${C}%`,
                  left: x.startPosition === "start" ? "-12px" : "calc(100% + 12px)",
                  transform: "translateY(-50%)"
                  // Center on the line
                } : {
                  // Position exactly on the vertical grid line
                  left: `${w}%`,
                  top: x.startPosition === "start" ? "-12px" : "calc(100% + 12px)",
                  transform: "translateX(-50%)"
                  // Center on the line
                }
              },
              initial: {
                opacity: 0
              },
              animate: {
                opacity: [0, 1, 1, 0],
                ...x.direction === "horizontal" ? {
                  // Move across the full width of the container
                  x: x.startPosition === "start" ? [0, "calc(100vw + 24px)"] : [0, "calc(-100vw - 24px)"]
                } : {
                  // Move across the full height of the container
                  y: x.startPosition === "start" ? [0, "calc(100vh + 24px)"] : [0, "calc(-100vh - 24px)"]
                }
              },
              transition: {
                duration: x.duration,
                delay: x.delay,
                repeat: 1 / 0,
                repeatDelay: Math.random() * 3 + 2,
                // 2-5s pause between repeats
                ease: "linear",
                times: [0, 0.1, 0.9, 1]
                // Quick fade in, maintain, quick fade out
              }
            },
            x.id
          );
        }),
        /* @__PURE__ */ u.jsx("div", { className: "relative z-10 size-full", children: t })
      ]
    }
  );
}
function g7({ className: e, objectCount: t = 12, children: n, colors: r = {}, ...a }) {
  const {
    background: i = "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
    objects: o = [
      "bg-cyan-400/20",
      "bg-purple-400/20",
      "bg-fuchsia-400/20",
      "bg-violet-400/20",
      "bg-blue-400/20",
      "bg-indigo-400/20"
    ],
    glow: s = "shadow-cyan-400/50"
  } = r, [l, c] = R.useState(!1), d = zn(0), f = zn(0), m = Ir(d, {
    stiffness: 300,
    damping: 30,
    // Slower return to center when hover ends
    restSpeed: 0.1,
    restDelta: 0.1
  }), h = Ir(f, {
    stiffness: 300,
    damping: 30,
    restSpeed: 0.1,
    restDelta: 0.1
  }), p = R.useMemo(
    () => Array.from({ length: t }, (x, C) => {
      const w = Math.random() > 0.5 ? "circle" : "square";
      return {
        id: C,
        x: Math.random() * 90 + 5,
        // 5-95% to avoid edges
        y: Math.random() * 90 + 5,
        size: Math.random() * 60 + 20,
        // 20-80px
        color: o[C % o.length],
        delay: Math.random() * 2,
        shape: w,
        floatDirection: Math.random() > 0.5 ? 1 : -1,
        breathDuration: Math.random() * 3 + 3,
        // 3-6 seconds
        parallaxStrength: Math.random() * 0.5 + 0.3,
        // 0.3-0.8 for more varied parallax depth
        baseRotation: Math.random() * 360
        // Random starting rotation offset
      };
    }),
    [t, o]
  ), g = (x) => {
    if (!l) return;
    const C = x.currentTarget.getBoundingClientRect(), w = C.width / 2, E = C.height / 2, k = (x.clientX - C.left - w) / w, A = (x.clientY - C.top - E) / E;
    d.set(k * 15), f.set(A * 15);
  }, v = () => {
    c(!0);
  }, b = () => {
    c(!1), d.set(0), f.set(0);
  };
  return /* @__PURE__ */ u.jsxs(
    de.div,
    {
      "data-slot": "hover-background",
      className: y("relative size-full overflow-hidden", i, e),
      onHoverStart: v,
      onHoverEnd: b,
      onMouseMove: g,
      whileHover: { scale: 1.02 },
      transition: { duration: 0.3, ease: "easeOut" },
      animate: {
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
      },
      style: {
        backgroundSize: "200% 200%"
      },
      ...a,
      children: [
        /* @__PURE__ */ u.jsx(
          de.div,
          {
            className: "absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent",
            animate: {
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1]
            },
            transition: {
              duration: 4,
              repeat: 1 / 0,
              ease: "easeInOut"
            }
          }
        ),
        p.map((x) => /* @__PURE__ */ u.jsx(
          de.div,
          {
            className: y(
              "absolute backdrop-blur-sm border border-white/10",
              x.color,
              x.shape === "circle" ? "rounded-full" : "rounded-lg rotate-45"
            ),
            style: {
              left: `${x.x}%`,
              top: `${x.y}%`,
              width: x.size,
              height: x.size,
              // Apply parallax with individual object strength
              x: m.get() * x.parallaxStrength,
              y: h.get() * x.parallaxStrength
            },
            initial: {
              scale: 0.6,
              opacity: 0.4,
              rotate: x.baseRotation
            },
            animate: {
              // Default state animations - breathing with base rotation offset
              scale: [0.6, 0.8, 0.6],
              opacity: [0.4, 0.6, 0.4],
              rotate: x.shape === "circle" ? [x.baseRotation, x.baseRotation + 10, x.baseRotation] : [x.baseRotation, x.baseRotation + 5, x.baseRotation],
              y: [0, x.floatDirection * 15, 0],
              x: [0, x.floatDirection * 8, 0]
            },
            transition: {
              duration: x.breathDuration,
              delay: x.delay,
              ease: "easeInOut",
              repeat: 1 / 0,
              repeatType: "reverse"
            },
            whileHover: {
              scale: 1.5,
              boxShadow: `0 0 30px ${s.replace("shadow-", "").replace("/50", "")}`
            }
          },
          x.id
        )),
        l && /* @__PURE__ */ u.jsx("div", { className: "absolute inset-0 pointer-events-none", children: Array.from({ length: 20 }).map((x, C) => /* @__PURE__ */ u.jsx(
          de.div,
          {
            className: "absolute w-1 h-1 bg-white/60 rounded-full",
            style: {
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            },
            initial: { opacity: 0, scale: 0 },
            animate: {
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [0, -50, -100]
            },
            transition: {
              duration: 3,
              delay: Math.random() * 2,
              repeat: 1 / 0,
              ease: "easeOut"
            }
          },
          `particle-${C}`
        )) }),
        /* @__PURE__ */ u.jsx("div", { className: "relative z-10 size-full", children: n })
      ]
    }
  );
}
function v7({ ...e }) {
  return /* @__PURE__ */ u.jsx(Ga.Root, { "data-slot": "hover-card", ...e });
}
function b7({ ...e }) {
  return /* @__PURE__ */ u.jsx(Ga.Trigger, { "data-slot": "hover-card-trigger", ...e });
}
function y7({
  className: e,
  align: t = "center",
  sideOffset: n = 4,
  ...r
}) {
  return /* @__PURE__ */ u.jsx(Ga.Portal, { "data-slot": "hover-card-portal", children: /* @__PURE__ */ u.jsx(
    Ga.Content,
    {
      "data-slot": "hover-card-content",
      align: t,
      sideOffset: n,
      className: y(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
        e
      ),
      ...r
    }
  ) });
}
function x7({
  className: e,
  containerClassName: t,
  ...n
}) {
  return /* @__PURE__ */ u.jsx(
    Ub,
    {
      "data-slot": "input-otp",
      containerClassName: y("flex items-center gap-2 has-disabled:opacity-50", t),
      className: y("disabled:cursor-not-allowed", e),
      ...n
    }
  );
}
function w7({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "input-otp-group", className: y("flex items-center", e), ...t });
}
function $7({
  index: e,
  className: t,
  ...n
}) {
  const r = R.useContext(Hb), { char: a, hasFakeCaret: i, isActive: o } = r?.slots[e] ?? {};
  return /* @__PURE__ */ u.jsxs(
    "div",
    {
      "data-slot": "input-otp-slot",
      "data-active": o,
      className: y(
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        t
      ),
      ...n,
      children: [
        a,
        i && /* @__PURE__ */ u.jsx("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ u.jsx("div", { className: "animate-caret-blink bg-foreground h-4 w-px duration-1000" }) })
      ]
    }
  );
}
function D7({ ...e }) {
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "input-otp-separator", role: "separator", ...e, children: /* @__PURE__ */ u.jsx(Sb, {}) });
}
const q6 = re("inline-flex items-center justify-center font-mono rounded-md", {
  variants: {
    variant: {
      default: "bg-accent border border-border text-accent-foreground",
      outline: "text-accent-foreground border border-input"
    },
    size: {
      md: "h-7 min-w-7 px-1.5 text-xs [&_svg]:size-3.5",
      sm: "h-6 min-w-6 px-1 text-[0.75rem] leading-[0.75rem] [&_svg]:size-3",
      xs: "h-5 min-w-5 px-1 text-[0.6875rem] leading-[0.75rem] [&_svg]:size-3"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "md"
  }
});
function C7({ className: e, variant: t, size: n, ...r }) {
  return /* @__PURE__ */ u.jsx("kbd", { "data-slot": "kbd", className: y(q6({ variant: t, size: n }), e), ...r });
}
function E7({
  className: e,
  reverse: t = !1,
  pauseOnHover: n = !1,
  children: r,
  vertical: a = !1,
  repeat: i = 4,
  ariaLabel: o,
  ariaLive: s = "off",
  ariaRole: l = "marquee",
  ...c
}) {
  const d = B(null);
  return /* @__PURE__ */ u.jsx(
    "div",
    {
      ...c,
      ref: d,
      "data-slot": "marquee",
      className: y(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        {
          "flex-row": !a,
          "flex-col": a
        },
        e
      ),
      "aria-label": o,
      "aria-live": s,
      role: l,
      tabIndex: 0,
      children: W.useMemo(
        () => /* @__PURE__ */ u.jsx(u.Fragment, { children: Array.from({ length: i }, (f, m) => /* @__PURE__ */ u.jsx(
          "div",
          {
            className: y(
              a ? "flex-col [gap:var(--gap)]" : "flex-row [gap:var(--gap)]",
              "flex shrink-0 justify-around",
              !a && "animate-marquee flex-row",
              a && "animate-marquee-vertical flex-col",
              n && "group-hover:[animation-play-state:paused]",
              t && "[animation-direction:reverse]"
            ),
            children: r
          },
          m
        )) }),
        [i, r, a, n, t]
      )
    }
  );
}
function S7({ ...e }) {
  return /* @__PURE__ */ u.jsx(Ce.Menu, { "data-slot": "menubar-menu", ...e });
}
function T7({ ...e }) {
  return /* @__PURE__ */ u.jsx(Ce.Group, { "data-slot": "menubar-group", ...e });
}
function P7({ ...e }) {
  return /* @__PURE__ */ u.jsx(Ce.Portal, { "data-slot": "menubar-portal", ...e });
}
function k7({ ...e }) {
  return /* @__PURE__ */ u.jsx(Ce.RadioGroup, { "data-slot": "menubar-radio-group", ...e });
}
function N7({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    Ce.Root,
    {
      "data-slot": "menubar",
      className: y("flex h-10 items-center space-x-1 rounded-md border bg-background p-1", e),
      ...t
    }
  );
}
function A7({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    Ce.Trigger,
    {
      "data-slot": "menubar-trigger",
      className: y(
        "flex cursor-pointer select-none items-center rounded-md px-3 py-1.5 text-sm font-medium outline-hidden",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        "[&>svg]:pointer-events-none [&_svg:not([role=img]):not([class*=text-])]:opacity-60 [&_svg:not([class*=size-])]:size-4 [&>svg]:shrink-0",
        "data-[here=true]:bg-accent",
        e
      ),
      ...t
    }
  );
}
function j7({
  className: e,
  inset: t,
  children: n,
  ...r
}) {
  return /* @__PURE__ */ u.jsxs(
    Ce.SubTrigger,
    {
      "data-slot": "menubar-sub-tirgger",
      className: y(
        "flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-hidden",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        "[&>svg]:pointer-events-none [&_svg:not([role=img]):not([class*=text-])]:opacity-60 [&_svg:not([class*=size-])]:size-4 [&>svg]:shrink-0",
        "data-[here=true]:bg-accent data-[here=true]:text-accent-foreground",
        t && "ps-8",
        e
      ),
      ...r,
      children: [
        n,
        /* @__PURE__ */ u.jsx(vi, { className: "ms-auto size-3.5!" })
      ]
    }
  );
}
function M7({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    Ce.SubContent,
    {
      "data-slot": "menubar-sub-content",
      className: y(
        "space-y-0.5 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-2 text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        e
      ),
      ...t
    }
  );
}
function R7({
  className: e,
  align: t = "start",
  alignOffset: n = -4,
  sideOffset: r = 8,
  ...a
}) {
  return /* @__PURE__ */ u.jsx(Ce.Portal, { children: /* @__PURE__ */ u.jsx(
    Ce.Content,
    {
      "data-slot": "menubar-content",
      align: t,
      alignOffset: n,
      sideOffset: r,
      className: y(
        "space-y-0.5 z-50 min-w-[12rem] overflow-hidden rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-md shadow-black/5 transition-shadow data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        e
      ),
      ...a
    }
  ) });
}
function I7({
  className: e,
  inset: t,
  ...n
}) {
  return /* @__PURE__ */ u.jsx(
    Ce.Item,
    {
      "data-slot": "menubar-item",
      className: y(
        "relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-hidden data-disabled:pointer-events-none data-disabled:opacity-50",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
        t && "ps-8",
        e
      ),
      ...n
    }
  );
}
function V7({
  className: e,
  children: t,
  checked: n,
  ...r
}) {
  return /* @__PURE__ */ u.jsxs(
    Ce.CheckboxItem,
    {
      "data-slot": "menubar-checkbox-item",
      className: y(
        "relative flex cursor-default select-none items-center rounded-md py-1.5 ps-8 pe-2 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        e
      ),
      checked: n,
      ...r,
      children: [
        /* @__PURE__ */ u.jsx("span", { className: "absolute start-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ u.jsx(Ce.ItemIndicator, { children: /* @__PURE__ */ u.jsx(nt, { className: "h-4 w-4 text-primary" }) }) }),
        t
      ]
    }
  );
}
function B7({ className: e, children: t, ...n }) {
  return /* @__PURE__ */ u.jsxs(
    Ce.RadioItem,
    {
      "data-slot": "menubar-radio-item",
      className: y(
        "relative flex cursor-default select-none items-center rounded-md py-1.5 ps-8 pe-2 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        e
      ),
      ...n,
      children: [
        /* @__PURE__ */ u.jsx("span", { className: "absolute start-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ u.jsx(Ce.ItemIndicator, { children: /* @__PURE__ */ u.jsx(zs, { className: "h-2 w-2 fill-current" }) }) }),
        t
      ]
    }
  );
}
function L7({
  className: e,
  inset: t,
  ...n
}) {
  return /* @__PURE__ */ u.jsx(
    Ce.Label,
    {
      "data-slot": "menubar-label",
      className: y("px-2 py-1.5 text-sm font-semibold", t && "ps-8", e),
      ...n
    }
  );
}
function F7({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    Ce.Separator,
    {
      "data-slot": "menubar-separator",
      className: y("-mx-2 my-1.5 h-px bg-muted", e),
      ...t
    }
  );
}
function O7({ ...e }) {
  return /* @__PURE__ */ u.jsx(Ce.Sub, { "data-slot": "menubar-sub", ...e });
}
const z7 = ({ className: e, ...t }) => /* @__PURE__ */ u.jsx(
  "span",
  {
    "data-slot": "menubar-shortcut",
    className: y("ml-auto text-xs tracking-widest text-muted-foreground", e),
    ...t
  }
);
function _7({
  className: e,
  children: t,
  viewport: n = !0,
  ...r
}) {
  return /* @__PURE__ */ u.jsxs(
    Kt.Root,
    {
      "data-slot": "navigation-menu",
      "data-viewport": n,
      className: y("group/navigation-menu relative flex max-w-max flex-1 items-center justify-center", e),
      ...r,
      children: [
        t,
        n && /* @__PURE__ */ u.jsx(X6, {})
      ]
    }
  );
}
function U7({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    Kt.List,
    {
      "data-slot": "navigation-menu-list",
      className: y("group flex flex-1 list-none items-center justify-center gap-1", e),
      ...t
    }
  );
}
function H7({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(Kt.Item, { "data-slot": "navigation-menu-item", className: y("relative", e), ...t });
}
const Z6 = re(
  "cursor-pointer group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-accent/50 data-[state=open]:bg-accent/50 data-[active=true]:text-accent-foreground ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1"
);
function K7({
  className: e,
  children: t,
  ...n
}) {
  return /* @__PURE__ */ u.jsxs(
    Kt.Trigger,
    {
      "data-slot": "navigation-menu-trigger",
      className: y(Z6(), "group", e),
      ...n,
      children: [
        t,
        " ",
        /* @__PURE__ */ u.jsx(
          Nf,
          {
            className: "relative top-[1px] ms-1 size-3.5 opacity-60 transition duration-300 group-data-[state=open]:rotate-180",
            "aria-hidden": "true"
          }
        )
      ]
    }
  );
}
function W7({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    Kt.Content,
    {
      "data-slot": "navigation-menu-content",
      className: y(
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52! data-[motion=from-start]:slide-in-from-left-52! data-[motion=to-end]:slide-out-to-right-52! data-[motion=to-start]:slide-out-to-left-52! top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        e
      ),
      ...t
    }
  );
}
function X6({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ u.jsx("div", { className: y("absolute top-full left-0 isolate z-50 flex justify-center"), children: /* @__PURE__ */ u.jsx(
    Kt.Viewport,
    {
      "data-slot": "navigation-menu-viewport",
      className: y(
        "shadow-md shadow-black/5 rounded-md border border-border bg-popover text-popover-foreground p-1.5 origin-top-center data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden md:w-[var(--radix-navigation-menu-viewport-width)]",
        e
      ),
      ...t
    }
  ) });
}
function G7({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    Kt.Link,
    {
      "data-slot": "navigation-menu-link",
      className: y(
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 flex flex-col gap-1 rounded-md p-2 text-sm transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1",
        e
      ),
      ...t
    }
  );
}
function Y7({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ u.jsx(
    Kt.Indicator,
    {
      "data-slot": "navigation-menu-indicator",
      className: y(
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        e
      ),
      ...t,
      children: /* @__PURE__ */ u.jsx("div", { className: "bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-ts-md shadow-md" })
    }
  );
}
const q7 = ({ className: e, ...t }) => /* @__PURE__ */ u.jsx(
  "nav",
  {
    "data-slot": "pagination",
    role: "navigation",
    "aria-label": "pagination",
    className: y("mx-auto flex w-full justify-center", e),
    ...t
  }
);
function Z7({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx("ul", { "data-slot": "pagination-content", className: y("flex flex-row items-center gap-1", e), ...t });
}
function X7({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx("li", { "data-slot": "pagination-item", className: y("", e), ...t });
}
const J7 = ({ className: e, ...t }) => /* @__PURE__ */ u.jsxs(
  "span",
  {
    "data-slot": "pagination-ellipsis",
    "aria-hidden": !0,
    className: y("flex h-9 w-9 items-center justify-center", e),
    ...t,
    children: [
      /* @__PURE__ */ u.jsx(Ef, { className: "h-4 w-4" }),
      /* @__PURE__ */ u.jsx("span", { className: "sr-only", children: "More pages" })
    ]
  }
);
function Q7({
  className: e,
  indicatorClassName: t,
  value: n,
  ...r
}) {
  return /* @__PURE__ */ u.jsx(
    ku.Root,
    {
      "data-slot": "progress",
      className: y("relative h-1.5 w-full overflow-hidden rounded-full bg-secondary", e),
      ...r,
      children: /* @__PURE__ */ u.jsx(
        ku.Indicator,
        {
          "data-slot": "progress-indicator",
          className: y("h-full w-full flex-1 bg-primary transition-all", t),
          style: { transform: `translateX(-${100 - (n || 0)}%)` }
        }
      )
    }
  );
}
function eP({
  className: e,
  indicatorClassName: t,
  trackClassName: n,
  value: r = 0,
  size: a = 48,
  strokeWidth: i = 4,
  children: o,
  ...s
}) {
  const l = (a - i) / 2, c = l * 2 * Math.PI, d = c - r / 100 * c;
  return /* @__PURE__ */ u.jsxs(
    "div",
    {
      "data-slot": "progress-circle",
      className: y("relative inline-flex items-center justify-center", e),
      style: { width: a, height: a },
      ...s,
      children: [
        /* @__PURE__ */ u.jsxs("svg", { className: "absolute inset-0 -rotate-90", width: a, height: a, viewBox: `0 0 ${a} ${a}`, children: [
          /* @__PURE__ */ u.jsx(
            "circle",
            {
              "data-slot": "progress-circle-track",
              cx: a / 2,
              cy: a / 2,
              r: l,
              stroke: "currentColor",
              strokeWidth: i,
              fill: "none",
              className: y("text-secondary", n)
            }
          ),
          /* @__PURE__ */ u.jsx(
            "circle",
            {
              "data-slot": "progress-circle-indicator",
              cx: a / 2,
              cy: a / 2,
              r: l,
              stroke: "currentColor",
              strokeWidth: i,
              fill: "none",
              strokeDasharray: c,
              strokeDashoffset: d,
              strokeLinecap: "round",
              className: y("text-primary transition-all duration-300 ease-in-out", t)
            }
          )
        ] }),
        o && /* @__PURE__ */ u.jsx(
          "div",
          {
            "data-slot": "progress-circle-content",
            className: "relative z-10 flex items-center justify-center text-sm font-medium",
            children: o
          }
        )
      ]
    }
  );
}
function tP({
  className: e,
  value: t = 0,
  size: n = 120,
  strokeWidth: r = 8,
  startAngle: a = -90,
  endAngle: i = 90,
  showLabel: o = !1,
  trackClassName: s,
  indicatorClassName: l,
  children: c,
  ...d
}) {
  const f = (n - r) / 2, m = i - a, h = t / 100 * m, p = (E) => E * Math.PI / 180, g = n / 2 + f * Math.cos(p(a)), v = n / 2 + f * Math.sin(p(a)), b = n / 2 + f * Math.cos(p(a + h)), x = n / 2 + f * Math.sin(p(a + h)), C = h > 180 ? 1 : 0, w = ["M", g, v, "A", f, f, 0, C, 1, b, x].join(" ");
  return /* @__PURE__ */ u.jsxs(
    "div",
    {
      "data-slot": "progress-radial",
      className: y("relative inline-flex items-center justify-center", e),
      style: { width: n, height: n },
      ...d,
      children: [
        /* @__PURE__ */ u.jsxs("svg", { width: n, height: n, viewBox: `0 0 ${n} ${n}`, children: [
          /* @__PURE__ */ u.jsx(
            "path",
            {
              d: [
                "M",
                n / 2 + f * Math.cos(p(a)),
                n / 2 + f * Math.sin(p(a)),
                "A",
                f,
                f,
                0,
                m > 180 ? 1 : 0,
                1,
                n / 2 + f * Math.cos(p(i)),
                n / 2 + f * Math.sin(p(i))
              ].join(" "),
              stroke: "currentColor",
              strokeWidth: r,
              fill: "none",
              strokeLinecap: "round",
              className: y("text-secondary", s)
            }
          ),
          /* @__PURE__ */ u.jsx(
            "path",
            {
              d: w,
              stroke: "currentColor",
              strokeWidth: r,
              fill: "none",
              strokeLinecap: "round",
              className: y("text-primary transition-all duration-300 ease-in-out", l)
            }
          )
        ] }),
        (o || c) && /* @__PURE__ */ u.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: c || /* @__PURE__ */ u.jsxs("span", { className: "text-lg font-bold", children: [
          t,
          "%"
        ] }) })
      ]
    }
  );
}
const J6 = re("grid gap-2.5", {
  variants: {
    variant: {
      primary: "",
      mono: ""
    },
    size: {
      sm: "",
      md: "",
      lg: ""
    }
  },
  defaultVariants: {
    variant: "primary",
    size: "md"
  }
}), L0 = R.createContext({ variant: "primary", size: "md" });
function nP({
  className: e,
  variant: t,
  size: n,
  ...r
}) {
  return /* @__PURE__ */ u.jsx(L0.Provider, { value: { variant: t ?? "primary", size: n ?? "md" }, children: /* @__PURE__ */ u.jsx(
    Ho.Root,
    {
      "data-slot": "radio-group",
      className: y(J6({ variant: t, size: n }), e),
      ...r
    }
  ) });
}
const Q6 = re(
  `
    peer aspect-square rounded-full border outline-hidden ring-offset-background focus:outline-none focus-visible:ring-2 
    focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
    aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/20
    [[data-invalid=true]_&]:border-destructive/60 [[data-invalid=true]_&]:ring-destructive/10  dark:[[data-invalid=true]_&]:border-destructive dark:[[data-invalid=true]_&]:ring-destructive/20
    border-input text-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground  
  `,
  {
    variants: {
      size: {
        sm: "size-4.5 [&_svg]:size-2",
        md: "size-5 [&_svg]:size-2.5",
        lg: "size-5.5 [&_svg]:size-3"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);
function rP({
  className: e,
  size: t,
  ...n
}) {
  const { size: r } = R.useContext(L0), a = t ?? r;
  return /* @__PURE__ */ u.jsx(
    Ho.Item,
    {
      "data-slot": "radio-group-item",
      className: y(Q6({ size: a }), e),
      ...n,
      children: /* @__PURE__ */ u.jsx(Ho.Indicator, { "data-slot": "radio-group-indicator", className: "flex items-center justify-center", children: /* @__PURE__ */ u.jsx(zs, { className: "fill-current text-current" }) })
    }
  );
}
const aP = ({ className: e, ...t }) => /* @__PURE__ */ u.jsx(
  Ws.PanelGroup,
  {
    "data-slot": "resizable-panel-group",
    className: y("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", e),
    ...t
  }
), iP = Ws.Panel, oP = ({
  withHandle: e,
  className: t,
  ...n
}) => /* @__PURE__ */ u.jsx(
  Ws.PanelResizeHandle,
  {
    "data-slot": "resizable-handle",
    className: y(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      t
    ),
    ...n,
    children: e && /* @__PURE__ */ u.jsx("div", { className: "z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border", children: /* @__PURE__ */ u.jsx(kf, { className: "h-2.5 w-2.5" }) })
  }
);
function sP({
  className: e,
  viewportClassName: t,
  children: n,
  viewportRef: r,
  ...a
}) {
  return /* @__PURE__ */ u.jsxs(vr.Root, { "data-slot": "scroll-area", className: y("relative overflow-hidden", e), ...a, children: [
    /* @__PURE__ */ u.jsx(
      vr.Viewport,
      {
        ref: r,
        className: y("h-full w-full rounded-[inherit]", t),
        children: n
      }
    ),
    /* @__PURE__ */ u.jsx(eE, {}),
    /* @__PURE__ */ u.jsx(vr.Corner, {})
  ] });
}
function eE({
  className: e,
  orientation: t = "vertical",
  ...n
}) {
  return /* @__PURE__ */ u.jsx(
    vr.ScrollAreaScrollbar,
    {
      "data-slot": "scroll-area-scrollbar",
      orientation: t,
      className: y(
        "flex touch-none select-none transition-colors",
        t === "vertical" && "h-full w-2 border-l border-l-transparent p-[1px]",
        t === "horizontal" && "h-2 flex-col border-t border-t-transparent p-[1px]",
        e
      ),
      ...n,
      children: /* @__PURE__ */ u.jsx(vr.ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
    }
  );
}
function lP({
  children: e,
  targetRef: t,
  onUpdate: n,
  className: r,
  offset: a = 0,
  smooth: i = !0,
  dataAttribute: o = "scrollspy",
  history: s = !0
}) {
  const l = B(null), c = B(null), d = B(null), f = G(
    (g, v = !1) => {
      g && (c.current?.forEach((b) => {
        b.getAttribute(`data-${o}-anchor`) === g ? b.setAttribute("data-active", "true") : b.removeAttribute("data-active");
      }), n && n(g), s && (v || d.current !== g) && window.history.replaceState({}, "", `#${g}`), d.current = g);
    },
    [c, o, s, n]
  ), m = G(() => {
    if (!c.current || c.current.length === 0) return;
    const g = t?.current === document ? window : t?.current, v = g === window ? window.scrollY || document.documentElement.scrollTop : g.scrollTop;
    let b = 0, x = 1 / 0;
    if (c.current.forEach((E, k) => {
      const A = E.getAttribute(`data-${o}-anchor`), P = document.getElementById(A);
      if (!P) return;
      let j = a;
      const T = E.getAttribute(`data-${o}-offset`);
      T && (j = parseInt(T, 10));
      const M = Math.abs(P.offsetTop - j - v);
      P.offsetTop - j <= v && M < x && (x = M, b = k);
    }), g) {
      const E = g === window ? document.documentElement.scrollHeight : g.scrollHeight, k = g === window ? window.innerHeight : g.clientHeight;
      v + k >= E - 2 && (b = c.current.length - 1);
    }
    const w = c.current[b]?.getAttribute(`data-${o}-anchor`) || null;
    f(w), c.current.forEach((E, k) => {
      k !== b && E.removeAttribute("data-active");
    });
  }, [c, t, o, a, f]), h = G(
    (g) => (v) => {
      v && v.preventDefault();
      const b = g.getAttribute(`data-${o}-anchor`)?.replace("#", "") || null;
      if (!b) return;
      const x = document.getElementById(b);
      if (!x) return;
      const C = t?.current === document ? window : t?.current;
      let w = a;
      const E = g.getAttribute(`data-${o}-offset`);
      E && (w = parseInt(E, 10));
      const k = x.offsetTop - w;
      C && "scrollTo" in C && C.scrollTo({
        top: k,
        left: 0,
        behavior: i ? "smooth" : "auto"
      }), f(b, !0);
    },
    [o, a, i, t, f]
  ), p = G(() => {
    const g = CSS.escape(window.location.hash.replace("#", ""));
    if (g) {
      const v = document.querySelector(`[data-${o}-anchor="${g}"]`);
      v && h(v)();
    }
  }, [o, h]);
  return U(() => {
    l.current && (c.current = Array.from(l.current.querySelectorAll(`[data-${o}-anchor]`))), c.current?.forEach((v) => {
      v.addEventListener("click", h(v));
    });
    const g = t?.current === document ? window : t?.current;
    return g?.addEventListener("scroll", m), setTimeout(() => {
      p(), setTimeout(() => {
        m();
      }, 100);
    }, 100), () => {
      g?.removeEventListener("scroll", m), c.current?.forEach((v) => {
        v.removeEventListener("click", h(v));
      });
    };
  }, [t, l, m, o, h, p]), /* @__PURE__ */ u.jsx("div", { "data-slot": "scrollspy", className: r, ref: l, children: e });
}
function uP({ ...e }) {
  return /* @__PURE__ */ u.jsx(ye.Root, { "data-slot": "sheet", ...e });
}
function cP({ ...e }) {
  return /* @__PURE__ */ u.jsx(ye.Trigger, { "data-slot": "sheet-trigger", ...e });
}
function dP({ ...e }) {
  return /* @__PURE__ */ u.jsx(ye.Close, { "data-slot": "sheet-close", ...e });
}
function tE({ ...e }) {
  return /* @__PURE__ */ u.jsx(ye.Portal, { "data-slot": "sheet-portal", ...e });
}
function nE({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    ye.Overlay,
    {
      "data-slot": "sheet-overlay",
      className: y(
        "fixed inset-0 z-50 bg-black/30 [backdrop-filter:blur(4px)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        e
      ),
      ...t
    }
  );
}
const rE = re(
  "flex flex-col items-strech fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-400",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 start-0 h-full w-3/4 border-e data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm rtl:data-[state=closed]:slide-out-to-right rtl:data-[state=open]:slide-in-from-right",
        right: "inset-y-0 end-0 h-full w-3/4  border-s data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm rtl:data-[state=closed]:slide-out-to-left rtl:data-[state=open]:slide-in-from-left"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
function fP({
  side: e = "right",
  overlay: t = !0,
  close: n = !0,
  className: r,
  children: a,
  ...i
}) {
  return /* @__PURE__ */ u.jsxs(tE, { children: [
    t && /* @__PURE__ */ u.jsx(nE, {}),
    /* @__PURE__ */ u.jsxs(ye.Content, { className: y(rE({ side: e }), r), ...i, children: [
      a,
      n && /* @__PURE__ */ u.jsxs(
        ye.Close,
        {
          "data-slot": "sheet-close",
          className: "cursor-pointer absolute end-5 top-4 rounded-sm opacity-60 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
          children: [
            /* @__PURE__ */ u.jsx(Os, { className: "h-4 w-4" }),
            /* @__PURE__ */ u.jsx("span", { className: "sr-only", children: "Close" })
          ]
        }
      )
    ] })
  ] });
}
function mP({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    "div",
    {
      "data-slot": "sheet-header",
      className: y("flex flex-col space-y-1 text-center sm:text-start", e),
      ...t
    }
  );
}
function hP({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "sheet-body", className: y("py-2.5", e), ...t });
}
function pP({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    "div",
    {
      "data-slot": "sheet-footer",
      className: y("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", e),
      ...t
    }
  );
}
function gP({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    ye.Title,
    {
      "data-slot": "sheet-title",
      className: y("text-base font-semibold text-foreground", e),
      ...t
    }
  );
}
function vP({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    ye.Description,
    {
      "data-slot": "sheet-description",
      className: y("text-sm text-muted-foreground", e),
      ...t
    }
  );
}
function bP({
  text: e,
  duration: t = 2,
  delay: n = 0,
  repeat: r = !0,
  repeatDelay: a = 0.5,
  className: i,
  startOnView: o = !0,
  once: s = !1,
  inViewMargin: l,
  spread: c = 2,
  color: d,
  shimmerColor: f
}) {
  const m = B(null), h = cn(m, { once: s, margin: l }), p = F(() => e.length * c, [e, c]), g = !o || h;
  return /* @__PURE__ */ u.jsx(
    de.span,
    {
      ref: m,
      className: y(
        "relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent",
        "[--base-color:var(--color-zinc-400)] [--shimmer-color:var(--color-zinc-950)]",
        "[background-repeat:no-repeat,padding-box]",
        "[--shimmer-bg:linear-gradient(90deg,transparent_calc(50%-var(--spread)),var(--shimmer-color),transparent_calc(50%+var(--spread)))]",
        "dark:[--base-color:var(--color-zinc-600)] dark:[--shimmer-color:var(--color-white)]",
        i
      ),
      style: {
        "--spread": `${p}px`,
        ...d && { "--base-color": d },
        ...f && { "--shimmer-color": f },
        backgroundImage: "var(--shimmer-bg), linear-gradient(var(--base-color), var(--base-color))"
      },
      initial: {
        backgroundPosition: "100% center",
        opacity: 0
      },
      animate: g ? {
        backgroundPosition: "0% center",
        opacity: 1
      } : {},
      transition: {
        backgroundPosition: {
          repeat: r ? 1 / 0 : 0,
          duration: t,
          delay: n,
          repeatDelay: a,
          ease: "linear"
        },
        opacity: {
          duration: 0.3,
          delay: n
        }
      },
      children: e
    }
  );
}
function yP({
  className: e,
  patternColor: t = "#e5e7eb",
  patternOpacity: n = 0.3,
  ...r
}) {
  const a = `
    <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="bend-lines" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <!-- Bend lines pattern -->
          <path d="M0 10 Q15 5, 30 10 T60 10" stroke="${t}" stroke-width="1" fill="none" opacity="${n}"/>
          <path d="M0 20 Q15 15, 30 20 T60 20" stroke="${t}" stroke-width="1" fill="none" opacity="${n}"/>
          <path d="M0 30 Q15 25, 30 30 T60 30" stroke="${t}" stroke-width="1" fill="none" opacity="${n}"/>
          <path d="M0 40 Q15 35, 30 40 T60 40" stroke="${t}" stroke-width="1" fill="none" opacity="${n}"/>
          <path d="M0 50 Q15 45, 30 50 T60 50" stroke="${t}" stroke-width="1" fill="none" opacity="${n}"/>
          
          <!-- Vertical bend lines -->
          <path d="M10 0 Q5 15, 10 30 T10 60" stroke="${t}" stroke-width="1" fill="none" opacity="${n}"/>
          <path d="M20 0 Q15 15, 20 30 T20 60" stroke="${t}" stroke-width="1" fill="none" opacity="${n}"/>
          <path d="M30 0 Q25 15, 30 30 T30 60" stroke="${t}" stroke-width="1" fill="none" opacity="${n}"/>
          <path d="M40 0 Q35 15, 40 30 T40 60" stroke="${t}" stroke-width="1" fill="none" opacity="${n}"/>
          <path d="M50 0 Q45 15, 50 30 T50 60" stroke="${t}" stroke-width="1" fill="none" opacity="${n}"/>
          
          <!-- Diagonal bend lines -->
          <path d="M0 0 Q15 15, 30 30 T60 60" stroke="${t}" stroke-width="0.5" fill="none" opacity="${n * 0.7}"/>
          <path d="M60 0 Q45 15, 30 30 T0 60" stroke="${t}" stroke-width="0.5" fill="none" opacity="${n * 0.7}"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bend-lines)"/>
    </svg>
  `, i = encodeURIComponent(a);
  return /* @__PURE__ */ u.jsx(
    "div",
    {
      "data-slot": "skeleton-with-pattern",
      className: y("animate-pulse rounded-md bg-accent", e),
      style: {
        backgroundImage: `url("data:image/svg+xml,${i}")`,
        backgroundSize: "60px 60px",
        backgroundRepeat: "repeat"
      },
      ...r
    }
  );
}
function xP({ className: e, children: t, ...n }) {
  return /* @__PURE__ */ u.jsxs(
    Aa.Root,
    {
      "data-slot": "slider",
      className: y("relative flex h-4 w-full touch-none select-none items-center", e),
      ...n,
      children: [
        /* @__PURE__ */ u.jsx(Aa.Track, { className: "relative h-1.5 w-full overflow-hidden rounded-full bg-accent", children: /* @__PURE__ */ u.jsx(Aa.Range, { className: "absolute h-full bg-primary" }) }),
        t
      ]
    }
  );
}
function wP({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(
    Aa.Thumb,
    {
      "data-slot": "slider-thumb",
      className: y(
        "box-content block size-4 shrink-0 cursor-pointer rounded-full border-[2px] border-primary bg-primary-foreground shadow-xs shadow-black/5 outline-hidden focus:outline-hidden",
        e
      ),
      ...t
    }
  );
}
function aE({
  place: e,
  value: t,
  digitHeight: n,
  duration: r
}) {
  const a = Math.floor(t / e), i = Ir(a, {
    duration: r * 1e3
    // Convert to milliseconds
  });
  return U(() => {
    i.set(a);
  }, [i, a]), /* @__PURE__ */ u.jsx("div", { style: { height: n }, className: "relative w-[1ch] tabular-nums overflow-hidden", children: Array.from({ length: 10 }, (o, s) => /* @__PURE__ */ u.jsx(iE, { mv: i, number: s, digitHeight: n }, s)) });
}
function iE({ mv: e, number: t, digitHeight: n }) {
  const r = Rr(e, (a) => {
    const i = a % 10, o = (10 + t - i) % 10;
    let s = o * n;
    return o > 5 && (s -= 10 * n), s;
  });
  return /* @__PURE__ */ u.jsx(de.span, { style: { y: r }, className: "absolute inset-0 flex items-center justify-center", children: t });
}
function $P({
  from: e,
  to: t,
  duration: n = 2,
  delay: r = 0,
  startOnView: a = !0,
  once: i = !1,
  className: o = "",
  onComplete: s,
  digitHeight: l = 40
}) {
  const c = B(null), d = cn(c, { once: !1 }), [f, m] = _(e), [h, p] = _(!1), [g, v] = _(0);
  U(() => {
    m(e), p(!1), v((k) => k + 1);
  }, []), U(() => {
    m(e), p(!1), v((k) => k + 1);
  }, [e, t]), U(() => {
    if (!a || !d || i && h) return;
    const k = setTimeout(() => {
      v((A) => A + 1);
    }, 50);
    return () => clearTimeout(k);
  }, [d, a, i, h]);
  const b = !a || d && (!i || !h);
  U(() => {
    if (!b) return;
    p(!0);
    const k = setTimeout(() => {
      const A = Date.now(), P = f, j = t - P, T = () => {
        const M = Date.now() - A, L = Math.min(M / (n * 1e3), 1), O = 1 - Math.pow(1 - L, 3), Z = P + j * O;
        m(Z), L < 1 ? requestAnimationFrame(T) : (m(t), s?.());
      };
      requestAnimationFrame(T);
    }, r * 1e3);
    return () => clearTimeout(k);
  }, [b, f, t, n, r, s]);
  const x = Math.round(f), C = Math.abs(x), w = Math.max(Math.abs(e).toString().length, Math.abs(t).toString().length), E = Array.from({ length: w }, (k, A) => Math.pow(10, w - A - 1));
  return /* @__PURE__ */ u.jsxs("div", { ref: c, className: `flex items-center ${o}`, children: [
    x < 0 && "-",
    E.map((k) => /* @__PURE__ */ u.jsx(
      aE,
      {
        place: k,
        value: C,
        digitHeight: l,
        duration: n
      },
      `${k}-${g}`
    ))
  ] });
}
const DP = ({ ...e }) => {
  const { theme: t = "system" } = Kb();
  return /* @__PURE__ */ u.jsx(
    Wb,
    {
      theme: t,
      className: "group toaster [&_[data-type=success]>[data-icon]]:text-success [&_[data-type=success]_[data-title]]:text-success [&_[data-type=info]_[data-title]]:text-info [&_[data-type=error]>[data-icon]]:text-destructive [&_[data-type=error]_[data-title]]:text-destructive",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground! group-[.toaster]:border-border group-[.toaster]:shadow-lg has-[[role=alert]]:border-0! has-[[role=alert]]:shadow-none! has-[[role=alert]]:bg-transparent!",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:rounded-md! group-[.toast]:bg-primary group-[.toast]:text-primary-foreground!",
          cancelButton: "group-[.toast]:rounded-md! group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground!"
        }
      },
      ...e
    }
  );
}, tr = R.createContext({
  columns: {},
  setColumns: () => {
  },
  getItemId: () => "",
  columnIds: [],
  activeId: null,
  setActiveId: () => {
  },
  findContainer: () => {
  },
  isColumn: () => !1
}), F0 = R.createContext({
  attributes: {},
  listeners: void 0,
  isDragging: !1,
  disabled: !1
}), O0 = R.createContext({
  listeners: void 0,
  isDragging: !1,
  disabled: !1
}), oE = {
  ...hp,
  sideEffects: mp({
    styles: {
      active: {
        opacity: "0.4"
      }
    }
  })
};
function CP({ value: e, onValueChange: t, getItemValue: n, children: r, className: a, onMove: i }) {
  const o = e, s = t, [l, c] = R.useState(null), d = Mi(
    bt(Ii, {
      activationConstraint: {
        distance: 10
      }
    }),
    bt(er, {
      coordinateGetter: yp
    })
  ), f = R.useMemo(() => Object.keys(o), [o]), m = R.useCallback((x) => f.includes(x), [f]), h = R.useCallback(
    (x) => m(x) ? x : f.find((C) => o[C].some((w) => n(w) === x)),
    [o, f, n, m]
  ), p = R.useCallback((x) => {
    c(x.active.id);
  }, []), g = R.useCallback(
    (x) => {
      if (i)
        return;
      const { active: C, over: w } = x;
      if (!w || m(C.id)) return;
      const E = h(C.id), k = h(w.id);
      if (!E || !k || E === k)
        return;
      const A = o[E], P = o[k], j = A.findIndex((O) => n(O) === C.id);
      let T = P.findIndex((O) => n(O) === w.id);
      m(w.id) && (T = P.length);
      const M = [...P], [L] = A.splice(j, 1);
      M.splice(T, 0, L), s({
        ...o,
        [E]: [...A],
        [k]: M
      });
    },
    [h, n, m, s, o, i]
  ), v = R.useCallback(
    (x) => {
      const { active: C, over: w } = x;
      if (c(null), !w) return;
      if (i && !m(C.id)) {
        const A = h(C.id), P = h(w.id);
        if (A && P) {
          const j = o[A].findIndex((M) => n(M) === C.id), T = m(w.id) ? o[P].length : o[P].findIndex((M) => n(M) === w.id);
          i({
            event: x,
            activeContainer: A,
            activeIndex: j,
            overContainer: P,
            overIndex: T
          });
        }
        return;
      }
      if (m(C.id) && m(w.id)) {
        const A = f.indexOf(C.id), P = f.indexOf(w.id);
        if (A !== P) {
          const j = Fr(Object.keys(o), A, P), T = {};
          j.forEach((M) => {
            T[M] = o[M];
          }), s(T);
        }
        return;
      }
      const E = h(C.id), k = h(w.id);
      if (E && k && E === k) {
        const A = E, P = o[A].findIndex((T) => n(T) === C.id), j = o[A].findIndex((T) => n(T) === w.id);
        P !== j && s({
          ...o,
          [A]: Fr(o[A], P, j)
        });
      }
    },
    [f, o, h, n, m, s, i]
  ), b = R.useMemo(
    () => ({
      columns: o,
      setColumns: s,
      getItemId: n,
      columnIds: f,
      activeId: l,
      setActiveId: c,
      findContainer: h,
      isColumn: m
    }),
    [o, s, n, f, l, h, m]
  );
  return /* @__PURE__ */ u.jsx(tr.Provider, { value: b, children: /* @__PURE__ */ u.jsx(Li, { sensors: d, onDragStart: p, onDragOver: g, onDragEnd: v, children: /* @__PURE__ */ u.jsx("div", { "data-slot": "kanban", "data-dragging": l !== null, className: y(a), children: r }) }) });
}
function EP({ children: e, className: t }) {
  const { columnIds: n } = R.useContext(tr);
  return /* @__PURE__ */ u.jsx(Un, { items: n, strategy: Or, children: /* @__PURE__ */ u.jsx("div", { "data-slot": "kanban-board", className: y("grid auto-rows-fr sm:grid-cols-3 gap-4", t), children: e }) });
}
function SP({ value: e, className: t, children: n, disabled: r }) {
  const {
    setNodeRef: a,
    transform: i,
    transition: o,
    attributes: s,
    listeners: l,
    isDragging: c
  } = dn({
    id: e,
    disabled: r
  }), { activeId: d, isColumn: f } = R.useContext(tr), m = d ? f(d) : !1, h = {
    transition: o,
    transform: He.Translate.toString(i)
  };
  return /* @__PURE__ */ u.jsx(F0.Provider, { value: { attributes: s, listeners: l, isDragging: m, disabled: r }, children: /* @__PURE__ */ u.jsx(
    "div",
    {
      "data-slot": "kanban-column",
      "data-value": e,
      "data-dragging": c,
      "data-disabled": r,
      ref: a,
      style: h,
      className: y(
        "group/kanban-column flex flex-col",
        c && "opacity-50",
        r && "opacity-50",
        t
      ),
      children: n
    }
  ) });
}
function TP({ asChild: e, className: t, children: n, cursor: r = !0 }) {
  const { attributes: a, listeners: i, isDragging: o, disabled: s } = R.useContext(F0), l = e ? Qe : "div";
  return /* @__PURE__ */ u.jsx(
    l,
    {
      "data-slot": "kanban-column-handle",
      "data-dragging": o,
      "data-disabled": s,
      ...a,
      ...i,
      className: y(
        "opacity-0 transition-opacity group-hover/kanban-column:opacity-100",
        r && (o ? "!cursor-grabbing" : "!cursor-grab"),
        t
      ),
      children: n
    }
  );
}
function PP({ value: e, asChild: t = !1, className: n, children: r, disabled: a }) {
  const {
    setNodeRef: i,
    transform: o,
    transition: s,
    attributes: l,
    listeners: c,
    isDragging: d
  } = dn({
    id: e,
    disabled: a
  }), { activeId: f, isColumn: m } = R.useContext(tr), h = f ? !m(f) : !1, p = {
    transition: s,
    transform: He.Translate.toString(o)
  }, g = t ? Qe : "div";
  return /* @__PURE__ */ u.jsx(O0.Provider, { value: { listeners: c, isDragging: h, disabled: a }, children: /* @__PURE__ */ u.jsx(
    g,
    {
      "data-slot": "kanban-item",
      "data-value": e,
      "data-dragging": d,
      "data-disabled": a,
      ref: i,
      style: p,
      ...l,
      className: y(d && "opacity-50", a && "opacity-50", n),
      children: r
    }
  ) });
}
function kP({ asChild: e, className: t, children: n, cursor: r = !0 }) {
  const { listeners: a, isDragging: i, disabled: o } = R.useContext(O0), s = e ? Qe : "div";
  return /* @__PURE__ */ u.jsx(
    s,
    {
      "data-slot": "kanban-item-handle",
      "data-dragging": i,
      "data-disabled": o,
      ...a,
      className: y(r && (i ? "!cursor-grabbing" : "!cursor-grab"), t),
      children: n
    }
  );
}
function NP({ value: e, className: t, children: n }) {
  const { columns: r, getItemId: a } = R.useContext(tr), i = R.useMemo(() => r[e].map(a), [r, a, e]);
  return /* @__PURE__ */ u.jsx(Un, { items: i, strategy: Ul, children: /* @__PURE__ */ u.jsx("div", { "data-slot": "kanban-column-content", className: y("flex flex-col gap-2", t), children: n }) });
}
function AP({ children: e, className: t }) {
  const { activeId: n, isColumn: r } = R.useContext(tr), [a, i] = R.useState(null);
  R.useEffect(() => {
    if (n) {
      const l = document.querySelector(
        `[data-slot="kanban-${r(n) ? "column" : "item"}"][data-value="${n}"]`
      );
      if (l) {
        const c = l.getBoundingClientRect();
        i({ width: c.width, height: c.height });
      }
    } else
      i(null);
  }, [n, r]);
  const o = {
    width: a?.width,
    height: a?.height
  }, s = R.useMemo(() => n ? typeof e == "function" ? e({
    value: n,
    variant: r(n) ? "column" : "item"
  }) : e : null, [n, e, r]);
  return /* @__PURE__ */ u.jsx(pp, { dropAnimation: oE, children: /* @__PURE__ */ u.jsx(
    "div",
    {
      "data-slot": "kanban-overlay",
      "data-dragging": !0,
      style: o,
      className: y("pointer-events-none", t, n ? "!cursor-grabbing" : ""),
      children: s
    }
  ) });
}
const z0 = R.createContext({
  listeners: void 0,
  isDragging: !1,
  disabled: !1
});
function jP({
  value: e,
  onValueChange: t,
  getItemValue: n,
  children: r,
  className: a,
  onMove: i,
  strategy: o = "vertical",
  onDragStart: s,
  onDragEnd: l
}) {
  const [c, d] = R.useState(null), f = Mi(
    bt(Ii, {
      activationConstraint: {
        distance: 10
      }
    }),
    bt(er, {
      coordinateGetter: yp
    })
  ), m = R.useCallback((v) => {
    d(v.active.id), s?.(v);
  }, [s]), h = R.useCallback(
    (v) => {
      const { active: b, over: x } = v;
      if (d(null), l?.(v), !x) return;
      const C = e.findIndex((E) => n(E) === b.id), w = e.findIndex((E) => n(E) === x.id);
      if (C !== w)
        if (i)
          i({ event: v, activeIndex: C, overIndex: w });
        else {
          const E = Fr(e, C, w);
          t(E);
        }
    },
    [e, n, t, i, l]
  ), p = () => {
    switch (o) {
      case "horizontal":
        return Or;
      case "grid":
        return Or;
      case "vertical":
      default:
        return Ul;
    }
  }, g = R.useMemo(() => e.map(n), [e, n]);
  return /* @__PURE__ */ u.jsxs(Li, { sensors: f, onDragStart: m, onDragEnd: h, children: [
    /* @__PURE__ */ u.jsx(Un, { items: g, strategy: p(), children: /* @__PURE__ */ u.jsx(
      "div",
      {
        "data-slot": "sortable",
        "data-dragging": c !== null,
        className: y(a),
        children: r
      }
    ) }),
    /* @__PURE__ */ u.jsx(pp, { children: c ? /* @__PURE__ */ u.jsx("div", { className: "z-50", children: R.Children.map(r, (v) => R.isValidElement(v) && v.props.value === c ? R.cloneElement(v, {
      ...v.props,
      className: y(v.props.className, "z-50 shadow-lg")
    }) : null) }) : null })
  ] });
}
function MP({ value: e, asChild: t = !1, className: n, children: r, disabled: a }) {
  const {
    setNodeRef: i,
    transform: o,
    transition: s,
    attributes: l,
    listeners: c,
    isDragging: d
  } = dn({
    id: e,
    disabled: a
  }), f = {
    transition: s,
    transform: He.Translate.toString(o)
  }, m = t ? Qe : "div";
  return /* @__PURE__ */ u.jsx(z0.Provider, { value: { listeners: c, isDragging: d, disabled: a }, children: /* @__PURE__ */ u.jsx(
    m,
    {
      "data-slot": "sortable-item",
      "data-value": e,
      "data-dragging": d,
      "data-disabled": a,
      ref: i,
      style: f,
      ...l,
      className: y(
        d && "opacity-50 z-50",
        a && "opacity-50",
        n
      ),
      children: r
    }
  ) });
}
function RP({ asChild: e, className: t, children: n, cursor: r = !0 }) {
  const { listeners: a, isDragging: i, disabled: o } = R.useContext(z0), s = e ? Qe : "div";
  return /* @__PURE__ */ u.jsx(
    s,
    {
      "data-slot": "sortable-item-handle",
      "data-dragging": i,
      "data-disabled": o,
      ...a,
      className: y(r && (i ? "!cursor-grabbing" : "!cursor-grab"), t),
      children: n
    }
  );
}
const _0 = fe(void 0), U0 = fe(void 0);
function nr() {
  const e = ee(_0);
  if (!e) throw new Error("useStepper must be used within a Stepper");
  return e;
}
function Wn() {
  const e = ee(U0);
  if (!e) throw new Error("useStepItem must be used within a StepperItem");
  return e;
}
function IP({
  defaultValue: e = 1,
  value: t,
  onValueChange: n,
  orientation: r = "horizontal",
  className: a,
  children: i,
  indicators: o = {},
  ...s
}) {
  const [l, c] = R.useState(e), [d, f] = R.useState([]), m = R.useCallback((E) => {
    f((k) => E && !k.includes(E) ? [...k, E] : !E && k.includes(E) ? k.filter((A) => A !== E) : k);
  }, []), h = R.useCallback(
    (E) => {
      t === void 0 && c(E), n?.(E);
    },
    [t, n]
  ), p = t ?? l, g = (E) => {
    d[E] && d[E].focus();
  }, v = (E) => g((E + 1) % d.length), b = (E) => g((E - 1 + d.length) % d.length), x = () => g(0), C = () => g(d.length - 1), w = R.useMemo(
    () => ({
      activeStep: p,
      setActiveStep: h,
      stepsCount: R.Children.toArray(i).filter(
        (E) => R.isValidElement(E) && E.type.displayName === "StepperItem"
      ).length,
      orientation: r,
      registerTrigger: m,
      focusNext: v,
      focusPrev: b,
      focusFirst: x,
      focusLast: C,
      triggerNodes: d,
      indicators: o
    }),
    [p, h, i, r, m, d]
  );
  return /* @__PURE__ */ u.jsx(_0.Provider, { value: w, children: /* @__PURE__ */ u.jsx(
    "div",
    {
      role: "tablist",
      "aria-orientation": r,
      "data-slot": "stepper",
      className: y("w-full", a),
      "data-orientation": r,
      ...s,
      children: i
    }
  ) });
}
function VP({
  step: e,
  completed: t = !1,
  disabled: n = !1,
  loading: r = !1,
  className: a,
  children: i,
  ...o
}) {
  const { activeStep: s } = nr(), l = t || e < s ? "completed" : s === e ? "active" : "inactive", c = r && e === s;
  return /* @__PURE__ */ u.jsx(U0.Provider, { value: { step: e, state: l, isDisabled: n, isLoading: c }, children: /* @__PURE__ */ u.jsx(
    "div",
    {
      "data-slot": "stepper-item",
      className: y(
        "group/step flex items-center justify-center group-data-[orientation=horizontal]/stepper-nav:flex-row group-data-[orientation=vertical]/stepper-nav:flex-col not-last:flex-1",
        a
      ),
      "data-state": l,
      ...c ? { "data-loading": !0 } : {},
      ...o,
      children: i
    }
  ) });
}
function BP({ asChild: e = !1, className: t, children: n, tabIndex: r, ...a }) {
  const { state: i, isLoading: o } = Wn(), s = nr(), { setActiveStep: l, activeStep: c, registerTrigger: d, triggerNodes: f, focusNext: m, focusPrev: h, focusFirst: p, focusLast: g } = s, { step: v, isDisabled: b } = Wn(), x = c === v, C = `stepper-tab-${v}`, w = `stepper-panel-${v}`, E = R.useRef(null);
  R.useEffect(() => {
    E.current && d(E.current);
  }, [E.current]);
  const k = R.useMemo(
    () => f.findIndex((P) => P === E.current),
    [f, E.current]
  ), A = (P) => {
    switch (P.key) {
      case "ArrowRight":
      case "ArrowDown":
        P.preventDefault(), k !== -1 && m && m(k);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        P.preventDefault(), k !== -1 && h && h(k);
        break;
      case "Home":
        P.preventDefault(), p && p();
        break;
      case "End":
        P.preventDefault(), g && g();
        break;
      case "Enter":
      case " ":
        P.preventDefault(), l(v);
        break;
    }
  };
  return e ? /* @__PURE__ */ u.jsx("span", { "data-slot": "stepper-trigger", "data-state": i, className: t, children: n }) : /* @__PURE__ */ u.jsx(
    "button",
    {
      ref: E,
      role: "tab",
      id: C,
      "aria-selected": x,
      "aria-controls": w,
      tabIndex: typeof r == "number" ? r : x ? 0 : -1,
      "data-slot": "stepper-trigger",
      "data-state": i,
      "data-loading": o,
      className: y(
        "cursor-pointer focus-visible:border-ring focus-visible:ring-ring/50 inline-flex items-center gap-3 rounded-full outline-none focus-visible:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-60",
        t
      ),
      onClick: () => l(v),
      onKeyDown: A,
      disabled: b,
      ...a,
      children: n
    }
  );
}
function LP({ children: e, className: t }) {
  const { state: n, isLoading: r } = Wn(), { indicators: a } = nr();
  return /* @__PURE__ */ u.jsx(
    "div",
    {
      "data-slot": "stepper-indicator",
      "data-state": n,
      className: y(
        "relative flex items-center overflow-hidden justify-center size-6 shrink-0 border-background bg-accent text-accent-foreground rounded-full text-xs data-[state=completed]:bg-primary data-[state=completed]:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
        t
      ),
      children: /* @__PURE__ */ u.jsx("div", { className: "absolute", children: a && (r && a.loading || n === "completed" && a.completed || n === "active" && a.active || n === "inactive" && a.inactive) ? r && a.loading || n === "completed" && a.completed || n === "active" && a.active || n === "inactive" && a.inactive : e })
    }
  );
}
function FP({ className: e }) {
  const { state: t } = Wn();
  return /* @__PURE__ */ u.jsx(
    "div",
    {
      "data-slot": "stepper-separator",
      "data-state": t,
      className: y(
        "m-0.5 rounded-full bg-muted group-data-[orientation=vertical]/stepper-nav:h-12 group-data-[orientation=vertical]/stepper-nav:w-0.5 group-data-[orientation=horizontal]/stepper-nav:h-0.5 group-data-[orientation=horizontal]/stepper-nav:flex-1",
        e
      )
    }
  );
}
function OP({ children: e, className: t }) {
  const { state: n } = Wn();
  return /* @__PURE__ */ u.jsx("h3", { "data-slot": "stepper-title", "data-state": n, className: y("text-sm font-medium leading-none", t), children: e });
}
function zP({ children: e, className: t }) {
  const { state: n } = Wn();
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "stepper-description", "data-state": n, className: y("text-sm text-muted-foreground", t), children: e });
}
function _P({ children: e, className: t }) {
  const { activeStep: n, orientation: r } = nr();
  return /* @__PURE__ */ u.jsx(
    "nav",
    {
      "data-slot": "stepper-nav",
      "data-state": n,
      "data-orientation": r,
      className: y(
        "group/stepper-nav inline-flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col",
        t
      ),
      children: e
    }
  );
}
function UP({ children: e, className: t }) {
  const { activeStep: n } = nr();
  return /* @__PURE__ */ u.jsx("div", { "data-slot": "stepper-panel", "data-state": n, className: y("w-full", t), children: e });
}
function HP({ value: e, forceMount: t, children: n, className: r }) {
  const { activeStep: a } = nr(), i = e === a;
  return !t && !i ? null : /* @__PURE__ */ u.jsx(
    "div",
    {
      "data-slot": "stepper-content",
      "data-state": a,
      className: y("w-full", r, !i && t && "hidden"),
      hidden: !i && t,
      children: n
    }
  );
}
function KP({
  svg: e,
  children: t,
  className: n = "",
  fontSize: r = "20vw",
  fontWeight: a = "bold",
  as: i = "div"
}) {
  const o = B(null), [s, l] = _({ width: 0, height: 0 }), c = R.Children.toArray(t).join(""), d = R.useId();
  return U(() => {
    if (!o.current) return;
    const f = () => {
      const h = o.current?.getBoundingClientRect();
      h && l({
        width: Math.max(h.width, 200),
        height: Math.max(h.height, 100)
      });
    };
    f();
    const m = new ResizeObserver(f);
    return m.observe(o.current), () => m.disconnect();
  }, [c, r, a]), /* @__PURE__ */ u.jsxs(i, { className: y("relative inline-block", n), children: [
    /* @__PURE__ */ u.jsx(
      "div",
      {
        ref: o,
        className: "opacity-0 absolute pointer-events-none font-bold whitespace-nowrap",
        style: {
          fontSize: typeof r == "number" ? `${r}px` : r,
          fontWeight: a,
          fontFamily: "system-ui, -apple-system, sans-serif"
        },
        children: c
      }
    ),
    /* @__PURE__ */ u.jsxs(
      "svg",
      {
        className: "block",
        width: s.width,
        height: s.height,
        viewBox: `0 0 ${s.width} ${s.height}`,
        style: {
          fontSize: typeof r == "number" ? `${r}px` : r,
          fontWeight: a,
          fontFamily: "system-ui, -apple-system, sans-serif"
        },
        children: [
          /* @__PURE__ */ u.jsx("defs", { children: /* @__PURE__ */ u.jsxs("mask", { id: d, children: [
            /* @__PURE__ */ u.jsx("rect", { width: "100%", height: "100%", fill: "black" }),
            /* @__PURE__ */ u.jsx(
              "text",
              {
                x: "50%",
                y: "50%",
                textAnchor: "middle",
                dominantBaseline: "central",
                fill: "white",
                style: {
                  fontSize: typeof r == "number" ? `${r}px` : r,
                  fontWeight: a,
                  fontFamily: "system-ui, -apple-system, sans-serif"
                },
                children: c
              }
            )
          ] }) }),
          /* @__PURE__ */ u.jsx("g", { mask: `url(#${d})`, children: /* @__PURE__ */ u.jsx(
            "foreignObject",
            {
              width: "100%",
              height: "100%",
              style: {
                overflow: "visible"
              },
              children: /* @__PURE__ */ u.jsx(
                "div",
                {
                  style: {
                    width: `${s.width}px`,
                    height: `${s.height}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  },
                  children: /* @__PURE__ */ u.jsx(
                    "div",
                    {
                      style: {
                        width: "400px",
                        height: "200px",
                        transform: `scale(${Math.max(s.width / 400, s.height / 200)})`,
                        transformOrigin: "center"
                      },
                      children: e
                    }
                  )
                }
              )
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ u.jsx("span", { className: "sr-only", children: c })
  ] });
}
const H0 = R.createContext({
  permanent: !1
}), K0 = () => {
  const e = R.useContext(H0);
  if (!e)
    throw new Error("SwitchIndicator must be used within a Switch component");
  return e;
}, sE = re(
  `
    relative peer inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors 
    focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background 
    disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-input
    aria-invalid:border aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/20
    [[data-invalid=true]_&]:border [[data-invalid=true]_&]:border-destructive/60 [[data-invalid=true]_&]:ring-destructive/10  dark:[[data-invalid=true]_&]:border-destructive dark:[[data-invalid=true]_&]:ring-destructive/20
  `,
  {
    variants: {
      shape: {
        pill: "rounded-full",
        square: "rounded-md"
      },
      size: {
        sm: "h-5 w-8",
        md: "h-6 w-10",
        lg: "h-8 w-14",
        xl: "h-9 w-16"
      },
      permanent: {
        true: "bg-input",
        false: "data-[state=checked]:bg-primary"
      }
    },
    defaultVariants: {
      shape: "pill",
      permanent: !1,
      size: "md"
    }
  }
), lE = re(
  "pointer-events-none block bg-white w-1/2 h-[calc(100%-4px)] shadow-lg ring-0 transition-transform start-0 data-[state=unchecked]:translate-x-[2px] data-[state=checked]:translate-x-[calc(100%-2px)] rtl:data-[state=unchecked]:-translate-x-[2px] rtl:data-[state=checked]:-translate-x-[calc(100%-2px)]",
  {
    variants: {
      shape: {
        pill: "rounded-full",
        square: "rounded-md"
      },
      size: {
        xs: "",
        sm: "",
        md: "",
        lg: "",
        xl: ""
      }
    },
    compoundVariants: [
      {
        shape: "square",
        size: "xs",
        className: "rounded-sm"
      }
    ],
    defaultVariants: {
      shape: "pill",
      size: "md"
    }
  }
), uE = re(
  "text-sm font-medium absolute mx-[2px] top-1/2 w-1/2 -translate-y-1/2 flex pointer-events-none items-center justify-center text-center transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
  {
    variants: {
      state: {
        on: "start-0",
        off: "end-0"
      },
      permanent: {
        true: "",
        false: ""
      }
    },
    compoundVariants: [
      {
        state: "on",
        permanent: !1,
        className: "text-primary-foreground peer-data-[state=unchecked]:invisible peer-data-[state=unchecked]:translate-x-full rtl:peer-data-[state=unchecked]:-translate-x-full"
      },
      {
        state: "off",
        permanent: !1,
        className: "peer-data-[state=checked]:invisible -translate-x-full rtl:translate-x-full peer-data-[state=unchecked]:translate-x-0"
      },
      {
        state: "on",
        permanent: !0,
        className: "start-0"
      },
      {
        state: "off",
        permanent: !0,
        className: "end-0"
      }
    ],
    defaultVariants: {
      state: "off",
      permanent: !1
    }
  }
);
function WP({
  className: e,
  children: t,
  permanent: n = !1,
  ...r
}) {
  return /* @__PURE__ */ u.jsx(H0.Provider, { value: { permanent: n }, children: /* @__PURE__ */ u.jsx("div", { "data-slot": "switch-wrapper", className: y("relative inline-flex items-center", e), ...r, children: t }) });
}
function GP({
  className: e,
  thumbClassName: t = "",
  shape: n,
  size: r,
  ...a
}) {
  const o = K0()?.permanent ?? !1;
  return /* @__PURE__ */ u.jsx(
    Nu.Root,
    {
      "data-slot": "switch",
      className: y(sE({ shape: n, size: r, permanent: o }), e),
      ...a,
      children: /* @__PURE__ */ u.jsx(Nu.Thumb, { className: y(lE({ shape: n, size: r }), t) })
    }
  );
}
function YP({
  className: e,
  state: t,
  ...n
}) {
  const a = K0()?.permanent ?? !1;
  return /* @__PURE__ */ u.jsx(
    "span",
    {
      "data-slot": "switch-indicator",
      className: y(uE({ state: t, permanent: a }), e),
      ...n
    }
  );
}
const cE = re("flex items-center shrink-0", {
  variants: {
    variant: {
      default: "bg-accent p-1",
      button: "",
      line: "border-b border-border"
    },
    shape: {
      default: "",
      pill: ""
    },
    size: {
      lg: "gap-2.5",
      md: "gap-2",
      sm: "gap-1.5",
      xs: "gap-1"
    }
  },
  compoundVariants: [
    { variant: "default", size: "lg", className: "p-1.5 gap-2.5" },
    { variant: "default", size: "md", className: "p-1 gap-2" },
    { variant: "default", size: "sm", className: "p-1 gap-1.5" },
    { variant: "default", size: "xs", className: "p-1 gap-1" },
    {
      variant: "default",
      shape: "default",
      size: "lg",
      className: "rounded-lg"
    },
    {
      variant: "default",
      shape: "default",
      size: "md",
      className: "rounded-lg"
    },
    {
      variant: "default",
      shape: "default",
      size: "sm",
      className: "rounded-md"
    },
    {
      variant: "default",
      shape: "default",
      size: "xs",
      className: "rounded-md"
    },
    { variant: "line", size: "lg", className: "gap-9" },
    { variant: "line", size: "md", className: "gap-8" },
    { variant: "line", size: "sm", className: "gap-4" },
    { variant: "line", size: "xs", className: "gap-4" },
    {
      variant: "default",
      shape: "pill",
      className: "rounded-full [&_[role=tab]]:rounded-full"
    },
    {
      variant: "button",
      shape: "pill",
      className: "rounded-full [&_[role=tab]]:rounded-full"
    }
  ],
  defaultVariants: {
    variant: "default",
    size: "md"
  }
}), dE = re(
  "shrink-0 cursor-pointer whitespace-nowrap inline-flex justify-center items-center font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:shrink-0 [&_svg]:text-muted-foreground [&:hover_svg]:text-primary [&[data-state=active]_svg]:text-primary",
  {
    variants: {
      variant: {
        default: "text-muted-foreground data-[state=active]:bg-background hover:text-foreground data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:shadow-black/5",
        button: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg text-accent-foreground hover:text-foreground data-[state=active]:bg-accent data-[state=active]:text-foreground",
        line: "border-b-2 text-muted-foreground border-transparent data-[state=active]:border-primary hover:text-primary data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:text-primary"
      },
      size: {
        lg: "gap-2.5 [&_svg]:size-5 text-sm",
        md: "gap-2 [&_svg]:size-4 text-sm",
        sm: "gap-1.5 [&_svg]:size-3.5 text-xs",
        xs: "gap-1 [&_svg]:size-3.5 text-xs"
      }
    },
    compoundVariants: [
      { variant: "default", size: "lg", className: "py-2.5 px-4 rounded-md" },
      { variant: "default", size: "md", className: "py-1.5 px-3 rounded-md" },
      { variant: "default", size: "sm", className: "py-1.5 px-2.5 rounded-sm" },
      { variant: "default", size: "xs", className: "py-1 px-2 rounded-sm" },
      { variant: "button", size: "lg", className: "py-3 px-4 rounded-lg" },
      { variant: "button", size: "md", className: "py-2.5 px-3 rounded-lg" },
      { variant: "button", size: "sm", className: "py-2 px-2.5 rounded-md" },
      { variant: "button", size: "xs", className: "py-1.5 px-2 rounded-md" },
      { variant: "line", size: "lg", className: "py-3" },
      { variant: "line", size: "md", className: "py-2.5" },
      { variant: "line", size: "sm", className: "py-2" },
      { variant: "line", size: "xs", className: "py-1.5" }
    ],
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
), fE = re(
  "mt-2.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: ""
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
), W0 = R.createContext({
  variant: "default",
  size: "md"
});
function qP({ className: e, ...t }) {
  return /* @__PURE__ */ u.jsx(bi.Root, { "data-slot": "tabs", className: y("", e), ...t });
}
function ZP({
  className: e,
  variant: t = "default",
  shape: n = "default",
  size: r = "md",
  ...a
}) {
  return /* @__PURE__ */ u.jsx(W0.Provider, { value: { variant: t || "default", size: r || "md" }, children: /* @__PURE__ */ u.jsx(
    bi.List,
    {
      "data-slot": "tabs-list",
      className: y(cE({ variant: t, shape: n, size: r }), e),
      ...a
    }
  ) });
}
function XP({ className: e, ...t }) {
  const { variant: n, size: r } = R.useContext(W0);
  return /* @__PURE__ */ u.jsx(
    bi.Trigger,
    {
      "data-slot": "tabs-trigger",
      className: y(dE({ variant: n, size: r }), e),
      ...t
    }
  );
}
function JP({
  className: e,
  variant: t,
  ...n
}) {
  return /* @__PURE__ */ u.jsx(
    bi.Content,
    {
      "data-slot": "tabs-content",
      className: y(fE({ variant: t }), e),
      ...n
    }
  );
}
const mE = {
  fade: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.02 }
    }
  },
  slideUp: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.04 }
    }
  },
  slideDown: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.04 }
    }
  },
  slideLeft: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.04 }
    }
  },
  slideRight: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.04 }
    }
  },
  scale: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.06 }
    }
  },
  blur: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.03 }
    }
  },
  typewriter: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15 }
    }
  },
  wave: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12 }
    }
  },
  stagger: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08 }
    }
  },
  rotate: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.05 }
    }
  },
  elastic: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.07 }
    }
  }
}, hE = {
  fade: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  },
  slideUp: {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
  },
  slideDown: {
    hidden: { opacity: 0, y: -30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  },
  slideLeft: {
    hidden: { opacity: 0, x: 60, rotateY: 15 },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
    }
  },
  slideRight: {
    hidden: { opacity: 0, x: -60, rotateY: -15 },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
    }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
    }
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: "easeOut" }
    }
  },
  typewriter: {
    hidden: { width: 0 },
    visible: {
      width: "auto",
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  },
  wave: {
    hidden: { opacity: 0, y: 20, rotateZ: -5 },
    visible: {
      opacity: 1,
      y: [20, -10, 0],
      rotateZ: [-5, 5, 0],
      transition: {
        duration: 0.8,
        ease: [0.34, 1.56, 0.64, 1],
        times: [0, 0.5, 1]
      }
    }
  },
  stagger: {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  },
  rotate: {
    hidden: { opacity: 0, rotateY: -90 },
    visible: {
      opacity: 1,
      rotateY: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  },
  elastic: {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: [0, 1.2, 1],
      transition: {
        duration: 0.8,
        ease: [0.68, -0.55, 0.265, 1.55],
        times: [0, 0.6, 1]
      }
    }
  }
};
function QP({
  children: e,
  variant: t = "fade",
  className: n,
  style: r,
  delay: a = 0,
  duration: i = 0.6,
  staggerDelay: o = 0.03,
  once: s = !0,
  startOnView: l = !0,
  wordLevel: c = !1
}) {
  const d = B(null), f = cn(d, { once: s, margin: "-10%" }), [m, h] = _(!1), p = l ? f : !0, g = c ? e.split(" ").map((w, E, k) => E < k.length - 1 ? `${w} ` : w) : e.split(""), v = {
    ...mE[t],
    visible: {
      transition: {
        staggerChildren: o,
        delayChildren: a
      }
    }
  }, b = hE[t], x = i === 0.6 ? b : {
    hidden: b.hidden,
    visible: {
      ...b.visible,
      transition: {
        ...b.visible.transition,
        duration: i
      }
    }
  };
  U(() => {
    p && !m && h(!0);
  }, [p, m]);
  const C = t === "typewriter" ? de.div : de.span;
  return /* @__PURE__ */ u.jsx(
    de.div,
    {
      ref: d,
      className: y("inline-block", n),
      variants: v,
      initial: "hidden",
      animate: p ? "visible" : "hidden",
      style: {
        willChange: "transform, opacity",
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
        WebkitTransform: "translate3d(0,0,0)",
        transform: "translate3d(0,0,0)",
        isolation: "isolate",
        contain: "layout style paint",
        ...r
      },
      children: t === "typewriter" ? /* @__PURE__ */ u.jsx(
        de.span,
        {
          className: "inline-block overflow-hidden whitespace-nowrap",
          variants: x,
          style: {
            display: "inline-block",
            whiteSpace: "nowrap"
          },
          children: e
        }
      ) : g.map((w, E) => /* @__PURE__ */ u.jsx(
        C,
        {
          className: y("inline-block", {
            "whitespace-pre": !c
          }),
          variants: x,
          style: {
            display: "inline-block",
            transformOrigin: t === "rotate" ? "center center" : void 0,
            willChange: "transform, opacity",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
            WebkitTransform: "translate3d(0,0,0)",
            transform: "translate3d(0,0,0)",
            isolation: "isolate"
          },
          children: w === " " ? " " : w
        },
        E
      ))
    }
  );
}
const pE = re(
  `
    w-full bg-background border border-input bg-background text-foreground shadow-xs shadow-black/5 transition-[color,box-shadow] 
    text-foreground placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] 
    focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 [&[readonly]]:opacity-70 aria-invalid:border-destructive
    aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/20
  `,
  {
    variants: {
      variant: {
        sm: "px-2.5 py-2.5 text-xs rounded-md",
        md: "px-3 py-3 text-[0.8125rem] leading-(--text-sm--line-height) rounded-md",
        lg: "px-4 py-4 text-sm rounded-md"
      }
    },
    defaultVariants: {
      variant: "md"
    }
  }
);
function ek({
  className: e,
  variant: t,
  ...n
}) {
  return /* @__PURE__ */ u.jsx("textarea", { "data-slot": "textarea", className: y(pE({ variant: t }), e), ...n });
}
const G0 = re(
  "cursor-pointer inline-flex items-center justify-center rounded-md shrink-0 font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
      },
      size: {
        lg: "h-10 min-w-10 rounded-md px-2.5 text-sm gap-1.5 [&_svg]:size-4",
        md: "h-8.5 min-w-8.5 rounded-md px-2 text-[0.8125rem] leading-(--text-sm--line-height) gap-1 [&_svg]:size-4",
        sm: "h-7 min-w-7 rounded-md px-1.25 text-xs gap-1 [&_svg]:size-3.5"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);
function tk({
  className: e,
  variant: t,
  size: n,
  ...r
}) {
  return /* @__PURE__ */ u.jsx(Gb.Root, { "data-slot": "toggle", className: y(G0({ variant: t, size: n, className: e })), ...r });
}
const Y0 = R.createContext({
  size: "md",
  variant: "default"
});
function nk({
  className: e,
  variant: t,
  size: n,
  children: r,
  ...a
}) {
  return /* @__PURE__ */ u.jsx(
    Af.Root,
    {
      "data-slot": "toggle-group",
      "data-variant": t,
      "data-size": n,
      className: y(
        "group/toggle-group flex items-center rounded-md gap-1 data-[variant=outline]:gap-0 data-[variant=outline]:shadow-xs",
        e
      ),
      ...a,
      children: /* @__PURE__ */ u.jsx(Y0.Provider, { value: { variant: t, size: n }, children: r })
    }
  );
}
function rk({
  className: e,
  children: t,
  variant: n,
  size: r,
  ...a
}) {
  const i = R.useContext(Y0);
  return /* @__PURE__ */ u.jsx(
    Af.Item,
    {
      "data-slot": "toggle-group-item",
      "data-variant": i.variant || n,
      "data-size": i.size || r,
      className: y(
        G0({
          variant: i.variant || n,
          size: i.size || r
        }),
        "shrink-0 shadow-none data-[variant=outline]:rounded-none data-[variant=outline]:first:rounded-s-md data-[variant=outline]:last:rounded-e-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-s-0 data-[variant=outline]:first:border-s",
        e
      ),
      ...a,
      children: t
    }
  );
}
function gE({ delayDuration: e = 0, ...t }) {
  return /* @__PURE__ */ u.jsx(yi.Provider, { "data-slot": "tooltip-provider", delayDuration: e, ...t });
}
function ak({ ...e }) {
  return /* @__PURE__ */ u.jsx(gE, { children: /* @__PURE__ */ u.jsx(yi.Root, { "data-slot": "tooltip", ...e }) });
}
function ik({ ...e }) {
  return /* @__PURE__ */ u.jsx(yi.Trigger, { "data-slot": "tooltip-trigger", ...e });
}
const vE = re(
  "z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      variant: {
        light: "border border-border bg-background text-foreground shadow-md shadow-black/5",
        dark: "dark:border dark:border-border bg-zinc-950 text-white dark:bg-zinc-300 dark:text-black shadow-md shadow-black/5"
      }
    },
    defaultVariants: {
      variant: "dark"
    }
  }
);
function ok({
  className: e,
  sideOffset: t = 4,
  variant: n,
  ...r
}) {
  return /* @__PURE__ */ u.jsx(
    yi.Content,
    {
      "data-slot": "tooltip-content",
      sideOffset: t,
      className: y(vE({ variant: n }), e),
      ...r
    }
  );
}
const pu = R.createContext({
  indent: 20,
  currentItem: void 0,
  tree: void 0,
  toggleIconType: "plus-minus"
});
function gu() {
  return R.useContext(pu);
}
function sk({ indent: e = 20, tree: t, className: n, toggleIconType: r = "chevron", ...a }) {
  const i = t && typeof t.getContainerProps == "function" ? t.getContainerProps() : {}, o = { ...a, ...i }, { style: s, ...l } = o, c = {
    ...s,
    "--tree-indent": `${e}px`
  };
  return /* @__PURE__ */ u.jsx(pu.Provider, { value: { indent: e, tree: t, toggleIconType: r }, children: /* @__PURE__ */ u.jsx("div", { "data-slot": "tree", style: c, className: y("flex flex-col", n), ...l }) });
}
function lk({ item: e, className: t, asChild: n, children: r, ...a }) {
  const i = gu(), { indent: o } = i, s = typeof e.getProps == "function" ? e.getProps() : {}, l = { ...a, ...s }, { style: c, ...d } = l, f = {
    ...c,
    "--tree-padding": `${e.getItemMeta().level * o}px`
  }, m = n ? Qe : "button";
  return /* @__PURE__ */ u.jsx(pu.Provider, { value: { ...i, currentItem: e }, children: /* @__PURE__ */ u.jsx(
    m,
    {
      "data-slot": "tree-item",
      style: f,
      className: y(
        "z-10 ps-(--tree-padding) outline-hidden select-none not-last:pb-0.5 focus:z-20 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        t
      ),
      "data-focus": typeof e.isFocused == "function" ? e.isFocused() || !1 : void 0,
      "data-folder": typeof e.isFolder == "function" ? e.isFolder() || !1 : void 0,
      "data-selected": typeof e.isSelected == "function" ? e.isSelected() || !1 : void 0,
      "data-drag-target": typeof e.isDropTarget == "function" ? e.isDropTarget() || !1 : void 0,
      "data-search-match": typeof e.isMatchingSearch == "function" ? e.isMatchingSearch() || !1 : void 0,
      "aria-expanded": e.isExpanded(),
      ...d,
      children: r
    }
  ) });
}
function uk({ item: e, children: t, className: n, ...r }) {
  const { currentItem: a, toggleIconType: i } = gu(), o = e || a;
  return o ? /* @__PURE__ */ u.jsxs(
    "span",
    {
      "data-slot": "tree-item-label",
      className: y(
        "in-focus-visible:ring-ring/50 bg-background hover:bg-accent in-data-[selected=true]:bg-accent in-data-[selected=true]:text-accent-foreground in-data-[drag-target=true]:bg-accent flex items-center gap-1 rounded-sm px-2 py-1.5 text-sm transition-colors not-in-data-[folder=true]:ps-7 in-focus-visible:ring-[3px] in-data-[search-match=true]:bg-blue-50! [&_svg]:pointer-events-none [&_svg]:shrink-0",
        n
      ),
      ...r,
      children: [
        o.isFolder() && (i === "plus-minus" ? o.isExpanded() ? /* @__PURE__ */ u.jsx(Tb, { className: "text-muted-foreground size-3.5", stroke: "currentColor", strokeWidth: "1" }) : /* @__PURE__ */ u.jsx(Pb, { className: "text-muted-foreground size-3.5", stroke: "currentColor", strokeWidth: "1" }) : /* @__PURE__ */ u.jsx(Nf, { className: "text-muted-foreground size-4 in-aria-[expanded=false]:-rotate-90" })),
        t || (typeof o.getItemName == "function" ? o.getItemName() : null)
      ]
    }
  ) : (console.warn("TreeItemLabel: No item provided via props or context"), null);
}
function ck({ className: e, ...t }) {
  const { tree: n } = gu();
  if (!n || typeof n.getDragLineStyle != "function")
    return console.warn("TreeDragLine: No tree provided via context or tree does not have getDragLineStyle method"), null;
  const r = n.getDragLineStyle();
  return /* @__PURE__ */ u.jsx(
    "div",
    {
      style: r,
      className: y(
        "bg-primary before:bg-background before:border-primary absolute z-30 -mt-px h-0.5 w-[unset] before:absolute before:-top-[3px] before:left-0 before:size-2 before:rounded-full before:border-2",
        e
      ),
      ...t
    }
  );
}
const bE = {
  blinking: {
    opacity: [0, 0, 1, 1],
    transition: {
      duration: 1,
      repeat: 1 / 0,
      repeatDelay: 0,
      ease: "linear",
      times: [0, 0.5, 0.5, 1]
    }
  }
};
function dk({
  text: e,
  texts: t,
  speed: n = 100,
  delay: r = 0,
  showCursor: a = !0,
  cursorClassName: i = "",
  cursor: o = "|",
  loop: s = !1,
  pauseDuration: l = 2e3,
  className: c,
  onComplete: d,
  startOnView: f = !0,
  once: m = !1,
  inViewMargin: h,
  ...p
}) {
  const g = B(null), v = cn(g, { once: m, margin: h }), [b, x] = _(!1), [C, w] = _(""), [E, k] = _(0), [A, P] = _(!1), [j, T] = _(0), M = !f || v && (!m || !b), O = (t && t.length > 0 ? t : [e])[j] ?? "";
  U(() => {
    if (!M) return;
    const J = setTimeout(() => {
      P(!0), x(!0);
    }, r);
    return () => clearTimeout(J);
  }, [r, M]), U(() => {
    if (A) {
      if (E < O.length) {
        const J = setTimeout(() => {
          w(O.slice(0, E + 1)), k(E + 1);
        }, n);
        return () => clearTimeout(J);
      } else if (d?.(), s && t && t.length > 1) {
        const J = setTimeout(() => {
          w(""), k(0), T((Y) => (Y + 1) % t.length);
        }, l);
        return () => clearTimeout(J);
      }
    }
  }, [E, O, A, n, s, t, l, d]);
  const Z = {
    container: {
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0, transition: { staggerChildren: 0.02 } },
      exit: { opacity: 0 }
    }
  }, Q = de.span;
  return /* @__PURE__ */ u.jsx(
    Q,
    {
      ref: g,
      variants: Z.container,
      initial: "hidden",
      whileInView: f ? "show" : void 0,
      animate: f ? void 0 : "show",
      exit: "exit",
      className: y("whitespace-pre-wrap", c),
      viewport: { once: m },
      ...p,
      children: /* @__PURE__ */ u.jsxs("span", { style: { display: "inline-flex", alignItems: "center" }, children: [
        C,
        a && /* @__PURE__ */ u.jsx(
          de.span,
          {
            variants: bE,
            animate: "blinking",
            className: y("inline-block ms-1 font-normal text-foreground select-none w-px", i),
            children: o
          }
        )
      ] })
    }
  );
}
function fk({
  src: e,
  children: t,
  className: n = "",
  autoPlay: r = !0,
  muted: a = !0,
  loop: i = !0,
  preload: o = "auto",
  fontSize: s = "20vw",
  fontWeight: l = "bold",
  as: c = "div",
  onPlay: d,
  onPause: f,
  onEnded: m
}) {
  const h = B(null), p = B(null), g = B(null), v = B(null);
  U(() => {
    const C = h.current, w = p.current, E = g.current, k = v.current;
    if (!C || !w || !E || !k) return;
    const A = w.getContext("2d");
    if (!A) return;
    let P;
    const j = () => {
      const L = E.textContent || "";
      A.font = `${l} ${typeof s == "number" ? `${s}px` : s} system-ui, -apple-system, sans-serif`;
      const Z = A.measureText(L).width, Q = typeof s == "number" ? s : parseFloat(s.replace(/[^\d.]/g, "")) || 100, J = 40;
      w.width = Math.max(Z + J * 2, 400), w.height = Math.max(Q + J * 2, 200), A.clearRect(0, 0, w.width, w.height), A.drawImage(C, 0, 0, w.width, w.height), A.globalCompositeOperation = "destination-in", A.fillStyle = "white", A.font = `${l} ${typeof s == "number" ? `${s}px` : s} system-ui, -apple-system, sans-serif`, A.textAlign = "center", A.textBaseline = "middle", A.fillText(L, w.width / 2, w.height / 2), A.globalCompositeOperation = "source-over", P = requestAnimationFrame(j);
    }, T = () => {
      j();
    }, M = () => {
      j();
    };
    return C.addEventListener("loadeddata", T), C.addEventListener("play", j), window.addEventListener("resize", M), () => {
      C.removeEventListener("loadeddata", T), C.removeEventListener("play", j), window.removeEventListener("resize", M), P && cancelAnimationFrame(P);
    };
  }, [s, l]);
  const b = Array.isArray(e) ? e : [e], x = R.Children.toArray(t).join("");
  return /* @__PURE__ */ u.jsxs(c, { ref: v, className: y("relative inline-block overflow-hidden", n), children: [
    /* @__PURE__ */ u.jsxs(
      "video",
      {
        ref: h,
        className: "absolute opacity-0 pointer-events-none",
        autoPlay: r,
        muted: a,
        loop: i,
        preload: o,
        playsInline: !0,
        onPlay: d,
        onPause: f,
        onEnded: m,
        crossOrigin: "anonymous",
        children: [
          b.map((C, w) => /* @__PURE__ */ u.jsx("source", { src: C }, w)),
          "Your browser does not support the video tag."
        ]
      }
    ),
    /* @__PURE__ */ u.jsx(
      "canvas",
      {
        ref: p,
        className: "block",
        style: {
          width: "100%",
          height: "auto"
        }
      }
    ),
    /* @__PURE__ */ u.jsx(
      "div",
      {
        ref: g,
        className: "absolute opacity-0 pointer-events-none font-bold",
        style: {
          fontSize: typeof s == "number" ? `${s}px` : s,
          fontWeight: l
        },
        "aria-label": x,
        children: t
      }
    ),
    /* @__PURE__ */ u.jsx("span", { className: "sr-only", children: x })
  ] });
}
function mk({
  words: e,
  duration: t = 1500,
  animationStyle: n = "fade",
  loop: r = !0,
  className: a,
  containerClassName: i,
  pauseDuration: o = 300,
  startOnView: s = !0,
  once: l = !1,
  inViewMargin: c,
  ...d
}) {
  const f = B(null), m = cn(f, { once: l, margin: c }), [h, p] = _(!1), [g, v] = _(0), [b, x] = _(!0), C = {
    fade: {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: {
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1]
          // Custom cubic-bezier for smooth fade
        }
      },
      exit: {
        opacity: 0,
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 1, 1]
          // Faster exit
        }
      }
    },
    "slide-up": {
      initial: { opacity: 0, y: 24 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 25,
          mass: 0.8
        }
      },
      exit: {
        opacity: 0,
        y: -24,
        transition: {
          duration: 0.25,
          ease: [0.4, 0, 1, 1]
        }
      }
    },
    "slide-down": {
      initial: { opacity: 0, y: -24 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 25,
          mass: 0.8
        }
      },
      exit: {
        opacity: 0,
        y: 24,
        transition: {
          duration: 0.25,
          ease: [0.4, 0, 1, 1]
        }
      }
    },
    scale: {
      initial: { opacity: 0, scale: 0.8 },
      animate: {
        opacity: 1,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.6
        }
      },
      exit: {
        opacity: 0,
        scale: 0.9,
        transition: {
          duration: 0.2,
          ease: [0.4, 0, 1, 1]
        }
      }
    },
    flip: {
      initial: { opacity: 0, rotateX: 90 },
      animate: {
        opacity: 1,
        rotateX: 0,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 20,
          mass: 1
        }
      },
      exit: {
        opacity: 0,
        rotateX: -90,
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 1, 1]
        }
      }
    }
  }, w = !s || m && (!l || !h);
  return U(() => {
    if (!w) return;
    p(!0);
    const E = setInterval(() => {
      x(!1), setTimeout(() => {
        v((k) => r ? (k + 1) % e.length : k < e.length - 1 ? k + 1 : k), x(!0);
      }, o);
    }, t + o);
    return () => clearInterval(E);
  }, [w, t, o, e.length, r]), /* @__PURE__ */ u.jsx(de.span, { ref: f, className: y("inline-block overflow-hidden", i), ...d, children: /* @__PURE__ */ u.jsx(
    de.span,
    {
      initial: "initial",
      animate: b ? "animate" : "exit",
      exit: "exit",
      variants: C[n],
      transition: { duration: 0.5 },
      style: {
        perspective: n === "flip" ? 1e3 : void 0
      },
      className: y("inline-block overflow-hidden", a),
      children: e[g]
    },
    g
  ) });
}
const Uo = 992;
function hk() {
  const [e, t] = R.useState(
    void 0
  );
  return R.useEffect(() => {
    const n = window.matchMedia(`(max-width: ${Uo - 1}px)`), r = () => {
      t(window.innerWidth < Uo);
    };
    return n.addEventListener("change", r), t(window.innerWidth < Uo), () => n.removeEventListener("change", r);
  }, []), !!e;
}
export {
  RE as Accordion,
  BE as AccordionContent,
  IE as AccordionItem,
  LE as AccordionMenu,
  FE as AccordionMenuGroup,
  WE as AccordionMenuIndicator,
  _E as AccordionMenuItem,
  OE as AccordionMenuLabel,
  zE as AccordionMenuSeparator,
  UE as AccordionMenuSub,
  KE as AccordionMenuSubContent,
  HE as AccordionMenuSubTrigger,
  VE as AccordionTrigger,
  YE as Alert,
  QE as AlertContent,
  JE as AlertDescription,
  eS as AlertDialog,
  sS as AlertDialogAction,
  lS as AlertDialogCancel,
  nS as AlertDialogContent,
  oS as AlertDialogDescription,
  aS as AlertDialogFooter,
  rS as AlertDialogHeader,
  ay as AlertDialogOverlay,
  ry as AlertDialogPortal,
  iS as AlertDialogTitle,
  tS as AlertDialogTrigger,
  ZE as AlertIcon,
  qE as AlertTitle,
  XE as AlertToolbar,
  uS as AspectRatio,
  cS as Avatar,
  fS as AvatarFallback,
  gS as AvatarGroup,
  vS as AvatarGroupItem,
  ad as AvatarGroupTooltip,
  dS as AvatarImage,
  mS as AvatarIndicator,
  hS as AvatarStatus,
  bo as Badge,
  bS as BadgeButton,
  yS as BadgeDot,
  xS as Breadcrumb,
  SS as BreadcrumbEllipsis,
  $S as BreadcrumbItem,
  DS as BreadcrumbLink,
  wS as BreadcrumbList,
  CS as BreadcrumbPage,
  ES as BreadcrumbSeparator,
  Re as Button,
  GE as ButtonArrow,
  TS as Calendar,
  PS as Card,
  NS as CardContent,
  VS as CardDescription,
  jS as CardFooter,
  kS as CardHeader,
  MS as CardHeading,
  AS as CardTable,
  IS as CardTitle,
  RS as CardToolbar,
  BS as Carousel,
  LS as CarouselContent,
  FS as CarouselItem,
  zS as CarouselNext,
  OS as CarouselPrevious,
  _S as ChartContainer,
  KS as ChartLegend,
  WS as ChartLegendContent,
  Rw as ChartStyle,
  US as ChartTooltip,
  HS as ChartTooltipContent,
  Mh as Checkbox,
  GS as Code,
  YS as Collapsible,
  ZS as CollapsibleContent,
  qS as CollapsibleTrigger,
  Rh as Command,
  aT as CommandCheck,
  nT as CommandDialog,
  Gw as CommandEmpty,
  id as CommandGroup,
  Kw as CommandInput,
  od as CommandItem,
  Ww as CommandList,
  Yw as CommandSeparator,
  rT as CommandShortcut,
  iT as ContextMenu,
  pT as ContextMenuCheckboxItem,
  mT as ContextMenuContent,
  sT as ContextMenuGroup,
  hT as ContextMenuItem,
  vT as ContextMenuLabel,
  lT as ContextMenuPortal,
  cT as ContextMenuRadioGroup,
  gT as ContextMenuRadioItem,
  bT as ContextMenuSeparator,
  yT as ContextMenuShortcut,
  uT as ContextMenuSub,
  fT as ContextMenuSubContent,
  dT as ContextMenuSubTrigger,
  oT as ContextMenuTrigger,
  xT as CountingNumber,
  wT as DataGrid,
  DT as DataGridColumnFilter,
  PT as DataGridColumnHeader,
  kT as DataGridColumnVisibility,
  $T as DataGridContainer,
  RT as DataGridPagination,
  qw as DataGridProvider,
  LT as DataGridTable,
  Cl as DataGridTableBase,
  Nl as DataGridTableBody,
  Ml as DataGridTableBodyRow,
  Rl as DataGridTableBodyRowCell,
  Uh as DataGridTableBodyRowExpandded,
  Al as DataGridTableBodyRowSkeleton,
  jl as DataGridTableBodyRowSkeletonCell,
  FT as DataGridTableDnd,
  OT as DataGridTableDndRowHandle,
  zT as DataGridTableDndRows,
  Il as DataGridTableEmpty,
  El as DataGridTableHead,
  Sl as DataGridTableHeadRow,
  Tl as DataGridTableHeadRowCell,
  Pl as DataGridTableHeadRowCellResize,
  IT as DataGridTableLoader,
  VT as DataGridTableRowSelect,
  BT as DataGridTableRowSelectAll,
  kl as DataGridTableRowSpacer,
  HT as DataTable,
  qT as DateField,
  XT as DateInput,
  _6 as DateSegment,
  Fw as Dialog,
  eT as DialogBody,
  zw as DialogClose,
  Uw as DialogContent,
  tT as DialogDescription,
  QS as DialogFooter,
  JS as DialogHeader,
  _w as DialogOverlay,
  Ow as DialogPortal,
  Hw as DialogTitle,
  XS as DialogTrigger,
  JT as Drawer,
  e7 as DrawerClose,
  t7 as DrawerContent,
  i7 as DrawerDescription,
  r7 as DrawerFooter,
  n7 as DrawerHeader,
  K6 as DrawerOverlay,
  H6 as DrawerPortal,
  a7 as DrawerTitle,
  QT as DrawerTrigger,
  Vh as DropdownMenu,
  Fh as DropdownMenuCheckboxItem,
  Lh as DropdownMenuContent,
  CT as DropdownMenuGroup,
  yn as DropdownMenuItem,
  Oh as DropdownMenuLabel,
  e5 as DropdownMenuPortal,
  ST as DropdownMenuRadioGroup,
  ET as DropdownMenuRadioItem,
  xa as DropdownMenuSeparator,
  TT as DropdownMenuShortcut,
  r5 as DropdownMenuSub,
  n5 as DropdownMenuSubContent,
  t5 as DropdownMenuSubTrigger,
  Bh as DropdownMenuTrigger,
  o7 as Form,
  c7 as FormControl,
  d7 as FormDescription,
  s7 as FormField,
  l7 as FormItem,
  u7 as FormLabel,
  f7 as FormMessage,
  m7 as GithubButton,
  h7 as GradientBackground,
  p7 as GridBackground,
  g7 as HoverBackground,
  v7 as HoverCard,
  y7 as HoverCardContent,
  b7 as HoverCardTrigger,
  KT as Input,
  WT as InputAddon,
  GT as InputGroup,
  x7 as InputOTP,
  w7 as InputOTPGroup,
  D7 as InputOTPSeparator,
  $7 as InputOTPSlot,
  YT as InputWrapper,
  CP as Kanban,
  EP as KanbanBoard,
  SP as KanbanColumn,
  NP as KanbanColumnContent,
  TP as KanbanColumnHandle,
  PP as KanbanItem,
  kP as KanbanItemHandle,
  AP as KanbanOverlay,
  C7 as Kbd,
  G6 as Label,
  E7 as Marquee,
  N7 as Menubar,
  V7 as MenubarCheckboxItem,
  R7 as MenubarContent,
  T7 as MenubarGroup,
  I7 as MenubarItem,
  L7 as MenubarLabel,
  S7 as MenubarMenu,
  P7 as MenubarPortal,
  k7 as MenubarRadioGroup,
  B7 as MenubarRadioItem,
  F7 as MenubarSeparator,
  z7 as MenubarShortcut,
  O7 as MenubarSub,
  M7 as MenubarSubContent,
  j7 as MenubarSubTrigger,
  A7 as MenubarTrigger,
  _7 as NavigationMenu,
  W7 as NavigationMenuContent,
  Y7 as NavigationMenuIndicator,
  H7 as NavigationMenuItem,
  G7 as NavigationMenuLink,
  U7 as NavigationMenuList,
  K7 as NavigationMenuTrigger,
  X6 as NavigationMenuViewport,
  q7 as Pagination,
  Z7 as PaginationContent,
  J7 as PaginationEllipsis,
  X7 as PaginationItem,
  Zw as Popover,
  Jw as PopoverContent,
  Xw as PopoverTrigger,
  Q7 as Progress,
  eP as ProgressCircle,
  tP as ProgressRadial,
  nP as RadioGroup,
  rP as RadioGroupItem,
  oP as ResizableHandle,
  iP as ResizablePanel,
  aP as ResizablePanelGroup,
  sP as ScrollArea,
  eE as ScrollBar,
  lP as Scrollspy,
  a5 as Select,
  c5 as SelectContent,
  NT as SelectGroup,
  jT as SelectIndicator,
  d5 as SelectItem,
  AT as SelectLabel,
  u5 as SelectScrollDownButton,
  l5 as SelectScrollUpButton,
  MT as SelectSeparator,
  s5 as SelectTrigger,
  i5 as SelectValue,
  Qw as Separator,
  uP as Sheet,
  hP as SheetBody,
  dP as SheetClose,
  fP as SheetContent,
  vP as SheetDescription,
  pP as SheetFooter,
  mP as SheetHeader,
  nE as SheetOverlay,
  tE as SheetPortal,
  gP as SheetTitle,
  cP as SheetTrigger,
  bP as ShimmeringText,
  sd as Skeleton,
  yP as SkeletonWithPattern,
  xP as Slider,
  wP as SliderThumb,
  $P as SlidingNumber,
  jP as Sortable,
  MP as SortableItem,
  RP as SortableItemHandle,
  IP as Stepper,
  HP as StepperContent,
  zP as StepperDescription,
  LP as StepperIndicator,
  VP as StepperItem,
  _P as StepperNav,
  UP as StepperPanel,
  FP as StepperSeparator,
  OP as StepperTitle,
  BP as StepperTrigger,
  KP as SvgText,
  GP as Switch,
  YP as SwitchIndicator,
  WP as SwitchWrapper,
  oD as Table,
  lD as TableBody,
  UT as TableCaption,
  cD as TableCell,
  _T as TableFooter,
  uD as TableHead,
  sD as TableHeader,
  Dd as TableRow,
  qP as Tabs,
  JP as TabsContent,
  ZP as TabsList,
  XP as TabsTrigger,
  QP as TextReveal,
  ek as Textarea,
  ZT as TimeField,
  DP as Toaster,
  tk as Toggle,
  nk as ToggleGroup,
  rk as ToggleGroupItem,
  ak as Tooltip,
  ok as TooltipContent,
  gE as TooltipProvider,
  ik as TooltipTrigger,
  sk as Tree,
  ck as TreeDragLine,
  lk as TreeItem,
  uk as TreeItemLabel,
  dk as TypingText,
  fk as VideoText,
  mk as WordRotate,
  iy as avatarStatusVariants,
  Sw as badgeVariants,
  Tr as buttonVariants,
  y as cn,
  Bw as codeVariants,
  U6 as dateInputStyles,
  Y6 as githubButtonVariants,
  dD as inputAddonVariants,
  Hl as inputVariants,
  q6 as kbdVariants,
  Z6 as navigationMenuTriggerStyle,
  pE as textareaVariants,
  G0 as toggleVariants,
  $e as useDataGrid,
  ca as useFormField,
  hk as useIsMobile,
  Wn as useStepItem,
  nr as useStepper
};
//# sourceMappingURL=index.js.map
