import {
  Layout,
  Tooltip,
  Collapse,
  Row,
  Col,
  Table,
  Input,
  List,
  Card,
  Image,
  Divider,
  Form,
  Tabs,
  InputNumber,
} from "antd";
import { createFromIconfontCN } from "@ant-design/icons";
import React, { useEffect, useMemo, useState, ReactNode } from "react";
import ReactDOM from "react-dom";
import "./App.css";
import { v4 as uuidv4 } from "uuid";
import * as _ from "lodash";

const IconFont = createFromIconfontCN({
  scriptUrl: "//at.alicdn.com/t/font_2695388_j089n36tpnk.js",
});

const { TabPane } = Tabs;
const { Header, Footer, Sider, Content } = Layout;
const { Panel } = Collapse;
const domRefMap = {};

const componentsList = [
  {
    label: "基础组件",
    components: [
      {
        label: "表格",
        canInsert: true,
        data: {
          dataSource: [],
          columns: [
            {
              title: "列1",
              dataIndex: "name",
              key: "name",
            },
            {
              title: "列2",
              dataIndex: "age",
              key: "age",
            },
          ],
        },
        fontType: "icon-shuxingbiao",
        value: "Table",
        render: (data) => {
          return <Table {...data} />;
        },
      },
      {
        label: "列表",
        canInsert: true,
        data: {
          header: <div>头部标题</div>,
          footer: <div>脚部文字</div>,
          dataSource: [`列1`, "列2"],
          style: {
            backgroundColor: "#fff",
          },
        },
        fontType: "icon-gongjutiao",
        value: "List",
        render: (data) => {
          return (
            <List
              {...data}
              bordered
              renderItem={(item, index) => (
                <List.Item key={index}>{item}</List.Item>
              )}
            />
          );
        },
      },
      {
        label: "卡片",
        canInsert: true,
        data: {
          title: "卡片标题",
          style: { width: "100%" },
          extra: <a href="#">More</a>,
        },
        fontType: "icon-biaoqianmoshi",
        value: "Card",
        render: (data) => {
          return <Card {...data}>插入卡片内容</Card>;
        },
      },
      {
        label: "图片",
        canInsert: false,
        data: {
          width: 200,
          src: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
        },
        fontType: "icon-tupian",
        value: "Image",
        render: (data) => {
          return <Image {...data} />;
        },
      },
      {
        label: "输入框",
        canInsert: false,
        data: {
          defaultValue: `输入框`,
          disabled: true,
          style: {
            width: null,
          },
        },
        fontType: "icon-wenbenmoban",
        value: "Input",
        render: (data) => {
          const ref = React.createRef();
          domRefMap[data.id] = ref;
          return <Input {...data} ref={ref}></Input>;
        },
        formRenderData: (form) => {
          return (
            <Tabs defaultActiveKey="1">
              <TabPane tab="基础" key="1">
                <Form form={form}>
                  <Form.Item label="默认值" name="defaultValue">
                    <Input />
                  </Form.Item>
                </Form>
              </TabPane>
              <TabPane tab="样式" key="2">
                <Form form={form}>
                  <Form.Item label="宽度" name="width">
                    <InputNumber />
                  </Form.Item>
                </Form>
              </TabPane>
            </Tabs>
          );
        },
        formDataToData: (formData) => {
          return {
            defaultValue: formData.defaultValue,
            style: {
              width: formData.width,
            },
          };
        },
        dataToFormData: (data) => {
          return {
            defaultValue: data.defaultValue,
            width: data.style.width,
          };
        },
      },
    ],
  },
  {
    label: "布局",
    components: [
      {
        label: "布局",
        fontType: "icon-buju",
        canInsert: true,
        data: {},
        value: "Layout",
        render: (data) => {
          return (
            <Layout {...data}>
              <Sider theme="light">侧边导航栏</Sider>
              <Layout>
                <Header>头部</Header>
                <Content>内容</Content>
                <Footer>页脚</Footer>
              </Layout>
            </Layout>
          );
        },
      },
      {
        label: "删格",
        fontType: "icon-shezhigewangshuju",
        canInsert: true,
        data: {
          spanSpace: 2,
        },
        value: "Grid",
        render: (data) => {
          const colDom = [];
          const spanNum = 24 / data.spanSpace;
          for (let i = 0; i < data.spanSpace; i++) {
            colDom.push(
              <Col span={spanNum} key={i}>
                点击插入元素
              </Col>
            );
          }
          return <Row {...data}>{colDom}</Row>;
        },
      },
      {
        label: "分割线",
        fontType: "icon-xianfengge",
        canInsert: false,
        data: {},
        value: "Divider",
        render: (data) => {
          return <Divider {...data} />;
        },
      },
    ],
  },
];
let selectDomId = null;
let selectAddDom = {
  id: null,
  isAdd: false,
};
let focusDOM = `ownContent`;

