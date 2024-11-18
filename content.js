// Regular expression to find patterns like "XX-YYYY" or "XX-YYYYY"
const formatPattern = /\b(\d{2})-(\d{4,5})\b/g;

// Words to ignore if the pattern precedes them (case-insensitive)
const ignoredWords = /(?:invoice|inv|payment link|payment link sent)/i;

// Function to check if the node's text precedes ignored words
function isPrecedingIgnoredWord(node, matchIndex, matchLength) {
  const textBefore = node.textContent.slice(0, matchIndex).trimEnd(); // Get text before the match
  const precedingWords = textBefore.split(/\s*[:#\s]+\s*/).pop(); // Extract the last word before spaces, colons, or #
  return ignoredWords.test(precedingWords || "");
}

// Function to determine the suffix for to go from Joblog 3 to New Joblog
function getSuffix(part2Length) {
  return part2Length === 4 ? "SP" : "DG";
}

// Function to determine the prefix to go from New Joblog to Joblog 3
function getPrefix(part2Length) {
  return part2Length === 5
    ? "QuasiJobs/Detail/QuasiJobDetail.aspx?qryjobid="
    : "SpecialJobs/Detail/SpecialJobDetail.aspx?qryjobid=";
}

// Function to create links based on the current domain
function linkifyText(node, domainType) {
  if (node.nodeType === Node.TEXT_NODE) {
    const matches = [...node.textContent.matchAll(formatPattern)];
    if (matches.length > 0) {
      const span = document.createElement("span");
      let lastIndex = 0;

      matches.forEach(match => {
        const [matchedText, part1, part2] = match;
        const matchIndex = match.index;
        const matchLength = matchedText.length;

        // Check if the match is preceded by ignored words
        if (isPrecedingIgnoredWord(node, matchIndex, matchLength)) {
          return;
        }

        // Append text before the match
        span.appendChild(document.createTextNode(node.textContent.slice(lastIndex, matchIndex)));

        // Create a clickable link
        const link = document.createElement("a");
        if (domainType === "prefix") {
          // For New Joblog to Joblog 3
          const prefix = getPrefix(part2.length);
          link.href = `pe-web3/${prefix}${part1}-${part2}`;
        } else if (domainType === "suffix") {
          // For Joblog 3 to New Joblog
          const suffix = getSuffix(part2.length);
          link.href = `https://jobs.pooleng.com/jobs/jobs-all/view-job/${part1}-${part2}-${suffix}`;
        }
        link.target = "_blank";
        link.textContent = matchedText;

        span.appendChild(link);
        lastIndex = matchIndex + matchLength;
      });

      // Append remaining text
      span.appendChild(document.createTextNode(node.textContent.slice(lastIndex)));
      node.parentNode.replaceChild(span, node);
    }
  }
}

// Recursively scan and process text nodes
function scanAndLinkify(node, domainType) {
  if (node.nodeType === Node.TEXT_NODE) {
    linkifyText(node, domainType);
  } else {
    for (const child of node.childNodes) {
      scanAndLinkify(child, domainType);
    }
  }
}
// Determine the current URL and apply the appropriate behavior
const currentURL = window.location.href;
if (currentURL.startsWith("https://jobs.pooleng.com/")) {
  // Apply prefix logic for https://jobs.pooleng.com/*
  scanAndLinkify(document.body, "prefix");
} else if (currentURL.startsWith("http://pe-web3/")) {
  // Apply suffix logic for http://pe-web3/*
  scanAndLinkify(document.body, "suffix");
}
console.log("Current URL:", currentURL);
