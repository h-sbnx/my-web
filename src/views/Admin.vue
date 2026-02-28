<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  ElMessage, ElMessageBox, ElTable, ElTableColumn,
  ElPagination, ElDialog, ElForm, ElFormItem,
  ElInput, ElSelect, ElOption, ElButton, ElDatePicker,
  ElUpload, ElTag, ElSwitch, ElTooltip,
  ElLoading, ElCard, ElDescriptions, ElDescriptionsItem
} from 'element-plus'
import request from '@/utils/request'
import { useRouter } from 'vue-router'
import { isTokenExpired } from '@/utils/jwtUtil'

const router = useRouter()

const logout = async () => {
  try {
    await ElMessageBox.confirm(
        '确定要退出登录吗？',
        '退出确认',
        { type: 'warning', appendToBody: true }
    )
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    delete request.defaults.headers.common['Authorization']
    await router.replace('/login')
    location.reload()
  } catch (err) {
    console.log('用户取消退出', err)
  }
}

const checkAuth = async () => {
  try {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      ElMessage.warning('请先登录管理员账号')
      await router.replace('/login')
      return false
    }
    if (isTokenExpired(token)) {
      ElMessage.warning('登录已过期，请重新登录')
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      await router.replace('/login')
      return false
    }
    return true
  } catch (err) {
    console.error('鉴权校验失败：', err)
    ElMessage.error('登录状态校验异常，请重新登录')
    localStorage.clear()
    await router.replace('/login')
    return false
  }
}

// ========== 基础配置 ==========
const baseApiUrl = ''
const loading = ref(false)
const exportLoading = ref(false)
const backendBaseUrl = 'http://localhost:8080'

// ========== 标签页切换 ==========
const activeTab = ref('teamManage')

// ========== 1. 报名信息管理模块 ==========
const teamQueryForm = reactive({ workId: '' })
const teamList = ref([])
const currentTeam = ref(null)
const teamDetailDialog = ref(false)

const queryTeamList = async () => {
  if (!teamQueryForm.workId) {
    await loadAllTeamList()
    return
  }

  loading.value = true
  try {
    const res = await request.get(`${baseApiUrl}/team/queryByWorkId`, {
      params: { workId: teamQueryForm.workId }
    })
    if (res.code === 200) {
      teamList.value = res.data ? [res.data] : []
      ElMessage.success('查询成功')
    } else {
      ElMessage.error(`查询失败：${res.message || '接口返回异常'}`)
      teamList.value = []
    }
  } catch (error) {
    const errMsg = error.response?.data?.message || '网络异常/接口未实现'
    ElMessage.error(`查询失败：${errMsg}`)
    teamList.value = []
  } finally {
    loading.value = false
  }
}

const loadAllTeamList = async () => {
  loading.value = true
  try {
    const res = await request.get(`${baseApiUrl}/team/queryAll`)
    if (res.code === 200) {
      teamList.value = res.data || []
      ElMessage.success(`共查询到 ${teamList.value.length} 支报名队伍`)
    } else {
      ElMessage.error(`查询失败：${res.message || '接口返回异常'}`)
      teamList.value = []
    }
  } catch (error) {
    const errMsg = error.response?.data?.message || '网络异常/接口未实现'
    ElMessage.error(`查询失败：${errMsg}`)
    teamList.value = []
  } finally {
    loading.value = false
  }
}

const viewTeamDetail = (row) => {
  currentTeam.value = row
  teamDetailDialog.value = true
}

// ========== 导出已通过审核作品Excel ==========
const exportPassedWorks = async () => {
  exportLoading.value = true;
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      ElMessage.warning('请先登录管理员账号');
      router.push('/login');
      exportLoading.value = false;
      return;
    }
    const timestamp = new Date().getTime();
    const fullApiUrl = `${backendBaseUrl}/api/file/exportPassedWorks?nocache=${timestamp}`;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', fullApiUrl, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';

    xhr.onload = function () {
      exportLoading.value = false;
      if (xhr.status === 200) {
        const contentDisposition = xhr.getResponseHeader('content-disposition');
        let fileName = '已通过审核作品列表.xlsx';
        if (contentDisposition) {
          const match = contentDisposition.match(/filename\*=UTF-8''(.*)/);
          if (match && match[1]) fileName = decodeURIComponent(match[1]);
        }
        const blob = new Blob([xhr.response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        ElMessage.success('导出成功，文件已自动下载');
      } else if (xhr.status === 304) {
        ElMessage.warning('文件缓存未更新，正在重新请求...');
        window.location.reload();
      } else {
        const reader = new FileReader();
        reader.onload = function () {
          try {
            const err = JSON.parse(reader.result);
            ElMessage.error(`导出失败：${err.message}`);
          } catch (e) {
            ElMessage.error(`导出失败：服务器返回${xhr.status}错误`);
          }
        };
        reader.readAsText(xhr.response);
      }
    };

    xhr.onerror = function () {
      exportLoading.value = false;
      ElMessage.error('导出请求失败：未连接到后端服务器，请检查后端是否运行在8080端口');
      console.error('请求异常：后端地址可能错误或服务未启动');
    };
    xhr.send();
  } catch (error) {
    exportLoading.value = false;
    ElMessage.error(`导出失败：${error.message}`);
    console.error('导出逻辑异常：', error);
  }
};

