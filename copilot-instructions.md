# Copilot Instructions

## MCP Servers

### Stitch Server
Configure the Stitch MCP server for API integration:

```json
{
  "servers": {
    "stitch": {
      "type": "http",
      "url": "https://stitch.googleapis.com/mcp",
      "headers": {
        "X-Goog-Api-Key": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```
