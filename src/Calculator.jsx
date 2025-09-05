import React, { useState } from "react";


const tokenize = (s) => {
  const tokens = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];


    if (/\s/.test(ch)) { i++; continue; }


    if (/\d/.test(ch)) {
      let num = ch; i++;
      while (i < s.length && /\d/.test(s[i])) num += s[i++];
      tokens.push({ type: "num", value: parseInt(num, 10) });
      continue;
    }


    if ("+-*/()".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i++;
      continue;
    }

    throw new Error("Invalid character");
  }
  return tokens;
};

const prec = { "+": 1, "-": 1, "*": 2, "/": 2 };


const toRPN = (tokens) => {
  const out = [];
  const st = [];
  for (const t of tokens) {
    if (t.type === "num") {
      out.push(t);
    } else if ("+-*/".includes(t.value)) {
      while (
        st.length &&
        "+-*/".includes(st[st.length - 1].value) &&
        prec[t.value] <= prec[st[st.length - 1].value]
      ) {
        out.push(st.pop());
      }
      st.push(t);
    } else if (t.value === "(") {
      st.push(t);
    } else if (t.value === ")") {
      while (st.length && st[st.length - 1].value !== "(") out.push(st.pop());
      if (!st.length) throw new Error("Mismatched parentheses");
      st.pop(); 
    }
  }
  while (st.length) {
    const t = st.pop();
    if (t.value === "(" || t.value === ")") throw new Error("Mismatched parentheses");
    out.push(t);
  }
  return out;
};


const evalRPN = (rpn) => {
  const st = [];
  for (const t of rpn) {
    if (t.type === "num") st.push(t.value);
    else {
      const b = st.pop(), a = st.pop();
      if (a === undefined || b === undefined) throw new Error("Bad expression");
      let v;
      switch (t.value) {
        case "+": v = a + b; break;
        case "-": v = a - b; break;
        case "*": v = a * b; break;
        case "/": if (b === 0) throw new Error("Division by zero"); v = a / b; break;
        default: throw new Error("Unknown op");
      }
      st.push(v);
    }
  }
  if (st.length !== 1) throw new Error("Bad expression");
  return st[0];
};


export default function Calculator() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");

  const keys = [
    "7","8","9","+",
    "4","5","6","-",
    "1","2","3","*",
    "C","0","=","/",
  ];

  const onKey = (k) => {
    if (k === "C") { setExpr(""); setResult(""); return; }
    if (k === "=") {
      try {
        const value = evalRPN(toRPN(tokenize(expr)));
        setResult(String(value));
      } catch {
        setResult("Error");
      }
      return;
    }
   
    if (k === ".") return;
    setExpr((p) => p + k);
  };


  const styles = {
    wrap: { maxWidth: 420, margin: "30px auto", textAlign: "center" },
    title: { fontSize: 48, fontWeight: 700, marginBottom: 12, fontFamily: "serif" },
    input: { width: "75%", fontSize: 18, padding: "6px 10px", boxSizing: "border-box" },
    result: { fontSize: 28, color: "#666", margin: "12px 0 26px", minHeight: 32 },
    grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 26, justifyItems: "center" },
    btn: {
      width: 90, height: 90, fontSize: 26, borderRadius: 16,
      border: "2px solid #333", background: "#eee", boxShadow: "0 2px 0 #333",
      cursor: "pointer"
    }
  };

  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>React Calculator</h1>

      <input
        aria-label="expression"
        type="text"
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
        placeholder="Type"
        style={styles.input}
      />

      <div style={styles.result}>{result}</div>

      <div style={styles.grid}>
        {keys.map((k) => (
          <button key={k} style={styles.btn} onClick={() => onKey(k)} aria-label={`key-${k}`}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
