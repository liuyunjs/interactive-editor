import * as React from 'react';
import { TextInputProps } from 'react-native';
import InteractiveEditor, { OnChangeData } from '@liuyunjs/interactive-editor';

export type ATUser = {
  username: string;
  id: string | number;
};

export type AtEditorRef = {
  addAtUser: (user: ATUser) => void;
  focus: () => void;
  clear: () => void;
  blur: () => void;
  trigger: () => void;
};

export type ATChangeData = {
  displayText: string;
  text: string;
  users: ATUser[];
};

export type ATEditorProps = Pick<
  TextInputProps,
  Exclude<keyof TextInputProps, 'value' | 'onChangeText' | 'onChange'>
> & {
  onChange?: (data: ATChangeData) => void;
  formatAtUser?: (user: ATUser) => string;
  matchFormattedTextReg?: RegExp;
  onAt?: () => void;
};

const DEFAULT_MATCH = /@\[([^\]]+?)\]\(id:([^\]]+?)\)/gim;

const defaultFormatAtUser = (user: ATUser) => `@[${user.username}](id:${user.id})`;

const formatMatchedItem = (value: string) => `@${value}`;
const AtEditor = React.forwardRef(
  (
    {
      onChange: onChangeCallback,
      formatAtUser = defaultFormatAtUser,
      onAt,
      matchFormattedTextReg = DEFAULT_MATCH,
      ...restProps
    }: ATEditorProps,
    ref: React.Ref<AtEditorRef>,
  ) => {
    const editor = React.useRef<InteractiveEditor>(null);

    const format = React.useCallback(
      (data: string[]) => formatAtUser({ username: data[0], id: data[1] }),
      [formatAtUser],
    );

    const onChange = React.useCallback(
      (data: OnChangeData) => {
        onChangeCallback &&
          onChangeCallback({
            displayText: data.displayText,
            text: data.text,
            users: data.data.map(item => ({ username: item[0], id: item[1] })),
          });
      },
      [onChangeCallback],
    );

    React.useImperativeHandle(
      ref,
      function () {
        return {
          focus: editor.current!.focus,
          blur: editor.current!.blur,
          clear: editor.current!.clear,
          trigger: editor.current!.trigger,
          addAtUser(user: ATUser) {
            editor.current!.add([user.username, user.id + '']);
          },
        };
      },
      [],
    );

    return (
      <InteractiveEditor
        {...restProps}
        multiline
        ref={editor}
        onChange={onChange}
        matchFormattedTextReg={matchFormattedTextReg}
        formatMatchedItem={formatMatchedItem}
        format={format}
        trigger="@"
        onTrigger={onAt}
      />
    );
  },
);

export default React.memo(AtEditor);
