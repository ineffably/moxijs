
export interface getHostHtmlArgs {
  code: string;
}

export const getHostHtml = ({ code }) => {
  return (`
<html>
  <body>
    <div id="app"></div>
    <script>
      window.run = (${code || '() => {};'})
    </script>
  </body>
</html>
`
  );
};
