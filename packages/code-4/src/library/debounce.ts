export const getHashCode = (str = '') => {
  let hash = 0;
  if (str.length == 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
};

interface DebounceFuncInfo {
  lastCall: number;
  waitMs: number;
  timer: number;
}

export function trueDebounce(func: () => void, waitMs: number = 500) {
  const now = Date.now();
  const funcHash = getHashCode(func.toString());
  const funcRef = trueDebounce.funcDictionary[funcHash] || 
    { lastCall: now, waitMs, timer: 0 } as DebounceFuncInfo;
  
  window.clearTimeout(funcRef.timer);
  
  const timeLeft = funcRef.lastCall + waitMs - now;
  funcRef.timer = window.setTimeout(() => {
    func();
    funcRef.lastCall = Date.now();
  }, timeLeft);  
  
  trueDebounce.funcDictionary[funcHash] = funcRef;
}

// let's add a static for tracking the func hash last call and timer
trueDebounce.funcDictionary = {} as Record<string, DebounceFuncInfo>;