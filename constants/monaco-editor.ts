import { editor } from 'monaco-editor'

export const MONACO_EDITOR_CONFIG: editor.IStandaloneEditorConstructionOptions =
  {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    readOnly: false,
    automaticLayout: true,
    suggestOnTriggerCharacters: true,
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true,
    },
    parameterHints: {
      enabled: true,
    },
    wordBasedSuggestions: 'allDocuments',
    suggestSelection: 'first',
    tabCompletion: 'on',
    acceptSuggestionOnEnter: 'on',
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    formatOnPaste: true,
    formatOnType: true,
    folding: true,
    renderWhitespace: 'selection',
    renderLineHighlight: 'all',
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
  }
