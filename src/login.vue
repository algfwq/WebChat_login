<script setup>
import { ref, onMounted, onUnmounted,reactive } from 'vue'
import { ElNotification } from 'element-plus'
import Cookies from 'js-cookie';

//设置深色模式
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)

//卡片深色自适应
function autoblack(id){
  function adjustblack(id) {
    // 检测浏览器是否开启深色模式
    function isDarkMode() {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    // 设置背景色
    if (isDarkMode()) {
      // 浏览器开启了深色模式
      var divElement1 = document.getElementById(id);
      divElement1.style.backgroundColor = "#000";
    } else {
      // 浏览器未开启深色模式
      var divElement2 = document.getElementById(id);
      divElement2.style.backgroundColor = "#fff";
    }
  }
  window.setInterval(function logname() {adjustblack(id)}, 1);
}
autoblack("main");

//全自动高度自适应
function autoheight(id){
  function adjustheight(id) {
    // 获取指定div元素对象
    var divElement = document.getElementById(id);
    divElement.style.height = (document.documentElement.clientHeight * 0.65).toString() + "px";
  }
  window.setInterval(function logname() {adjustheight(id)}, 1);
}
autoheight("main");
autoheight('load')

//设置骨架屏
const loading = ref(true)

//设置页面标题
let login_title = ref("登录 - WebChat")

//设置默认登录模式
const activeName = ref('first')

//设置输入框
let name = ref('')
let password = ref('')
let email_input = ref('')
let email_code = ref('')

// 获取当前页面的主机名和端口号
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const host = window.location.host;
const url = `${protocol}//${host}/login_ws/`;

//创建websocket连接后端
var socket = new WebSocket(url)
console.log("websocket连接成功！")

//定义断开websocket连接之后的回调函数
socket.onclose = function(evt) {
  console.log("Websocket连接已经关闭！");
};

//登录注册状态设置
let login_or_register = ref("login")
function mode_login() {
  login_or_register.value = 'login'
}
function mode_register() {
  login_or_register.value = 'register'
}

//email默认值
let email = ref('F')

//定义收到服务器消息之后如何处理
socket.onmessage = function(message){
  //输出消息，方便debug
  console.log(message.data)
  //处理服务器消息为JSON
  var data = JSON.parse(message.data);
  //输出模式
  console.log(data.mode)

  //如果为加载状态
  if(data.mode === "load"){
    //关闭骨架屏
    loading.value = false

    //更改网页标题
    const title = ref(data.web_name);
    document.title = '登录 - ' + title.value;
    login_title.value = '登录 - ' + title.value;

    //设置email选项
    email = ref(data.email);
  }
  //如果为验证码发送状态反馈
  else if(data.mode === "code_message"){
      if(data.message === '验证码发送成功！'){
          ElNotification({
            title: '验证码发送成功！',
            message: data.message,
            type: 'success',
            position: 'bottom-right',
          })}
      else{
          ElNotification({
            title: '验证码发送失败！',
            message: data.message,
            type:'error',
            position: 'bottom-right',
          })
      }
  }
  //注册账号回调
  //用户名超长
  else if(data.mode === 'register_name_too_long'){
    ElNotification({
      title: '注册失败！',
      message: data.message,
      type:'error',
      position: 'bottom-right',
    })
  }
  //密码超长
  else if(data.mode === 'register_password_too_long'){
    ElNotification({
      title: '注册失败！',
      message: data.message,
      type:'error',
      position: 'bottom-right',
    })
  }
  //邮箱长度超长
  else if(data.mode === 'register_email_too_long'){
    ElNotification({
      title: '注册失败！',
      message: data.message,
      type:'error',
      position: 'bottom-right',
    })
  }
  //验证码不正确
  else if(data.mode === 'register_email_code_wrong'){
    ElNotification({
      title: '注册失败！',
      message: data.message,
      type:'error',
      position: 'bottom-right',
    })
  }
  //用户名重复
  else if(data.mode === 'register_username_repeat'){
    ElNotification({
      title: '注册失败！',
      message: data.message,
      type:'error',
      position: 'bottom-right',
    })
  }
  //注册失败
  else if(data.mode === 'register_failure'){
    ElNotification({
      title: '注册失败！',
      message: data.message,
      type:'error',
      position: 'bottom-right',
    })
  }
  //注册成功
  else if(data.mode === 'register_success'){
    //操作cookie
    const user = {
      username: name.value,
      password: password.value,
    }
    // 设置cookie
    Cookies.set('user',JSON.stringify(user))
    // 获取cookie
    const value = Cookies.get('user');
    console.log(value)
    //跳转页面
    window.location.href = data.url
  }
  //密码错误
  else if(data.mode ==='login_password_wrong'){
    ElNotification({
      title: '登录失败！',
      message: data.message,
      type:'error',
      position: 'bottom-right',
    })
  }
  //用户不存在
  else if(data.mode ==='login_username_wrong'){
    ElNotification({
      title: '登录失败！',
      message: data.message,
      type:'error',
      position: 'bottom-right',
  })
  }
  //登录成功
  else if(data.mode ==='login_success'){
    //操作cookie
    const user = {
      username: name.value,
      password: password.value,
    }
    // 设置cookie
    Cookies.set('user',JSON.stringify(user))
    // 获取cookie
    const value = Cookies.get('user');
    console.log(value)
    //跳转页面
    window.location.href = data.url;
  }
}

//发送验证码函数
function send_code() {
  socket.send(JSON.stringify({'mode':'send_code','email':email_input.value}))
}

//注册函数
function  register_button() {
  socket.send(JSON.stringify({'mode':'register','name':name.value,'password':password.value,'email':email_input.value,'email_code':email_code.value}))
}

//登录函数
function login_button() {
  socket.send(JSON.stringify({'mode':'login','name':name.value,'password':password.value}))
}
</script>

<template>
  <!-- 内容骨架屏 -->
  <el-skeleton style="width: 100%" direction="vertical" alignment="flex-start" :loading="loading" animated class="content-skeleton">
    <!-- 骨架屏内容 -->
    <template #template>
      <div style="text-align: -webkit-center">
        <el-skeleton-item variant="rect" style="width: 30%;margin-top: 8%" id="load"/>
      </div>
    </template>
    <!-- 正文 -->
    <template #default>
      <div style="text-align: -webkit-center">
        <div class="main" id="main">
          <h1>{{ login_title }}</h1>
          <el-button-group>
            <el-button type="primary" @click="mode_login()">登录</el-button>
            <el-button type="success" @click="mode_register()">注册</el-button>
          </el-button-group><br><br>
          <div style="width:70%">
            <el-col :span='100'>
              <el-input v-if='login_or_register === "login"' v-model="name" style="margin-bottom: 10px;" placeholder="请输入你的用户名" clearable />
              <el-input v-if="login_or_register === 'register'" v-model="name" style="margin-bottom: 10px;" placeholder="请输入你的用户名" clearable />
              <el-input v-model="password" style="margin-bottom: 10px;" placeholder="请输入你的密码" show-password/>

              <el-input v-if="email === 'T' && login_or_register === 'register'" v-model="email_input" style="margin-bottom: 10px;" placeholder="请输入你的邮箱"  clearable/>
              <div style="display: flex; align-items: center;">
                <el-input v-if="email === 'T' && login_or_register === 'register'" v-model="email_code" style="margin-bottom: 10px;" placeholder="请输入邮箱验证码"  clearable/>
                <el-button v-if="email === 'T' && login_or_register === 'register'" style="margin-left: 10px;" @click="send_code()">发送验证码</el-button>
              </div>

              <el-button v-if="login_or_register === 'login'" type="success" @click="login_button()">  登录  </el-button>
              <el-button v-if="login_or_register === 'register'" type="warning" @click="register_button()">  注册  </el-button>
            </el-col>
          </div>
        </div>
      </div>
    </template>
  </el-skeleton>
</template>

<style scoped>
/* 设置内容区域的毛玻璃 */
.main{
  margin-top: 8%;
	width: 30%;

  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: rgba(142, 142, 142, 0.19) 0 6px 15px 0;
  -webkit-box-shadow: rgba(142, 142, 142, 0.19) 0 6px 15px 0;
  border-radius: 12px;
  -webkit-border-radius: 12px;
}
</style>