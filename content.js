// Regular expression to find patterns like "11-2222" or "11-22222"
const formatPattern = /\b(\d{2})-(\d{4,5})\b/g;

// Function to convert matched patterns into clickable links
function linkifyText(node) {
  // Only process text nodes to prevent altering other HTML elements
  if (node.nodeType === Node.TEXT_NODE) {
    const matches = node.textContent.match(formatPattern);
    if (matches) {
      const span = document.createElement("span");
      let lastIndex = 0;
      
      node.textContent.replace(formatPattern, (match, part1, part2, offset) => {
        // Append the text before the match as plain text
        span.appendChild(document.createTextNode(node.textContent.slice(lastIndex, offset)));

        // Create a clickable link element
        const link = document.createElement("a");
        link.href = `https://jobs.pooleng.com/jobs/jobs-all/view-job/${part1}-${part2}-${part2.length === 4 ? "SP" : "DG"}`;
        link.target = "_blank";
        link.textContent = match;

        // Append the link to the span
        span.appendChild(link);
        
        lastIndex = offset + match.length;
      });
      
      // Append any remaining text after the last match
      span.appendChild(document.createTextNode(node.textContent.slice(lastIndex)));
      
      // Replace the original text node with the new span
      node.parentNode.replaceChild(span, node);
    }
  }
}

// Recursively scan through all text nodes in the body of the document
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
