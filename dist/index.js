import { useCallback } from 'react';
import { jsx } from 'react/jsx-runtime';

// src/hooks/useNoop.ts

// src/utils/noop.ts
function noop() {
}

// src/hooks/useNoop.ts
function useNoop() {
  return useCallback(() => noop(), []);
}
function NoopButton(props) {
  const onClick = useNoop();
  return /* @__PURE__ */ jsx("button", { type: "button", ...props, onClick });
}

// src/components/index.ts
var __components_placeholder = true;

// src/hooks/index.ts
var __hooks_placeholder = true;

// src/utils/index.ts
var __utils_placeholder = true;

export { NoopButton, __components_placeholder, __hooks_placeholder, __utils_placeholder, noop, useNoop };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map