const getFocus = (e) => {
  if (
    window.getSelection().anchorNode &&
    window.getSelection().anchorNode.parentNode
  ) {
    const id = window.getSelection().anchorNode.parentNode.id;
    focusDOM = id;
  } else {
    focusDOM = "ownContent";
  }
};
const domList = [];
function App() {
  const [state, setState] = useState({
    domTree: [],
    selectDomData: null,
  });

  const { domTree, selectDomData } = state;
  const [form] = Form.useForm();
  const getIconFont = (dataTemp, render) => {
    const iconFont = document.createElement("div");
    iconFont.setAttribute("id", `icon_${dataTemp.id}`);
    iconFont.setAttribute("class", `icon_ref`);
    ReactDOM.render(
      <>
        <IconFont
          type="icon-qingchu"
          title="删除"
          className="icon_span"
          onClick={() => {
            deleteDom(dataTemp.id);
          }}
        ></IconFont>
        <IconFont
          type="icon-fuzhi"
          title="复制"
          className="icon_span"
          onClick={() => {
            copyDom(dataTemp);
          }}
        ></IconFont>
        <IconFont
          type="icon-zengjiatuceng"
          title="添加"
          className="icon_span"
          onClick={() => {
            addDom(dataTemp.id);
          }}
        ></IconFont>
        <IconFont
          type="icon-xuanze"
          title="选中"
          className="icon_span"
          onClick={() => {
            selectDom(dataTemp);
          }}
        ></IconFont>
      </>,
      iconFont
    );
    return iconFont;
  };
  const getSpanDom = (dataTemp) => {
    const spanDom = document.createElement("div");
    spanDom.setAttribute("id", `div_${dataTemp.id}`);
    spanDom.setAttribute("class", `dom_ref`);
    dataTemp.data.id = `ref_${dataTemp.id}`;
    ReactDOM.render(dataTemp.render(dataTemp.data), spanDom);

    return spanDom;
  };
  const setIdForDom = (root) => {
    root.childNodes.forEach((item) => {
      if (item.nodeType !== 3 && item.nodeName !== "SCRIPT") {
        if (!item.id) {
          item.setAttribute("id", uuidv4());
        }
        setIdForDom(item);
      }
    });
  };
  const componentsCheck = (e) => {
    if (selectAddDom.isAdd) {
      const selectDom = document.getElementById(`div_${selectAddDom.id}`);
      const parentNode = selectDom.parentNode;
      const domId = domList.length + 1;
      const dataTempNow = {
        ...e,
        id: domId,
      };
      domList.push({ ...dataTempNow, parentId: parentNode.id });
      const spanDom = getSpanDom(dataTempNow);
      const iconFont = getIconFont(dataTempNow);
      spanDom.appendChild(iconFont);
      if (parentNode.lastChild === selectDom) {
        parentNode.appendChild(spanDom);
      } else {
        parentNode.insertBefore(spanDom, selectDom.nextSibling);
      }
      setIdForDom(spanDom);
    } else {
      const parentDom = document.getElementById(focusDOM);
      if (!parentDom) return;
      const domId = domList.length + 1;
      const dataTemp = {
        ...e,
        id: domId,
      };
      domList.push({ ...dataTemp, parentId: focusDOM });

      const spanDom = getSpanDom(dataTemp);
      const iconFont = getIconFont(dataTemp);

      parentDom.appendChild(spanDom);
      spanDom.appendChild(iconFont);

      setIdForDom(parentDom);
    }
  };

  const deleteDom = (id) => {
    if (selectAddDom.id === id) {
      selectAddDom.id = null;
      selectAddDom.isAdd = false;
    }
    document.getElementById(`div_${id}`).remove();
    // _.remove(domList, function (n) {
    //   return n.id === id;
    // });
  };

  const copyDom = (dataTemp) => {
    const parentId = dataTemp.id;
    const selectDom = document.getElementById(`div_${parentId}`);
    const parentNode = selectDom.parentNode;
    const domId = domList.length + 1;
    const dataTempNow = { ...dataTemp, id: domId };
    domList.push({ ...dataTempNow, parentId: parentNode.id });
    const spanDom = getSpanDom(dataTempNow);
    const iconFont = getIconFont(dataTempNow);
    spanDom.appendChild(iconFont);
    if (parentNode.lastChild === selectDom) {
      parentNode.appendChild(spanDom);
    } else {
      parentNode.insertBefore(spanDom, selectDom.nextSibling);
    }
    setIdForDom(spanDom);
  };

  const addDom = (id) => {
    if (id === selectAddDom.id) {
      const preSelectRefDom = document.getElementById(`div_${selectAddDom.id}`);
      if (preSelectRefDom) preSelectRefDom.style.border = null;
      selectAddDom.isAdd = false;
      selectAddDom.id = null;
      return;
    }
    if (selectAddDom.id) {
      const preSelectRefDom = document.getElementById(`div_${selectAddDom.id}`);
      if (preSelectRefDom) preSelectRefDom.style.border = null;
    }
    const selectDom = document.getElementById(`div_${id}`);
    selectDom.style.border = "5px solid grey";
    selectAddDom.id = id;
    selectAddDom.isAdd = true;
  };

  const selectDom = (dataTemp) => {
    if (selectDomId) {
      const preSelectRefDom = document.getElementById(selectDomId);
      if (preSelectRefDom) preSelectRefDom.style.border = null;
    }
    const selectDom = document.getElementById(`div_${dataTemp.id}`);
    selectDom.style.border = "5px solid rgba(45,140,240,.15)";
    selectDomId = `div_${dataTemp.id}`;
    const data = dataTemp.dataToFormData(dataTemp.data);
    form.setFieldsValue(data);
    setState({
      selectDomData: {
        formDataToData: dataTemp.formDataToData,
        formRenderData: dataTemp.formRenderData,
      },
    });
  };

  const refresh = () => {
    const data = selectDomData.formDataToData(form.getFieldsValue());
    const m = selectDomId.split("_");
    const ref = domRefMap[`ref_${m[1]}`];
    ref.current.props = { ...ref.current.props, ...data };
    ref.current.forceUpdate((...args)=>{
      console.log(args)
      console.log(ref.current.props);
    })
    // ref.current.setState({
    //   value: data.defaultValue,
    //   ...data,
    // })
    console.log(ref.current);
    // ref.current.updater.enqueueForceUpdate(ref.current._reactInternalInstance, (...args)=>{console.log(args)});
    // const dom = document.getElementById(selectDomId);
    // ReactDOM.findDOMNode(dom.childNodes[0]).setAttribute("style", data.style);
    // if (id === selectAddDom.id) {
    //   const preSelectRefDom = document.getElementById(`div_${selectAddDom.id}`);
    //   if (preSelectRefDom) preSelectRefDom.style.border = null;
    //   selectAddDom.isAdd = false;
    //   selectAddDom.id = null;
    //   return;
    // }
    // if (selectAddDom.id) {
    //   const preSelectRefDom = document.getElementById(`div_${selectAddDom.id}`);
    //   if (preSelectRefDom) preSelectRefDom.style.border = null;
    // }
    // const selectDom = document.getElementById(`div_${id}`);
    // selectDom.style.border = "5px solid grey";
    // selectAddDom.id = id;
    // selectAddDom.isAdd = true;

    // //删除
    // if (`div_${selectAddDom.id}` === selectDomId) {
    //   selectAddDom.id = null;
    //   selectAddDom.isAdd = false;
    // };
    // document.getElementById(`div_${id}`).remove();
  };

  return (
    <div>
      <div className="own_header">
        <span title="保存" className="own_header_button">
          <IconFont type="icon-baocun" style={{ fontSize: 20 }} />
        </span>

        <span title="撤销" className="own_header_button">
          <IconFont type="icon-chexiao" style={{ fontSize: 20 }} />
        </span>
      </div>
      <div>
        <Layout>
          <Sider>
            <div className="own_content_left">
              <Collapse defaultActiveKey={[0]}>
                {componentsList.map((item, idx) => (
                  <Panel header={item.label} key={idx}>
                    <Row>
                      {item.components.map((com, idxCom) => (
                        <Col
                          span={8}
                          onClick={() => {
                            componentsCheck(com);
                          }}
                          key={idxCom}
                        >
                          <div className="own_left_button">
                            <div>
                              <IconFont
                                type={com.fontType}
                                style={{ fontSize: 20 }}
                              />
                            </div>
                            <div style={{ fontSize: 10 }}>{com.label}</div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Panel>
                ))}
              </Collapse>
            </div>
          </Sider>
          <Content>
            <div
              id="ownContent"
              className="own_content"
              contentEditable="true"
              suppressContentEditableWarning
              onClick={getFocus}
            ></div>
          </Content>
          <Sider width="300px">
            <div className="own_content_right">
              <IconFont
                type="icon-xuanze"
                title="刷新"
                className="icon_span"
                onClick={refresh}
              ></IconFont>
              {selectDomData && selectDomData.formRenderData(form)}
            </div>
          </Sider>
        </Layout>
      </div>
    </div>
  );
}

export default App;
