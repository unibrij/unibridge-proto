export default function handler(req, res){
  const html = `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>UniBridge BKD – Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({ url: '/api/docs/spec', dom_id: '#swagger-ui' });
      };
    </script>
  </body>
  </html>`;
  res.setHeader("content-type","text/html; charset=utf-8");
  res.status(200).send(html);
}