// ========== 2. 公示发布模块 ==========
const publicQueryForm = reactive({
  publicType: '',
  year: ''
})
const publicInfoList = ref([])
const publicYearList = ref([])
const publicForm = reactive({
  id: null,
  title: '',
  publicTime: '',
  publicType: '',
  files: []
})
const publicUploadFileList = ref([])
const publicDialog = ref(false)
const isEditPublic = ref(false)

const publicUploadConfig = reactive({
  action: `${backendBaseUrl}/api/public/upload`,
  headers: () => ({
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  }),
  onSuccess: (response, file, fileList) => {
    if (response.code === 200) {
      publicUploadFileList.value = fileList.filter(item => item.status === 'success')
      publicForm.files = publicUploadFileList.value.map(item => ({
        fileUrl: item?.raw?.uploadResponse?.data?.fileUrl || item?.response?.data?.fileUrl || '',
        fileName: item?.raw?.uploadResponse?.data?.fileName || item?.response?.data?.fileName || item.name
      }))
      file.raw.uploadResponse = response
      ElMessage.success(`已上传 ${publicForm.files.length}/5 个文件`)
    } else {
      ElMessage.error(`文件上传失败：${response.message || '接口返回异常'}`)
    }
  },
  onError: (error) => {
    ElMessage.error('公示文件上传失败')
  },
  beforeUpload: (file) => {
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')
    if (!isPdf) {
      ElMessage.error('仅支持PDF格式文件上传！')
      return false
    }
    if (publicUploadFileList.value.length >= 5) {
      ElMessage.warning('最多只能上传5个PDF文件！')
      return false
    }
    return true
  },
  onRemove: (uploadFile, fileList) => {
    publicUploadFileList.value = fileList
    publicForm.files = publicUploadFileList.value.map(item => ({
      fileUrl: item?.raw?.uploadResponse?.data?.fileUrl || item?.response?.data?.fileUrl || '',
      fileName: item?.raw?.uploadResponse?.data?.fileName || item?.response?.data?.fileName || item.name
    }))
    ElMessage.info(`已移除文件：${uploadFile.name}`)
  }
})

const loadPublicYearList = async () => {
  try {
    const res = await request.get(`${baseApiUrl}/public/queryAllYears`)
    if (res.code === 200) {
      publicYearList.value = res.data || []
    } else {
      ElMessage.error(`加载公示年份失败：${res.message || '接口返回异常'}`)
      publicYearList.value = []
    }
  } catch (error) {
    ElMessage.error('加载公示年份列表失败')
    publicYearList.value = []
  }
}

const loadPublicInfoList = async () => {
  loading.value = true
  try {
    let res
    if (publicQueryForm.year) {
      res = await request.get(`${baseApiUrl}/public/queryByYear`, {
        params: { year: publicQueryForm.year }
      })
    } else if (publicQueryForm.publicType) {
      res = await request.get(`${baseApiUrl}/public/queryByType`, {
        params: { publicType: publicQueryForm.publicType }
      })
    } else {
      res = await request.get(`${baseApiUrl}/public/queryAll`)
    }
    if (res.code === 200) {
      publicInfoList.value = (res.data || []).map(item => ({
        ...item,
        files: item.files || (item.fileUrl ? [{ fileUrl: item.fileUrl, fileName: item.fileName }] : [])
      }))
      if (publicInfoList.value.length === 0) {
        ElMessage.info('暂无公示数据，可点击「新增公示」添加')
      }
    } else {
      ElMessage.error(`查询公示失败：${res.message || '接口返回异常'}`)
      publicInfoList.value = []
    }
  } catch (error) {
    const errMsg = error.response?.data?.message || '网络异常/接口未实现'
    ElMessage.error(`查询公示失败：${errMsg}`)
    publicInfoList.value = []
  } finally {
    loading.value = false
  }
}

const openPublicDialog = (row = null) => {
  if (row) {
    Object.assign(publicForm, {
      ...row,
      files: row.files || (row.fileUrl ? [{ fileUrl: row.fileUrl, fileName: row.fileName }] : [])
    })
    publicUploadFileList.value = publicForm.files.map(file => ({
      name: file.fileName,
      url: file.fileUrl,
      status: 'success',
      response: { data: file }
    }))
    isEditPublic.value = true
  } else {
    Object.assign(publicForm, {
      id: null,
      title: '',
      publicTime: '',
      publicType: '',
      files: []
    })
    publicUploadFileList.value = []
    isEditPublic.value = false
  }
  publicDialog.value = true
}

const savePublicInfo = async () => {
  if (!publicForm.title) return ElMessage.error('公示标题不能为空')
  if (!publicForm.publicTime) return ElMessage.error('公示时间不能为空')
  if (!publicForm.publicType) return ElMessage.error('公示类型不能为空')

  loading.value = true
  try {
    let res
    const submitData = { ...publicForm }
    if (isEditPublic.value) {
      res = await request.put(`${baseApiUrl}/public/update`, submitData)
    } else {
      res = await request.post(`${baseApiUrl}/public/add`, submitData)
    }
    if (res.code === 200) {
      ElMessage.success(isEditPublic.value ? '公示修改成功' : '公示新增成功')
      publicDialog.value = false
      loadPublicInfoList()
    } else {
      ElMessage.error(`${isEditPublic.value ? '修改' : '新增'}失败：${res.message || '接口返回异常'}`)
    }
  } catch (error) {
    const errMsg = error.response?.data?.message || '网络异常/接口未实现'
    ElMessage.error(`${isEditPublic.value ? '修改' : '新增'}失败：${errMsg}`)
  } finally {
    loading.value = false
  }
}

