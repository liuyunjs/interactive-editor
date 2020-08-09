# at-editor

一个带有@功能的 react-native 输入框

## 安装

```
    npm install @liuyunjs/at-editor --save

    or

    yarn add @liuyunjs/at-editor
```

## 示例

```javascript
import * as React from 'react';
import { View, Text } from 'react-native';
import ATEditor from '@liuyunjs/at-editor';

export default () => {
  const editor = React.useRef();

  return (
    <View style={{ flex: 1 }}>
      <Text onPress={() => editor.current.trigger()}>trigger</Text>
      <Text onPress={() => editor.current.addAtUser({ username: 'liuyunjs', id: '10086' })}>
        addUser
      </Text>
      <View style={{ height: 200 }}>
        <ATEditor
          defaultValue="hello @[liuyunjs](id: 10087), This is an @input box"
          onAt={console.log}
          onChange={console.log}
          ref={editor}
        />
      </View>
    </View>
  );
};
```

## props

| 名称                  | 类型                                                   | 默认值                                                 | 是否必传 | 描述                                                                                 |
| :-------------------- | :----------------------------------------------------- | :----------------------------------------------------- | :------- | :----------------------------------------------------------------------------------- |
| defaultValue          | string                                                 | void                                                   | 否       | 输入框默认值                                                                         |
| onAt                  | () => void                                             | void                                                   | 否       | 检测到输入@时触发的回调                                                              |
| onChange              | ({displayText: string, text: string, users: ATUser[]}) | void                                                   | 否       | 输入框文本变化时触发的回调，如果传入了 defaultValue，会在渲染之后立即触发一次        |
| matchFormattedTextReg | RegExp                                                 | /@\[([^\]]+?)\]\(id:([^\]]+?)\)/gim                    | 否       | 从一串格式化过的字符串中匹配@信息的正则表达式                                        |
| formatAtUser          | (user: ATUser) =>string                                | (user: ATUser) => `@[${user.username}](id:${user.id})` | 否       | 将@信息格式化成固定格式的函数，可以和 matchFormattedTextReg 一起使用实现自定义的格式 |

> 其余参考 TextInput
