import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faClipboard,
  faRotateLeft,
  faSliders,
  faXmark
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useMemo, useState } from "react";

type UiTuneGroup = "配色" | "レイアウト" | "カード" | "地図" | "モバイル";

interface RangeControl {
  type: "range";
  id: string;
  group: UiTuneGroup;
  label: string;
  cssVar: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  unit: "px" | "svh" | "";
}

interface ColorControl {
  type: "color";
  id: string;
  group: UiTuneGroup;
  label: string;
  cssVar: string;
  defaultValue: string;
}

type UiTuneControl = RangeControl | ColorControl;
type UiTuneValues = Record<string, number | string>;

const UI_TUNE_STORAGE_KEY = "shindai-map:ui-tune:v1";
const UI_TUNE_GROUPS: UiTuneGroup[] = [
  "配色",
  "レイアウト",
  "カード",
  "地図",
  "モバイル"
];

const UI_TUNE_CONTROLS: UiTuneControl[] = [
  {
    type: "color",
    id: "accent",
    group: "配色",
    label: "アクセント",
    cssVar: "--accent",
    defaultValue: "#2563eb"
  },
  {
    type: "color",
    id: "accentStrong",
    group: "配色",
    label: "濃いアクセント",
    cssVar: "--accent-strong",
    defaultValue: "#1d4ed8"
  },
  {
    type: "color",
    id: "background",
    group: "配色",
    label: "背景",
    cssVar: "--bg",
    defaultValue: "#f8fafc"
  },
  {
    type: "range",
    id: "sidebarMin",
    group: "レイアウト",
    label: "左カラム最小",
    cssVar: "--tune-sidebar-min",
    defaultValue: 360,
    min: 300,
    max: 430,
    step: 2,
    unit: "px"
  },
  {
    type: "range",
    id: "sidebarMax",
    group: "レイアウト",
    label: "左カラム最大",
    cssVar: "--tune-sidebar-max",
    defaultValue: 440,
    min: 380,
    max: 560,
    step: 2,
    unit: "px"
  },
  {
    type: "range",
    id: "sidebarPadding",
    group: "レイアウト",
    label: "サイド余白",
    cssVar: "--tune-sidebar-padding",
    defaultValue: 18,
    min: 10,
    max: 30,
    step: 1,
    unit: "px"
  },
  {
    type: "range",
    id: "sidebarGap",
    group: "レイアウト",
    label: "サイド間隔",
    cssVar: "--tune-sidebar-gap",
    defaultValue: 16,
    min: 8,
    max: 28,
    step: 1,
    unit: "px"
  },
  {
    type: "range",
    id: "cardRadius",
    group: "カード",
    label: "カード角丸",
    cssVar: "--tune-card-radius",
    defaultValue: 8,
    min: 2,
    max: 18,
    step: 1,
    unit: "px"
  },
  {
    type: "range",
    id: "controlRadius",
    group: "カード",
    label: "操作角丸",
    cssVar: "--tune-control-radius",
    defaultValue: 8,
    min: 2,
    max: 18,
    step: 1,
    unit: "px"
  },
  {
    type: "range",
    id: "cardPadding",
    group: "カード",
    label: "カード内余白",
    cssVar: "--tune-card-padding",
    defaultValue: 12,
    min: 8,
    max: 22,
    step: 1,
    unit: "px"
  },
  {
    type: "range",
    id: "shadowOpacity",
    group: "カード",
    label: "影の濃さ",
    cssVar: "--tune-card-shadow-opacity",
    defaultValue: 0.06,
    min: 0,
    max: 0.16,
    step: 0.01,
    unit: ""
  },
  {
    type: "range",
    id: "fallbackGrid",
    group: "地図",
    label: "補助地図グリッド",
    cssVar: "--tune-fallback-grid-size",
    defaultValue: 96,
    min: 56,
    max: 140,
    step: 2,
    unit: "px"
  },
  {
    type: "range",
    id: "pinSize",
    group: "地図",
    label: "ピン通常",
    cssVar: "--tune-pin-size",
    defaultValue: 34,
    min: 24,
    max: 50,
    step: 1,
    unit: "px"
  },
  {
    type: "range",
    id: "activePinSize",
    group: "地図",
    label: "ピン選択中",
    cssVar: "--tune-pin-active-size",
    defaultValue: 46,
    min: 36,
    max: 70,
    step: 1,
    unit: "px"
  },
  {
    type: "range",
    id: "locateButtonSize",
    group: "地図",
    label: "現在地ボタン",
    cssVar: "--tune-locate-button-size",
    defaultValue: 48,
    min: 40,
    max: 62,
    step: 1,
    unit: "px"
  },
  {
    type: "range",
    id: "mobileSheetPeek",
    group: "モバイル",
    label: "下シートの残し幅",
    cssVar: "--tune-mobile-panel-peek",
    defaultValue: 112,
    min: 82,
    max: 170,
    step: 2,
    unit: "px"
  },
  {
    type: "range",
    id: "mobileSheetMax",
    group: "モバイル",
    label: "下シート最大高",
    cssVar: "--tune-mobile-panel-max-height",
    defaultValue: 78,
    min: 58,
    max: 92,
    step: 1,
    unit: "svh"
  },
  {
    type: "range",
    id: "mobileSheetRadius",
    group: "モバイル",
    label: "下シート角丸",
    cssVar: "--tune-mobile-panel-radius",
    defaultValue: 22,
    min: 12,
    max: 34,
    step: 1,
    unit: "px"
  },
  {
    type: "range",
    id: "mobileActionHeight",
    group: "モバイル",
    label: "アクション高さ",
    cssVar: "--tune-mobile-action-height",
    defaultValue: 76,
    min: 58,
    max: 98,
    step: 1,
    unit: "px"
  },
  {
    type: "range",
    id: "mobilePinSize",
    group: "モバイル",
    label: "モバイルピン",
    cssVar: "--tune-mobile-pin-size",
    defaultValue: 38,
    min: 30,
    max: 52,
    step: 1,
    unit: "px"
  },
  {
    type: "range",
    id: "mobileActivePinSize",
    group: "モバイル",
    label: "モバイル選択ピン",
    cssVar: "--tune-mobile-active-pin-size",
    defaultValue: 68,
    min: 52,
    max: 86,
    step: 1,
    unit: "px"
  }
];

