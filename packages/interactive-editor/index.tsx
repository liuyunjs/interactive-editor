import * as React from 'react';
import {
  StyleSheet,
  TextInput,
  Platform,
  TextInputSelectionChangeEventData,
  TextInputProps,
} from 'react-native';

type SelectionRange = TextInputSelectionChangeEventData['selection'];

export type OnChangeData = {
  displayText: string;
  text: string;
  data: any[][];
};

export type EditorProps = Pick<
  TextInputProps,
  Exclude<keyof TextInputProps, 'value' | 'onChangeText' | 'onChange'>
> & {
  onChange?: (data: OnChangeData) => void;
  format: (data: string[]) => string;
  formatMatchedItem: (matched: string) => string;
  matchFormattedTextReg: RegExp;
  onTrigger?: () => void;
  trigger?: string;
};

export type ListItem = {
  range: [number, number];
  // key: string;
  data: any[];
};

const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

const MATCH_GROUP_REG = /\(([^\)]+?)\)/gim;

const between = (x: number, min: number, max: number) => x >= min && x <= max;

export default class ATEditor extends React.PureComponent<EditorProps> {
  private defaultValue: string = '';
  private value: string = '';
  private eventCount: number = -1;
  private delaySetSelectionHandle: any = null;
  private textInput: React.RefObject<TextInput> = React.createRef();
  private range!: SelectionRange;
  private inputText: string = '';
  private selectionPosition?: number;
  private list: ListItem[] = [];

  constructor(props: EditorProps) {
    super(props);
    this.parseFormattedText();
  }

  componentDidMount() {
    if (this.defaultValue) {
      this.triggerChangeCallback(this.defaultValue);
    }
  }

  componentWillUnmount() {
    this.cancelFrame();
  }

  private cancelFrame() {
    this.delaySetSelectionHandle != null && cancelAnimationFrame(this.delaySetSelectionHandle);
  }

  private sortList() {
    this.list.sort((a, b) => a.range[0] - b.range[0]);
  }

  private parseFormattedText() {
    const { defaultValue, matchFormattedTextReg, formatMatchedItem } = this.props;

    if (!defaultValue) {
      return;
    }

    let indexOffset = 0;
    const match = matchFormattedTextReg.source.match(MATCH_GROUP_REG);
    const groupLength = match ? match.length : 0;

    this.defaultValue = defaultValue.replace(
      matchFormattedTextReg!,
      (match: string, ...args: any[]) => {
        const index = args[groupLength];

        const start = index + indexOffset;
        const showValue: string = groupLength ? args[0] : match;
        // const showValueLength = showValue.length;
        // const usernameLength = username.length;
        const matchLength = match.length;
        const formatMatchedValue = formatMatchedItem(showValue);
        const formatMatchedValueLength = formatMatchedValue.length;
        const end = start + formatMatchedValueLength;

        const data: string[] = [];

        if (groupLength) {
          for (let i = 0; i < groupLength; i++) {
            data.push(args[i]);
          }
        } else {
          data.push(match);
        }
        const range: [number, number] = [start, end];

        this.list.push({
          range,
          // key: range.join('_'),
          data,
        });

        // 获取偏移量
        indexOffset += formatMatchedValueLength - matchLength;

        return formatMatchedItem(showValue);
      },
    );
    this.value = this.defaultValue;
  }

  private formatWithList(inputText: string) {
    const dataArr: any[] = [];
    const len = this.list.length;

    // 不需要做匹配的时候直接提前返回
    if (!len || !inputText) {
      return {
        data: dataArr,
        text: inputText,
      };
    }

    const { format } = this.props;

    let formattedText: string = '';
    // let formattedNodes: any = [];
    let startIndex = 0;
    let prefix: string;

    for (let i = 0; i < len; i++) {
      const { range: selection, data } = this.list[i];
      prefix = inputText.slice(startIndex, selection[0]);
      dataArr.push(data);
      formattedText += prefix;
      formattedText += format!(data);

      // 维护索引
      startIndex = selection[1];
    }

    // 处理末尾数据
    const suffix = inputText.slice(startIndex);
    if (suffix) {
      formattedText += suffix;
    }

    return {
      data: dataArr,
      text: formattedText,
    };
  }

  private triggerChangeCallback(newText: string) {
    const { onChange } = this.props;
    if (onChange) {
      // 格式化输入数据
      const { data, text: formattedText } = this.formatWithList(newText);
      onChange({
        displayText: newText,
        text: formattedText,
        data,
      });
    }
  }

  private updateList(selection: SelectionRange, diff: number) {
    for (let i = 0, len = this.list.length; i < len; i++) {
      const {
        range: [a, b],
      } = this.list[i];

      if (
        between(a, selection.start, selection.end) ||
        between(b, selection.start, selection.end)
      ) {
        const newKey: [number, number] = [a + diff, b + diff];

        this.list[i].range = newKey;
        // this.list[i].key = newKey.join('_');
      }
    }
  }

  private updateValue(newText: string) {
    const nextProps: any = { text: newText };
    const hasSelectionPosition = this.selectionPosition != null;

    if (isAndroid && hasSelectionPosition) {
      nextProps.selection = {
        start: this.selectionPosition,
        end: this.selectionPosition,
      };
    }

    this.textInput.current!.setNativeProps(nextProps);
    this.value = newText;

    if (isIOS && hasSelectionPosition) {
      this.delaySetSelectionHandle = requestAnimationFrame(() => {
        this.textInput.current!.setNativeProps({
          selection: {
            start: this.selectionPosition,
            end: this.selectionPosition,
          },
        });
        delete this.selectionPosition;
      });
    }
  }

