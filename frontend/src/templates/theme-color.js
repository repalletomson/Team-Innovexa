export let themes = [
  "bootstrap5",
  "bootstrap5dark",
  "tailwind",
  "tailwinddark",
  "material",
  "materialdark",
  "bootstrap4",
  "bootstrap",
  "bootstrapdark",
  "fabric",
  "fabricdark",
  "highcontrast",
  "fluent",
  "fluentdark",
  "material3",
  "material3dark",
  "fluent2",
  "fluent2dark",
  "fluent2highcontrast",
];

export let borderColor = [
  "#FD7E14",
  "#FD7E14",
  "#5A61F6",
  "#8B5CF6",
  "#00bdae",
  "#9ECB08",
  "#a16ee5",
  "#a16ee5",
  "#a16ee5",
  "#4472c4",
  "#4472c4",
  "#79ECE4",
  "#1AC9E6",
  "#1AC9E6",
  "#6355C7",
  "#4EAAFF",
  "#6200EE",
  "#9BB449",
  "#9BB449",
];

export let loadChartTheme = (args, isGradient) => {
  let selectedTheme = window.location.hash.split("/")[1] || "Tailwind3";
  let theme = (selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1))
    .replace(/-dark/i, "Dark")
    .replace(/contrast/i, "Contrast")
    .replace(/-highContrast/i, "HighContrast");

  if (args) {
    args.chart.theme = theme;
    return isGradient ? selectedTheme : args.chart.theme;
  }
  if (isGradient && !args) {
    return selectedTheme;
  }
};

export let loadAccumulationChartTheme = (args) => {
  let selectedTheme = window.location.hash.split("/")[1];
  selectedTheme = selectedTheme ? selectedTheme : "Tailwind3";

  if (args) {
    args.accumulation.theme = (
      selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)
    )
      .replace(/-dark/i, "Dark")
      .replace(/light/i, "Light")
      .replace(/contrast/i, "Contrast")
      .replace(/-highContrast/i, "HighContrast");
    return args.chart.theme;
  } else {
    return selectedTheme;
  }
};

export let layoutColor;

export let accPointRender = (args) => {
  let selectedTheme = window.location.hash.split("/")[1];
  selectedTheme = selectedTheme ? selectedTheme : "Tailwind3";
  let layoutColor;

  if (selectedTheme.indexOf("dark") > -1) {
    if (selectedTheme.indexOf("material") > -1) layoutColor = args.border.color = "#303030";
    else if (selectedTheme.indexOf("bootstrap5") > -1) layoutColor = args.border.color = "#212529";
    else if (selectedTheme.indexOf("bootstrap") > -1) layoutColor = args.border.color = "#1A1A1A";
    else if (selectedTheme.indexOf("fabric") > -1) layoutColor = args.border.color = "#201f1f";
    else if (selectedTheme.indexOf("fluent") > -1) layoutColor = args.border.color = "#252423";
    else if (selectedTheme.indexOf("tailwind") > -1) layoutColor = args.border.color = "#1F2937";
    else layoutColor = args.border.color = "#222222";
  } else if (selectedTheme.indexOf("highcontrast") > -1) {
    layoutColor = args.border.color = "#000000";
  } else {
    layoutColor = args.border.color = "#FFFFFF";
  }

  if (
    selectedTheme.indexOf("highcontrast") > -1 ||
    selectedTheme.indexOf("dark") > -1
  ) {
    document.querySelector("#header1").style.color = "#F3F2F1";
    document.querySelector("#header2").style.color = "#F3F2F1";
    document.querySelector("#header3").style.color = "#F3F2F1";
  }

  document.querySelector("#layout_0template").style.background = layoutColor;
  document.querySelector("#layout_0_body").style.background = layoutColor;

  document.querySelector("#layout_1template").style.background = layoutColor;
  document.querySelector("#layout_1_body").style.background = layoutColor;

  document.querySelector("#layout_2template").style.background = layoutColor;
  document.querySelector("#layout_2_body").style.background = layoutColor;
};

export let accpatternPointRender = (args) => {
  if (args.point.index === 0) args.pattern = "DiagonalBackward";
  else if (args.point.index === 1) args.pattern = "DiagonalForward";
  else if (args.point.index === 2) args.pattern = "HorizontalStripe";
  else if (args.point.index === 3) args.pattern = "VerticalStripe";
  else if (args.point.index === 4) args.pattern = "HorizontalDash";

  let selectedTheme = window.location.hash.split("/")[1];
  selectedTheme = selectedTheme ? selectedTheme : "Tailwind3";

  if (selectedTheme.indexOf("dark") > -1) {
    if (selectedTheme.indexOf("material") > -1) args.border.color = "#303030";
    else if (selectedTheme.indexOf("bootstrap5") > -1) args.border.color = "#212529";
    else if (selectedTheme.indexOf("bootstrap") > -1) args.border.color = "#1A1A1A";
    else if (selectedTheme.indexOf("tailwind") > -1) args.border.color = "#1F2937";
    else if (selectedTheme.indexOf("fluent") > -1) args.border.color = "#252423";
    else if (selectedTheme.indexOf("fabric") > -1) args.border.color = "#201f1f";
    else args.border.color = "#222222";
  } else if (selectedTheme.indexOf("highcontrast") > -1) {
    args.border.color = "#000000";
  } else {
    args.border.color = "#FFFFFF";
  }
};

let seriesColor = ["#FFE066", "#FAB666", "#F68F6A", "#F3646A", "#CC555A", "#9C4649"];

export let donutPointRender = (args) => {
  let selectedTheme = window.location.hash.split("/")[1];
  selectedTheme = selectedTheme ? selectedTheme : "Tailwind3";

  if (selectedTheme === "fluent" || selectedTheme === "bootstrap5") {
    args.fill = seriesColor[args.point.index % 10];
  }

  if (selectedTheme.indexOf("dark") > -1) {
    if (selectedTheme.indexOf("material") > -1) args.border.color = "#303030";
    else if (selectedTheme.indexOf("bootstrap5") > -1) args.border.color = "#212529";
    else if (selectedTheme.indexOf("bootstrap") > -1) args.border.color = "#1A1A1A";
    else if (selectedTheme.indexOf("fabric") > -1) args.border.color = "#201f1f";
    else if (selectedTheme.indexOf("fluent") > -1) args.border.color = "#252423";
    else if (selectedTheme.indexOf("tailwind") > -1) args.border.color = "#1F2937";
    else args.border.color = "#222222";
  } else if (selectedTheme.indexOf("highcontrast") > -1) {
    args.border.color = "#000000";
  } else if (selectedTheme.indexOf("fluent2") > -1) {
    args.fill = seriesColor[args.point.index % 10];
  } else {
    args.border.color = "#FFFFFF";
  }
};