const deletePublicInfo = async (id) => {
  ElMessageBox.confirm('确定要删除该公示吗？', '删除确认', { type: 'warning' })
      .then(async () => {
        loading.value = true
        try {
          const res = await request.delete(`${baseApiUrl}/public/delete`, {
            params: { id }
          })
          if (res.code === 200) {
            ElMessage.success('公示删除成功')
            loadPublicInfoList()
          } else {
            ElMessage.error(`删除失败：${res.message || '接口返回异常'}`)
          }
        } catch (error) {
          const errMsg = error.response?.data?.message || '网络异常/接口未实现'
          ElMessage.error(`删除失败：${errMsg}`)
        } finally {
          loading.value = false
        }
      })
}

// ========== 3. 通知发布模块 ==========
const noticeQueryForm = reactive({ year: '' })
const noticeList = ref([])
const yearList = ref([])
const noticeForm = reactive({
  id: null,
  title: '',
  time: '',
  year: '',
  files: []
})
const noticeUploadFileList = ref([])
const noticeDialog = ref(false)
const isEditNotice = ref(false)

const extractYearFromTime = (time) => {
  if (!time) return;
  let year;
  if (typeof time === 'string') {
    const timeParts = time.split('-');
    if (timeParts.length === 3 && timeParts[0].length === 4) {
      year = timeParts[0];
    } else {
      ElMessage.warning('时间格式错误，请选择正确的日期');
      return;
    }
  }

  if (!year) return;
  noticeForm.year = year;
  if (!yearList.value.includes(year)) {
    yearList.value.push(year);
    yearList.value = yearList.value.sort((a, b) => b - a);
  }
}

const noticeUploadConfig = reactive({
  action: `${backendBaseUrl}/api/public/upload`,
  headers: () => ({
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  }),
  onSuccess: (response, file, fileList) => {
    if (response.code === 200) {
      noticeUploadFileList.value = fileList.filter(item => item.status === 'success');
      noticeForm.files = noticeUploadFileList.value.map(item => ({
        fileUrl: item?.raw?.uploadResponse?.data?.fileUrl || item?.response?.data?.fileUrl || '',
        fileName: item?.raw?.uploadResponse?.data?.fileName || item?.response?.data?.fileName || item.name
      }));
      file.raw.uploadResponse = response;
      ElMessage.success(`已上传 ${noticeForm.files.length}/5 个文件`);
    } else {
      ElMessage.error(`附件上传失败：${response.message || '接口返回异常'}`);
    }
  },
  onError: (error) => {
    ElMessage.error('通知附件上传失败');
  },
  beforeUpload: (file) => {
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    if (!isPdf) {
      ElMessage.error('仅支持PDF格式文件上传！');
      return false;
    }
    if (noticeUploadFileList.value.length >= 5) {
      ElMessage.warning('最多只能上传5个PDF文件！');
      return false;
    }
    return true;
  },
  onRemove: (uploadFile, fileList) => {
    noticeUploadFileList.value = fileList;
    noticeForm.files = noticeUploadFileList.value.map(item => ({
      fileUrl: item?.raw?.uploadResponse?.data?.fileUrl || item?.response?.data?.fileUrl || '',
      fileName: item?.raw?.uploadResponse?.data?.fileName || item?.response?.data?.fileName || item.name
    }));
    ElMessage.info(`已移除文件：${uploadFile.name}`);
  }
});

const loadYearList = async () => {
  try {
    const res = await request.get(`${baseApiUrl}/notice/queryAllYears`)
    if (res.code === 200) {
      yearList.value = res.data || []
    } else {
      ElMessage.error(`加载年份失败：${res.message || '接口返回异常'}`)
      yearList.value = []
    }
  } catch (error) {
    ElMessage.error('加载年份列表失败')
    yearList.value = []
  }
}

const loadNoticeList = async () => {
  loading.value = true
  try {
    if (!noticeQueryForm.year) {
      noticeList.value = []
      ElMessage.info('请先选择年份查询通知')
      loading.value = false
      return
    }
    const res = await request.get(`${baseApiUrl}/notice/queryByYear`, {
      params: { year: noticeQueryForm.year }
    })
    if (res.code === 200) {
      noticeList.value = (res.data || []).map(item => ({
        ...item,
        files: item.files || (item.fileUrl ? [{ fileUrl: item.fileUrl, fileName: item.fileName }] : [])
      }))
      if (noticeList.value.length === 0) {
        ElMessage.info(`${noticeQueryForm.year}年暂无通知数据，可点击「新增通知」添加`)
      }
    } else {
      ElMessage.error(`查询通知失败：${res.message || '接口返回异常'}`)
      noticeList.value = []
    }
  } catch (error) {
    const errMsg = error.response?.data?.message || '网络异常/接口未实现'
    ElMessage.error(`查询通知失败：${errMsg}`)
    noticeList.value = []
  } finally {
    loading.value = false
  }
}

const openNoticeDialog = (row = null) => {
  if (row) {
    Object.assign(noticeForm, {
      ...row,
      files: row.files || (row.fileUrl ? [{ fileUrl: row.fileUrl, fileName: row.fileName }] : [])
    })
    noticeUploadFileList.value = noticeForm.files.map(file => ({
      name: file.fileName,
      url: file.fileUrl,
      status: 'success',
      response: { data: file }
    }))
    isEditNotice.value = true
  } else {
    Object.assign(noticeForm, {
      id: null,
      title: '',
      time: '',
      year: '',
      files: []
    })
    noticeUploadFileList.value = []
    isEditNotice.value = false
  }
  noticeDialog.value = true
}

