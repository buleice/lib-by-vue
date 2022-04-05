import TestModule from './src/main.vue';

TestModule.install = (vue) => {
  vue.component(TestModule.name, TestModule);
};

export default TestModule;
