'use strict';

var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

// src/hooks/useNoop.ts

// src/utils/noop.ts
function noop() {
}

// src/hooks/useNoop.ts
function useNoop() {
  return react.useCallback(() => noop(), []);
}
function NoopButton(props) {
  const onClick = useNoop();
  return /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", ...props, onClick });
}

// src/components/index.ts
var __components_placeholder = true;

// src/hooks/index.ts
var __hooks_placeholder = true;

// src/utils/index.ts
var __utils_placeholder = true;

exports.NoopButton = NoopButton;
exports.__components_placeholder = __components_placeholder;
exports.__hooks_placeholder = __hooks_placeholder;
exports.__utils_placeholder = __utils_placeholder;
exports.noop = noop;
exports.useNoop = useNoop;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map