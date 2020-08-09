/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import { SafeAreaView, StyleSheet, ScrollView, View, Text, StatusBar } from 'react-native';
import AtEditor from '@liuyunjs/at-editor';
import InteractiveEditor from '@liuyunjs/interactive-editor';
const DEFAULT_MATCH = /\$\{([^\}]+?)\}/gim;
const App = () => {
  const ref = React.useRef<any>();
  const ref2 = React.useRef<InteractiveEditor>(null);
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <View style={{ height: 150 }}>
          <AtEditor
            ref={ref}
            onAt={() => {
              setTimeout(() => {
                ref.current.addAtUser({ username: '刘云', id: '10086' });
              }, 1000);
            }}
            onChange={console.log}
            style={{ borderWidth: 1, textAlignVertical: 'top', flex: 1, borderColor: '#333' }}
          ></AtEditor>
        </View>
        <View style={{ height: 150 }}>
          <InteractiveEditor
            multiline
            ref={ref2}
            matchFormattedTextReg={DEFAULT_MATCH}
            formatMatchedItem={item => '${' + item + '}'}
            format={item => item[0]}
            onChange={console.log}
            defaultValue="第三方环境看到煽风点火基本上 ${电视剧肯定是} "
            style={{ borderWidth: 1, textAlignVertical: 'top', flex: 1, borderColor: '#333' }}
            trigger="$"
            onTrigger={() => {
              console.log('trigger');
              setTimeout(() => {
                ref2.current?.add(['了撒大声地']);
              }, 1000);
            }}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default App;
