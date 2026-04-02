import { useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { editor } from 'monaco-editor';

interface EditorMarker {
  message: string;
  severity: number;
  startLineNumber: number;
}

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onValidate?: (errors: EditorMarker[]) => void;
  readOnly?: boolean;
  height?: string;
}

export function YamlEditor({
  value,
  onChange,
  onValidate,
  readOnly = false,
  height = '600px'
}: YamlEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: true },
      fontSize: 14,
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      readOnly: readOnly,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      folding: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3
    });

    // Add custom YAML schema validation if needed
    // This would connect to backend validation API
  }, [readOnly]);

  const handleEditorChange = useCallback((newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue);
    }
  }, [onChange]);

  const handleEditorValidation = useCallback((markers: EditorMarker[]) => {
    if (onValidate) {
      onValidate(markers);
    }
  }, [onValidate]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <Editor
        height={height}
        defaultLanguage="yaml"
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        onValidate={handleEditorValidation}
        options={{
          theme: 'vs-dark',
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            Loading editor...
          </div>
        }
      />
    </div>
  );
}