const saveNotice = async () => {
  if (!noticeForm.title) return ElMessage.error('通知标题不能为空')
  if (!noticeForm.time) return ElMessage.error('发布时间不能为空')
  if (!noticeForm.year) return ElMessage.error('所属年份不能为空')

  loading.value = true
  try {
    let res
    const submitData = { ...noticeForm }
    if (isEditNotice.value) {
      res = await request.put(`${baseApiUrl}/notice/update`, submitData)
    } else {
      res = await request.post(`${baseApiUrl}/notice/add`, submitData)
    }
    if (res.code === 200) {
      ElMessage.success(isEditNotice.value ? '通知修改成功' : '通知新增成功')
      noticeDialog.value = false
      loadNoticeList()
    } else {
      ElMessage.error(`${isEditNotice.value ? '修改' : '新增'}失败：${res.message || '接口返回异常'}`)
    }
  } catch (error) {
    const errMsg = error.response?.data?.message || '网络异常/接口未实现'
    ElMessage.error(`${isEditNotice.value ? '修改' : '新增'}失败：${errMsg}`)
  } finally {
    loading.value = false
  }
}

const deleteNotice = async (id) => {
  ElMessageBox.confirm('确定要删除该通知吗？', '删除确认', { type: 'warning' })
      .then(async () => {
        loading.value = true
        try {
          const res = await request.delete(`${baseApiUrl}/notice/delete`, {
            params: { id }
          })
          if (res.code === 200) {
            ElMessage.success('通知删除成功')
            loadNoticeList()
          } else {
            ElMessage.error(`删除失败：${res.message || '接口返回异常'}`)
          }
        } catch (error) {
          const errMsg = error.response?.data?.message || '网络异常/接口未实现'
          ElMessage.error(`删除失败：${errMsg}`)
        } finally {
          loading.value = false
        }
      })
}

// ===================== ✅ 作品上传审核（已修复所有报错）=====================
const fileQueryForm = reactive({ workId: '', fileName: '' })
const fileList = ref([])
const filePage = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 默认加载全部作品
const loadAllFileList = async () => {
  loading.value = true
  try {
    const res = await request.get(`${baseApiUrl}/file/queryAll`)
    if (res.code === 200) {
      fileList.value = (res.data || []).map(item => ({
        ...item,
        auditStatusText: item.status === 1 ? '审核通过' : item.status === 2 ? '审核驳回' : '待审核'
      }))
      filePage.total = fileList.value.length
      ElMessage.success(`共查询到 ${fileList.value.length} 个作品文件`)
    } else {
      ElMessage.error(`查询失败：${res.message || '接口返回异常'}`)
      fileList.value = []
      filePage.total = 0
    }
  } catch (error) {
    const errMsg = error.response?.data?.message || '网络异常/接口未实现'
    ElMessage.error(`查询失败：${errMsg}`)
    fileList.value = []
    filePage.total = 0
  } finally {
    loading.value = false
  }
}

// 查询逻辑
const queryFileList = async () => {
  if (!fileQueryForm.workId && !fileQueryForm.fileName) {
    await loadAllFileList()
    return
  }
  loading.value = true
  try {
    const res = await request.get(`${baseApiUrl}/file/queryByWorkId`, {
      params: { workId: fileQueryForm.workId }
    })
    if (res.code === 200) {
      fileList.value = (res.data || []).map(item => ({
        ...item,
        auditStatusText: item.status === 1 ? '审核通过' : item.status === 2 ? '审核驳回' : '待审核'
      }))
      filePage.total = fileList.value.length
      ElMessage.success(`查询到 ${fileList.value.length} 个文件`)
    } else {
      ElMessage.error(`查询失败：${res.message || '接口返回异常'}`)
      fileList.value = []
      filePage.total = 0
    }
  } catch (error) {
    const errMsg = error.response?.data?.message || '网络异常/接口未实现'
    ElMessage.error(`查询失败：${errMsg}`)
    fileList.value = []
    filePage.total = 0
  } finally {
    loading.value = false
  }
}

// 审核
const auditFile = async (row, status) => {
  const statusText = status ? '审核通过' : '审核驳回'
  const confirmText = status
      ? `确定要${statusText}该作品文件吗？`
      : `确定要${statusText}并删除该作品文件吗？删除后对应的报名队伍将无法查询到！`

  ElMessageBox.confirm(confirmText, '审核确认', {
    type: 'warning',
    dangerMode: !status
  })
      .then(async () => {
        loading.value = true
        try {
          if (status) {
            const res = await request.post(`${baseApiUrl}/file/audit`, {
              id: row.id,
              status: 1
            })
            if (res.code === 200) {
              row.status = 1
              row.auditStatusText = '审核通过'
              ElMessage.success(`作品文件${statusText}成功`)
            }
          } else {
            await request.post(`${baseApiUrl}/file/audit`, { id: row.id, status: 2 })
            const deleteRes = await request.delete(`${baseApiUrl}/file/delete`, { params: { id: row.id } })
            if (deleteRes.code === 200) {
              fileList.value = fileList.value.filter(item => item.id !== row.id)
              filePage.total = fileList.value.length
              ElMessage.success(`作品文件${statusText}并删除成功`)
            }
          }
        } catch (error) {
          ElMessage.error('操作失败')
        } finally {
          loading.value = false
        }
      })
}

