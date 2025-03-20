
export interface getHostHtmlArgs {
  code: string;
}

export const getHostHtml = ({ code }) => {
  return (`
<html>
  <head>
  <script type="module">
  // window.onerror = function(message, source, lineno, colno, error) { 
  //   console.log('==IFRAME ERROR==', [message, source, lineno, colno, error]);
  //   return true;
  // };
  </script>
  </head>
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
