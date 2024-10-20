import React from "react";
export default function processCombinedText(text) {
    let result = [];
    let i = 0;

    while (i < text.length) {
        const current = text[i];
        const next = text[i + 1];
        const nextNext = text[i + 2];
        const nextNextNext = text[i + 3];
        const nextNextNextNext = text[i + 4];

        // Check for %20 (space)
        if (current === '%' && next === '2' && nextNext === '0') {
            result.push(' '); // Handle %20 -> space
            i += 3;
        }
        // Check for %2C (comma)
        else if (current === '%' && next === '2' && nextNext === 'C') {
            result.push(','); // Handle %2C -> comma
            i += 3;
        }
        // Check for %22 (double quote)
        else if (current === '%' && next === '2' && nextNext === '2') {
            result.push('"'); // Handle %22 -> double quote
            i += 3;
        }
        else if (current === '%' && next === '4' && nextNext === '0') {
          result.push('@'); // Handle %40 -> at symbol
          i += 3;
      }
      // Check for %2B (plus sign)
      else if (current === '%' && next === '2' && nextNext === 'B') {
          result.push('+'); // Handle %2B -> plus sign
          i += 3;
      }
      // Check for %2F (slash)
      else if (current === '%' && next === '2' && nextNext === 'F') {
          result.push('/'); // Handle %2F -> slash
          i += 3;
      }
        // Check for %C2 (non-breaking space or other)
        else if (current === '%' && next === 'C' && nextNext === '2') {
            // Handle %C2 with next character
            if (text[i + 3] === 'A') {
                result.push(' '); // %C2%A0 -> non-breaking space
                i += 4;
            } else {
                result.push(" "); // Handle any other %C2 cases
                i += 3;
            }
        }
        // Check for %E2%80%93 (en dash)
        else if (current === '%' && next === 'E' && nextNext === '2' && nextNextNext === '8' && nextNextNextNext === '0' && text[i + 5] === '3') {
            result.push('–'); // %E2%80%93 -> en dash
            i += 7;
        }
        // Check for %09 (tab)
        else if (current === '%' && next === '0' && nextNext === '9') {
            result.push('    '); // Handle %09 -> tab
            i += 3;
        }
        // Check for %0D (carriage return)
        else if (current === '%' && next === '0' && nextNext === 'D') {
            result.push(<br key={`br-${result.length}`} />); // Handle %0D -> carriage return
            i += 3;
        }
        // Check for %3A (colon)
        else if (current === '%' && next === '3' && nextNext === 'A') {
            result.push(':'); // Handle %3A -> colon
            i += 3;
        }
        // Check for %A0 (non-breaking space)
        else if (current === '%' && next === 'A' && nextNext === '0') {
            result.push(' '); // Handle %A0 -> non-breaking space
            i += 3;
        }
        else if(current === '%' && next !== ' ' && nextNext !== ' ' )
        {
          result.push(' '); // Handle %A0 -> non-breaking space
          i += 3;
        }
        // Handle any other cases
        else {
            result.push(current);
            i++;
        }
    }

    return result.map((item, index) =>
        typeof item === 'string' ? item : <React.Fragment key={index}>{item}</React.Fragment>
    );
};