// 文件预览下载
const handleFileOpen = (fileUrl, isDownload = false, fileName = '') => {
  try {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      ElMessage.warning('请先登录管理员账号')
      router.push('/login')
      return
    }
    const fullUrl = `${backendBaseUrl}${fileUrl}`;
    if (isDownload) {
      const a = document.createElement('a');
      a.href = fullUrl;
      a.download = fileName || '文件';
      a.download = encodeURIComponent(a.download);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      ElMessage.success('下载成功');
    } else {
      window.open(fullUrl, '_blank');
    }
  } catch (error) {
    ElMessage.error('文件操作失败');
  }
}

const downloadFile = (fileUrl) => {
  handleFileOpen(fileUrl, true, '作品文件');
}

const getFilePreviewText = (url, index) => {
  return `预览学生证照片`;
}

const getFileUuidFromUrl = (fileUrl) => {
  return fileUrl;
}
// ========== 仅处理报名信息页面的学生证照片预览/下载（不影响其他功能） ==========
const handlePhotoOpen = (fileUrl, isDownload = false) => {
  try {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      ElMessage.warning('请先登录管理员账号')
      router.push('/login')
      return
    }

    // 1. 拼接正确的照片下载地址（适配UUID格式）
    let fullUrl = ''
    if (fileUrl.startsWith('http')) {
      fullUrl = fileUrl
    } else {
      // 核心：UUID格式的照片地址拼接规则
      fullUrl = `${backendBaseUrl}/api/file/download?fileUuid=${fileUrl}`
    }

    // 2. 强制指定照片文件名（解决乱码）
    const photoFileName = '学生证照片.jpg'

    if (isDownload) {
      // 照片下载逻辑（带Token验证）
      const xhr = new XMLHttpRequest()
      xhr.open('GET', fullUrl, true)
      xhr.withCredentials = true
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.responseType = 'blob'

      xhr.onload = function() {
        if (xhr.status === 200) {
          const blob = new Blob([xhr.response], { type: 'image/jpeg' })
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = photoFileName // 强制带.jpg扩展名
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(link.href)
          ElMessage.success(`下载成功：${photoFileName}`)
        } else {
          ElMessage.error(`下载失败：服务器返回${xhr.status}错误`)
        }
      }

      xhr.onerror = function() {
        ElMessage.error('照片下载失败，请检查网络或文件地址')
      }

      xhr.send()
    } else {
      // 照片预览逻辑（新窗口显示，带Token）
      const newWindow = window.open('', '_blank')
      if (!newWindow) {
        ElMessage.warning('浏览器弹窗被拦截，请允许弹窗后重试')
        return
      }

      newWindow.document.body.style.textAlign = 'center'
      newWindow.document.body.style.padding = '50px'
      newWindow.document.body.innerHTML = '正在加载照片...'

      const xhr = new XMLHttpRequest()
      xhr.open('GET', fullUrl, true)
      xhr.withCredentials = true
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.responseType = 'blob'

      xhr.onload = function() {
        if (xhr.status === 200) {
          const blobUrl = URL.createObjectURL(new Blob([xhr.response], { type: 'image/jpeg' }))
          newWindow.document.body.innerHTML = `<img src="${blobUrl}" style="max-width:90%;max-height:90vh;" alt="学生证照片" />`
        } else {
          newWindow.document.body.style.color = 'red'
          newWindow.document.body.innerHTML = `照片预览失败：服务器返回${xhr.status}错误`
        }
      }

      xhr.onerror = function() {
        newWindow.document.body.style.color = 'red'
        newWindow.document.body.innerHTML = '照片预览失败，请检查网络连接'
      }

      xhr.send()
    }
  } catch (error) {
    console.error('照片操作失败：', error)
    ElMessage.error('学生证照片预览/下载失败，请重试')
  }
}

// 组别名称
const getGroupTypeName = (code) => {
  const groupMap = {
    'A': 'A、医学诊疗技术与器械组',
    'B': 'B、生物医学信息工程组',
    'C': 'C、生物材料与组织工程组',
    'D': 'D、其他'
  };
  return groupMap[code] || code;
};

// ========== 初始化 ==========
onMounted(async () => {
  const hasAuth = await checkAuth();
  if (!hasAuth) return;

  await loadYearList();
  await loadPublicYearList();
  await loadPublicInfoList();
  await loadAllTeamList();
  await loadAllFileList(); // ✅ 默认加载全部作品

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}')
  if (adminUser.username) {
    ElMessage.success(`欢迎回来，${adminUser.username}`)
  }
})
</script>

