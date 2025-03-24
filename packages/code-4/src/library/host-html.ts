
export interface getHostHtmlArgs {
  code: string;
}

export const getHostHtml = ({ code }) => {
  return (`
<html>
  <head>
    <style>
      body {
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
    </style>
  <body>
    <div id="app"></div>
    <script>
      window.moxiedit = true;
      window.run = (${code || '() => {};'});
    </script>
  </body>
</html>
`
  );
};