  private getLastNativeSelection() {
    const valueLength = this.value.length;
    // @ts-ignore
    const lastSelection = this.textInput.current._lastNativeSelection;
    // console.log(lastSelection);
    return (
      // @ts-ignore
      // lastSelection
      //   ? {
      //       start: lastSelection.start + offset,
      //       end: lastSelection.end + offset,
      //     }
      //   : {
      //       start: valueLength,
      //       end: valueLength,
      //     }
      lastSelection || {
        start: valueLength,
        end: valueLength,
      }
    );
  }

  focus = () => this.textInput.current!.focus();
  blur = () => this.textInput.current!.blur();

  clear = () => {
    this.cancelFrame();
    this.value = '';
    this.list = [];
    this.textInput.current!.setNativeProps({ text: '' });
  };

  trigger = () => {
    this.onTextInput({
      nativeEvent: {
        text: this.props.trigger,
        range: this.getLastNativeSelection(),
      },
    });
  };

  add = (data: string[]) => {
    if (!data.length) {
      return;
    }
    const showValue = data[0];
    const formatMatchedValue = this.props.formatMatchedItem(showValue);
    const formatMatchedValueLength = formatMatchedValue.length;
    const range = this.getLastNativeSelection();
    const text = this.value;

    const newText = `${text.slice(0, range.start - 1)} ${formatMatchedValue} ${text.slice(
      range.end,
    )}`;
    const selectionStart = range.start;
    const selectionEnd = range.start + formatMatchedValueLength;

    // 光标位置
    this.selectionPosition = selectionEnd + 1;
    this.updateValue(newText);

    // 数据发生变化后，在光标后面的@的key应该跟着变化
    this.updateList(
      {
        start: range.end,
        end: newText.length,
      },
      formatMatchedValueLength + 1,
    );

    const newRange: [number, number] = [selectionStart, selectionEnd];

    this.list.push({
      // key: newRange.join('_'),
      range: newRange,
      data,
    });

    this.sortList();

    this.triggerChangeCallback(newText);
  };

  private onChangeText = (text: string) => {
    const { range, value, inputText } = this;

    let newText: string = `${value.slice(0, range.start)}${inputText}${value.slice(range.end)}`;

    this.updateValue(newText);

    // 数据发生变化后，在光标后面的@的key应该跟着变化
    this.updateList(
      {
        start: range.end,
        end: Math.max(value.length, text.length),
      },
      range.start + inputText.length - range.end,
    );

    this.triggerChangeCallback(newText);
    const { onTrigger, trigger } = this.props;

    if (trigger && inputText === trigger) {
      onTrigger && onTrigger();
    }
  };

  private onTextInput = (e: any) => {
    const { text, range, eventCount } = e.nativeEvent;
    // 在选中一段文字然后输入另外文字的时候会触发两次，通过 eventCount 忽略第二次触发
    if (eventCount != null) {
      if (eventCount === this.eventCount) {
        return;
      }
      // 保存本次 eventCount
      this.eventCount = eventCount;
    }
    this.cancelFrame();

    const newRange = { ...range };
    const list = [...this.list];

    // 判断选择区域是否在某一个 缓存 的索引范围之内，如果处于索引中间，使其扩充到索引边界
    for (let i = 0, len = this.list.length; i < len; i++) {
      const { range: selection } = this.list[i];
      const [a, b] = selection;

      // 判断光标区域的开始是否在某一个 缓存 的索引范围之内
      if (between(newRange.start, a, b)) {
        newRange.start = a;
      }
      // 判断光标区域的结束是否在某一个 缓存 的索引范围之内
      if (between(newRange.end, a, b)) {
        newRange.end = b;
      }
      if (
        // 删除选中区域中所有的 缓存
        between(a, newRange.start, newRange.end) ||
        between(b, newRange.start, newRange.end)
      ) {
        list.splice(i, 1);
      }
    }
    // console.log(newRange);
    this.list = list;
    this.range = newRange;
    this.inputText = text;

    const maybeNewRangeStart = newRange.start + text.length;
    // 判断是否需要维护光标位置
    if (range.start !== newRange.start || range.start === 0 || isAndroid) {
      this.selectionPosition = maybeNewRangeStart;
    } else {
      delete this.selectionPosition;
    }

    if (eventCount == null || isAndroid) {
      this.onChangeText(this.value.slice(0, range.start) + text + this.value.slice(range.end));
    }
  };

  render() {
    const {
      style,
      // scrollEnabled,
      onChange,
      format,
      defaultValue,
      matchFormattedTextReg,
      // @ts-ignore
      value,
      // @ts-ignore
      onChangeText,
      // atTextColor,
      ...restProps
    } = this.props;

    return (
      <TextInput
        {...restProps}
        // @ts-ignore
        onTextInput={this.onTextInput}
        ref={this.textInput}
        onChangeText={Platform.select({
          ios: this.onChangeText,
        })}
        defaultValue={this.defaultValue}
        style={[styles.textInput, style]}
      />
    );
  }
}

const styles = StyleSheet.create({
  textInput: {
    textAlignVertical: 'top',
    flex: 1,
    padding: 10,
    fontSize: 16,
    // lineHeight: 20,
  },
});