const createDefaultValues = () =>
  UI_TUNE_CONTROLS.reduce<UiTuneValues>((values, control) => {
    values[control.id] = control.defaultValue;
    return values;
  }, {});

const isColorValue = (value: unknown): value is string =>
  typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);

const sanitizeValues = (rawValues: unknown) => {
  if (!rawValues || typeof rawValues !== "object") return createDefaultValues();

  const source = rawValues as Record<string, unknown>;
  return UI_TUNE_CONTROLS.reduce<UiTuneValues>((values, control) => {
    const rawValue = source[control.id];
    if (control.type === "color") {
      values[control.id] = isColorValue(rawValue) ? rawValue : control.defaultValue;
      return values;
    }

    const numericValue =
      typeof rawValue === "number" ? rawValue : Number.parseFloat(String(rawValue));
    values[control.id] = Number.isFinite(numericValue)
      ? Math.min(control.max, Math.max(control.min, numericValue))
      : control.defaultValue;
    return values;
  }, {});
};

const readSavedValues = () => {
  try {
    const stored = window.localStorage.getItem(UI_TUNE_STORAGE_KEY);
    return stored ? sanitizeValues(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
};

const formatValue = (control: UiTuneControl, value: number | string) => {
  if (control.type === "color") return String(value);
  const numericValue = typeof value === "number" ? value : control.defaultValue;
  return `${Number(numericValue.toFixed(2))}${control.unit}`;
};

export default function UiTuneKit() {
  const [enabled, setEnabled] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [values, setValues] = useState<UiTuneValues>(() => createDefaultValues());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("uiTune") === "1" || params.get("tune") === "1";
    const disabled = params.get("uiTune") === "0" || params.get("tune") === "0";

    if (disabled) {
      window.localStorage.removeItem(UI_TUNE_STORAGE_KEY);
      setValues(createDefaultValues());
      setEnabled(false);
      setHydrated(true);
      return;
    }

    const savedValues = readSavedValues();
    if (savedValues) {
      setValues(savedValues);
    }

    setEnabled(import.meta.env.DEV || requested || Boolean(savedValues));
    setPanelOpen(requested);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const root = document.documentElement;
    for (const control of UI_TUNE_CONTROLS) {
      if (enabled) {
        root.style.setProperty(control.cssVar, formatValue(control, values[control.id]));
      } else {
        root.style.removeProperty(control.cssVar);
      }
    }

    return () => {
      for (const control of UI_TUNE_CONTROLS) {
        root.style.removeProperty(control.cssVar);
      }
    };
  }, [enabled, hydrated, values]);

  useEffect(() => {
    if (!enabled || !hydrated) return;
    window.localStorage.setItem(UI_TUNE_STORAGE_KEY, JSON.stringify(values));
  }, [enabled, hydrated, values]);

  const cssText = useMemo(
    () =>
      `:root {\n${UI_TUNE_CONTROLS.map(
        (control) => `  ${control.cssVar}: ${formatValue(control, values[control.id])};`
      ).join("\n")}\n}`,
    [values]
  );

  const groupedControls = useMemo(
    () =>
      UI_TUNE_GROUPS.map((group) => ({
        group,
        controls: UI_TUNE_CONTROLS.filter((control) => control.group === group)
      })).filter((item) => item.controls.length > 0),
    []
  );

  const updateValue = (control: UiTuneControl, value: string) => {
    setCopied(false);
    setValues((currentValues) => ({
      ...currentValues,
      [control.id]: control.type === "range" ? Number(value) : value
    }));
  };

  const resetValues = () => {
    setCopied(false);
    setValues(createDefaultValues());
  };

  const copyCss = async () => {
    try {
      await navigator.clipboard.writeText(cssText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  if (!enabled) return null;

  return (
    <div className={`ui-tune-kit ${panelOpen ? "is-open" : ""}`}>
      <button
        className="ui-tune-toggle"
        type="button"
        aria-label={panelOpen ? "UI微調整を閉じる" : "UI微調整を開く"}
        aria-expanded={panelOpen}
        onClick={() => setPanelOpen((open) => !open)}
      >
        <FontAwesomeIcon icon={panelOpen ? faXmark : faSliders} />
      </button>

      {panelOpen && (
        <section className="ui-tune-panel" aria-label="UI微調整キット">
          <div className="ui-tune-header">
            <div>
              <p>ShindaiMap</p>
              <h2>UI微調整</h2>
            </div>
            <div className="ui-tune-actions">
              <button type="button" onClick={resetValues} aria-label="初期値に戻す">
                <FontAwesomeIcon icon={faRotateLeft} />
              </button>
              <button type="button" onClick={copyCss} aria-label="CSSをコピー">
                <FontAwesomeIcon icon={copied ? faCheck : faClipboard} />
              </button>
            </div>
          </div>

          <div className="ui-tune-groups">
            {groupedControls.map(({ group, controls }) => (
              <section key={group} className="ui-tune-group" aria-label={group}>
                <h3>{group}</h3>
                {controls.map((control) => {
                  const value = values[control.id];
                  return (
                    <label key={control.id} className="ui-tune-control">
                      <span className="ui-tune-control-top">
                        <span>{control.label}</span>
                        <output>{formatValue(control, value)}</output>
                      </span>
                      {control.type === "color" ? (
                        <input
                          type="color"
                          value={String(value)}
                          onChange={(event) => updateValue(control, event.target.value)}
                        />
                      ) : (
                        <input
                          type="range"
                          min={control.min}
                          max={control.max}
                          step={control.step}
                          value={Number(value)}
                          onChange={(event) => updateValue(control, event.target.value)}
                        />
                      )}
                    </label>
                  );
                })}
              </section>
            ))}
          </div>

          <textarea className="ui-tune-css" readOnly value={cssText} aria-label="CSS出力" />
        </section>
      )}
    </div>
  );
}
