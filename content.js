// Regular expression to find patterns like "11-2222" or "11-22222"
const formatPattern = /\b(\d{2})-(\d{4,5})\b/g;

// Words to ignore if the pattern precedes them (case-insensitive)
const ignoredWords = /(?:invoice|inv|payment link|payment link sent)/i;

// Function to check if the node's text precedes ignored words
function isPrecedingIgnoredWord(node, matchIndex, matchLength) {
  const textBefore = node.textContent.slice(0, matchIndex).trimEnd(); // Get text before the match
  const precedingWords = textBefore.split(/\s*[:#\s]+\s*/).pop(); // Extract the last word before any spaces/colons
  return ignoredWords.test(precedingWords || "");
}

// Function to convert matched patterns into clickable links
function linkifyText(node) {
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
        link.href = `https://jobs.pooleng.com/jobs/jobs-all/view-job/${part1}-${part2}-${part2.length === 4 ? "SP" : "DG"}`;
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
function scanAndLinkify(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    linkifyText(node);
  } else {
    for (const child of node.childNodes) {
      scanAndLinkify(child);
    }
  }
}

// Run the linkify function on the document body
scanAndLinkify(document.body);