<template>
  <div class="admin-page" v-loading="loading">
    <div class="admin-header">
      <div class="header-left">
        <h1 class="page-title">大赛管理后台</h1>
      </div>
      <div class="header-right">
        <el-button type="text" @click="logout">
          <i class="el-icon-switch-button"></i> 退出登录
        </el-button>
      </div>
    </div>

    <div class="tab-container">
      <el-tabs v-model="activeTab" type="card" class="admin-tabs">
        <!-- 报名信息 -->
        <el-tab-pane label="报名信息管理" name="teamManage">
          <div class="card-container">
            <el-card shadow="hover" class="query-card">
              <el-form :model="teamQueryForm" inline class="query-form">
                <el-form-item label="作品ID">
                  <el-input v-model="teamQueryForm.workId" placeholder="请输入作品ID" clearable />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="queryTeamList">查询</el-button>
                  <el-button type="success" @click="exportPassedWorks" :loading="exportLoading">
                    <i class="el-icon-download"></i> 导出已通过审核作品
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>

            <el-card shadow="hover" class="table-card" style="margin-top:20px;">
              <el-table :data="teamList" border empty-text="暂无报名信息">
                <el-table-column prop="workId" label="作品ID" width="180">
                  <template #default="scope">
                    <span style="user-select: text; cursor: text;">{{ scope.row.workId }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="teamName" label="队伍名称" width="200" />
                <el-table-column prop="groupType" label="参赛组别" width="250">
                  <template #default="scope">
                    <el-tag>{{ getGroupTypeName(scope.row.groupType) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="projectName" label="项目名称" min-width="200" />
                <el-table-column prop="school" label="报名学校" width="200" />
                <el-table-column label="队员人数" width="100">
                  <template #default="scope">{{ scope.row.members?.length || 0 }}人</template>
                </el-table-column>
                <el-table-column label="指导教师" min-width="200">
                  <template #default="scope">
                    {{ scope.row.teacher1?.name || '-' }}
                    <span v-if="scope.row.teacher2?.name">、{{ scope.row.teacher2.name }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150">
                  <template #default="scope">
                    <el-button type="primary" size="small" @click="viewTeamDetail(scope.row)">查看详情</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>

          <el-dialog v-model="teamDetailDialog" title="报名详情" width="80%" append-to-body>
            <div v-if="currentTeam" class="team-detail">
              <div class="detail-section">
                <h3 class="section-title">基础信息</h3>
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="作品ID">{{ currentTeam.workId }}</el-descriptions-item>
                  <el-descriptions-item label="队伍名称">{{ currentTeam.teamName }}</el-descriptions-item>
                  <el-descriptions-item label="参赛组别">{{ getGroupTypeName(currentTeam.groupType) }}</el-descriptions-item>
                  <el-descriptions-item label="项目名称">{{ currentTeam.projectName }}</el-descriptions-item>
                  <el-descriptions-item label="报名学校">{{ currentTeam.school }}</el-descriptions-item>
                  <el-descriptions-item label="参赛专业">{{ currentTeam.major }}</el-descriptions-item>
                </el-descriptions>
              </div>

              <div class="detail-section" style="margin-top:20px;">
                <h3 class="section-title">队员信息</h3>
                    <el-table :data="currentTeam.members" border empty-text="暂无队员信息">
                      <el-table-column label="序号" width="80" align="center">
                        <template #default="{ $index }">
                          {{ $index + 1 }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="name" label="姓名" width="100" />
                      <el-table-column prop="gender" label="性别" width="80" />
                      <el-table-column prop="college" label="学院" min-width="150" />
                      <el-table-column prop="majorGrade" label="专业/年级" min-width="180" />
                      <el-table-column prop="phone" label="手机号" min-width="150" />
                      <el-table-column prop="email" label="邮箱" min-width="200" />

                      <el-table-column label="上传文件" min-width="300">
                        <template #default="scope">
                          <div v-if="scope.row.photoList && scope.row.photoList.length>0" style="display:flex;flex-direction:column;gap:4px;">
                            <!-- 预览按钮 -->
                            <el-button
                                v-for="(fileUrl,idx) in scope.row.photoList"
                                :key="`view-${idx}`"
                                type="text"
                                size="small"
                                @click="handlePhotoOpen(fileUrl, false)"
                            >
                              预览学生证照片 {{ idx+1 }} <i class="el-icon-view"></i>
                            </el-button>
                            <!-- 下载按钮 -->
                            <el-button
                                v-for="(fileUrl,idx) in scope.row.photoList"
                                :key="`download-${idx}`"
                                type="text"
                                size="small"
                                style="color:#67C23A;"
                                @click="handlePhotoOpen(fileUrl, true)"
                            >
                              下载学生证照片 {{ idx+1 }} <i class="el-icon-download"></i>
                            </el-button>
                          </div>
                          <span v-else style="color:#999;">未上传文件</span>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>

              <div class="detail-section" style="margin-top: 20px;">
                <h3 class="section-title">指导教师信息</h3>
                <el-card v-if="currentTeam.teacher1" class="teacher-card-result" style="margin-bottom: 10px;">
                  <h5>指导教师1</h5>
                  <el-descriptions :column="2" border>
                    <el-descriptions-item label="姓名">{{ currentTeam.teacher1.name || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="性别">{{ currentTeam.teacher1.gender || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="职务">{{ currentTeam.teacher1.position || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="职称">{{ currentTeam.teacher1.title || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="单位">{{ currentTeam.teacher1.unit || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="手机号码">{{ currentTeam.teacher1.phone || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="电子邮箱" :span="2">{{ currentTeam.teacher1.email || '-' }}</el-descriptions-item>
                  </el-descriptions>
                </el-card>

                <el-card v-if="currentTeam.teacher2 && currentTeam.teacher2.name" class="teacher-card-result">
                  <h5>指导教师2</h5>
                  <el-descriptions :column="2" border>
                    <el-descriptions-item label="姓名">{{ currentTeam.teacher2.name || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="性别">{{ currentTeam.teacher2.gender || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="职务">{{ currentTeam.teacher2.position || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="职称">{{ currentTeam.teacher2.title || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="单位">{{ currentTeam.teacher2.unit || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="手机号码">{{ currentTeam.teacher2.phone || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="电子邮箱" :span="2">{{ currentTeam.teacher2.email || '-' }}</el-descriptions-item>
                  </el-descriptions>
                </el-card>

                <div v-if="!currentTeam.teacher1 && !currentTeam.teacher2" class="empty-tip">
                  暂无指导教师信息
                </div>
              </div>
            </div>
          </el-dialog>
        </el-tab-pane>

        <!-- 公示发布 -->
        <el-tab-pane label="公示发布" name="noticeManage">
          <div class="card-container">
            <el-card shadow="hover" class="operate-card">
              <el-form :model="publicQueryForm" inline class="query-form">
                <el-form-item label="公示类型">
                  <el-select v-model="publicQueryForm.publicType" clearable @change="loadPublicInfoList">
                    <el-option label="获奖公示" value="获奖公示" />
                    <el-option label="初审公示" value="初审公示" />
                    <el-option label="终审公示" value="终审公示" />
                  </el-select>
                </el-form-item>
                <el-form-item label="所属年份">
                  <el-select v-model="publicQueryForm.year" clearable @change="loadPublicInfoList">
                    <el-option v-for="year in publicYearList" :key="year" :label="year" :value="year" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="openPublicDialog()">
                    <i class="el-icon-plus"></i> 新增公示
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>

            <el-card shadow="hover" class="table-card" style="margin-top:20px;">
              <el-table :data="publicInfoList" border empty-text="暂无公示信息">
                <el-table-column prop="id" label="序号" width="80" align="center" />
                <el-table-column prop="title" label="公示标题" min-width="200" />
                <el-table-column prop="publicTime" label="公示时间" width="180" />
                <el-table-column prop="publicType" label="公示类型" width="150">
                  <template #default="scope"><el-tag type="success">{{ scope.row.publicType }}</el-tag></template>
                </el-table-column>
                <el-table-column label="公示文件" min-width="200">
                  <template #default="scope">
                    <div v-if="scope.row.files.length>0" class="file-list">
                      <el-button
                          v-for="(file,idx) in scope.row.files"
                          :key="idx"
                          type="text"
                          size="small"
                          @click="handleFileOpen(file.fileUrl,true,file.fileName)"
                      >
                        {{ file.fileName }} <i class="el-icon-download"></i>
                      </el-button>
                    </div>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button type="info" size="small" @click="openPublicDialog(scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="deletePublicInfo(scope.row.id)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>

          <el-dialog v-model="publicDialog" :title="isEditPublic ? '编辑公示' : '新增公示'" width="70%" append-to-body>
            <el-form :model="publicForm" label-width="100px">
              <el-form-item label="公示标题" required>
                <el-input v-model="publicForm.title" placeholder="请输入公示标题" />
              </el-form-item>
              <el-form-item label="公示时间" required>
                <el-date-picker v-model="publicForm.publicTime" type="date" placeholder="请选择公示时间" style="width:100%;" />
              </el-form-item>
              <el-form-item label="公示类型" required>
                <el-select v-model="publicForm.publicType" placeholder="请选择公示类型">
                  <el-option label="获奖公示" value="获奖公示" />
                  <el-option label="初审公示" value="初审公示" />
                  <el-option label="终审公示" value="终审公示" />
                </el-select>
              </el-form-item>
              <el-form-item label="公示文件">
                <el-upload
                    :action="publicUploadConfig.action"
                    :headers="publicUploadConfig.headers"
                    :on-success="publicUploadConfig.onSuccess"
                    :on-error="publicUploadConfig.onError"
                    :before-upload="publicUploadConfig.beforeUpload"
                    :on-remove="publicUploadConfig.onRemove"
                    :limit="5"
                    :file-list="publicUploadFileList"
                    multiple
                >
                  <el-button size="small" type="primary">点击上传PDF文件</el-button>
                  <div slot="tip" class="el-upload__tip">仅支持PDF，最多5个</div>
                </el-upload>
              </el-form-item>
            </el-form>
            <template #footer>
              <el-button @click="publicDialog = false">取消</el-button>
              <el-button type="primary" @click="savePublicInfo">保存</el-button>
            </template>
          </el-dialog>
        </el-tab-pane>

        <!-- 通知发布 -->
        <el-tab-pane label="通知发布" name="messageManage">
          <div class="card-container">
            <el-card shadow="hover" class="operate-card">
              <el-form :model="noticeQueryForm" inline class="query-form">
                <el-form-item label="所属年份">
                  <el-select v-model="noticeQueryForm.year" clearable @change="loadNoticeList">
                    <el-option v-for="year in yearList" :key="year" :label="year" :value="year" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="openNoticeDialog()"><i class="el-icon-plus"></i> 新增通知</el-button>
                </el-form-item>
              </el-form>
            </el-card>

            <el-card shadow="hover" class="table-card" style="margin-top:20px;">
              <el-table :data="noticeList" border empty-text="暂无通知信息">
                <el-table-column prop="id" label="序号" width="80" align="center" />
                <el-table-column prop="title" label="通知标题" min-width="200" />
                <el-table-column prop="time" label="发布时间" width="180" />
                <el-table-column prop="year" label="所属年份" width="100">
                  <template #default="scope"><el-tag>{{ scope.row.year }}</el-tag></template>
                </el-table-column>
                <el-table-column label="附件" min-width="200">
                  <template #default="scope">
                    <div v-if="scope.row.files.length>0" class="file-list">
                      <el-button
                          v-for="(file,idx) in scope.row.files"
                          :key="idx"
                          type="text"
                          size="small"
                          @click="handleFileOpen(file.fileUrl,true,file.fileName)"
                      >
                        {{ file.fileName }} <i class="el-icon-download"></i>
                      </el-button>
                    </div>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button type="info" size="small" @click="openNoticeDialog(scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="deleteNotice(scope.row.id)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>

          <el-dialog v-model="noticeDialog" :title="isEditNotice ? '编辑通知' : '新增通知'" width="70%" append-to-body>
            <el-form :model="noticeForm" label-width="100px">
              <el-form-item label="通知标题" required>
                <el-input v-model="noticeForm.title" placeholder="请输入通知标题" />
              </el-form-item>
              <el-form-item label="发布时间" required>
                <el-date-picker
                    v-model="noticeForm.time"
                    type="date"
                    placeholder="请选择发布时间"
                    value-format="YYYY-MM-DD"
                    style="width:100%;"
                    @change="extractYearFromTime"
                />
              </el-form-item>
              <el-form-item label="所属年份" required>
                <el-select v-model="noticeForm.year" placeholder="请选择所属年份">
                  <el-option v-for="year in yearList" :key="year" :label="year" :value="year" />
                </el-select>
              </el-form-item>
              <el-form-item label="通知附件">
                <el-upload
                    :action="noticeUploadConfig.action"
                    :headers="noticeUploadConfig.headers"
                    :on-success="noticeUploadConfig.onSuccess"
                    :on-error="noticeUploadConfig.onError"
                    :before-upload="noticeUploadConfig.beforeUpload"
                    :on-remove="noticeUploadConfig.onRemove"
                    :limit="5"
                    :file-list="noticeUploadFileList"
                    multiple
                >
                  <el-button size="small" type="primary">点击上传PDF文件</el-button>
                  <div slot="tip" class="el-upload__tip">仅支持PDF，最多5个</div>
                </el-upload>
              </el-form-item>
            </el-form>
            <template #footer>
              <el-button @click="noticeDialog = false">取消</el-button>
              <el-button type="primary" @click="saveNotice">保存</el-button>
            </template>
          </el-dialog>
        </el-tab-pane>

        <!-- ===================== ✅ 作品上传审核（零报错）===================== -->
        <el-tab-pane label="作品上传审核" name="fileAudit">
          <div class="card-container">
            <el-card shadow="hover" class="query-card">
              <el-form :model="fileQueryForm" inline class="query-form">
                <el-form-item label="作品ID">
                  <el-input
                      v-model="fileQueryForm.workId"
                      placeholder="请输入作品ID"
                      clearable
                      @clear="loadAllFileList"
                  />
                </el-form-item>
                <el-form-item label="文件名">
                  <el-input
                      v-model="fileQueryForm.fileName"
                      placeholder="请输入文件名关键词"
                      clearable
                      @clear="loadAllFileList"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="queryFileList">查询</el-button>
                  <el-button @click="() => { fileQueryForm.workId=''; fileQueryForm.fileName=''; loadAllFileList(); }">
                    重置
                  </el-button>
                  <el-button type="success" @click="exportPassedWorks" :loading="exportLoading">
                    <i class="el-icon-download"></i> 导出已通过审核作品
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>

            <el-card shadow="hover" class="table-card" style="margin-top:20px;">
              <el-table :data="fileList" border empty-text="暂无文件信息">
                <el-table-column prop="workId" label="作品ID" width="180" />
                <el-table-column prop="originalFileName" label="文件名" min-width="200" />
                <el-table-column label="文件大小" width="120">
                  <template #default="scope">
                    {{ scope.row.fileSize ? (scope.row.fileSize / 1024 / 1024).toFixed(2) : 0 }} MB
                  </template>
                </el-table-column>
                <el-table-column prop="fileType" label="文件类型" width="150" />
                <el-table-column prop="uploadTime" label="上传时间" width="200" />
                <el-table-column label="审核状态" width="120">
                  <template #default="scope">
                    <el-tag
                        :type="scope.row.status === 1 ? 'success' : scope.row.status === 2 ? 'danger' : 'warning'"
                    >
                      {{ scope.row.auditStatusText }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="250">
                  <template #default="scope">
                    <el-button type="info" size="small" @click="downloadFile(scope.row.fileUrl)">下载</el-button>
                    <el-button type="success" size="small" @click="auditFile(scope.row,true)" v-if="!scope.row.status">审核通过</el-button>
                    <el-button type="danger" size="small" @click="auditFile(scope.row,false)" v-if="!scope.row.status">审核驳回</el-button>
                  </template>
                </el-table-column>
              </el-table>

              <el-pagination
                  @size-change="(val) => filePage.pageSize = val"
                  @current-change="(val) => filePage.pageNum = val"
                  :current-page="filePage.pageNum"
                  :page-sizes="[10,20,50]"
                  :page-size="filePage.pageSize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="filePage.total"
                  style="margin-top:20px; text-align:right;"
              />
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  width: 100%;
  min-height: 100vh;
  font-family: "微软雅黑";
  background-color: #f5f7fa;
  padding: 0 20px 20px;
  box-sizing: border-box;
}
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}
.header-left .page-title {
  font-size: 24px;
  color: #1f2d3d;
  font-weight: bold;
  margin: 0;
}
.tab-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}
.query-card,.operate-card {
  padding: 20px;
}
.table-card {
  padding: 20px;
}
.team-detail { width:100%; }
.detail-section { width:100%; }
.section-title {
  font-size: 16px;
  color: #1f2d3d;
  font-weight: bold;
  margin:0 0 10px 0;
  padding-bottom:5px;
  border-bottom:1px solid #e5e6eb;
}
.file-list {
  display: flex;
  flex-wrap: wrap;
  gap:8px;
  align-items:center;
}
</style>