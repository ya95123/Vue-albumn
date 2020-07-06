<template lang="pug">
  #album
    h1.text-center 我的相簿
    hr
    h2 檔案上傳
    br
    b-form(@submit="submit")
      //- 只能用圖片檔
      b-form-file(
        v-model="file"
        :state="state"
        variant="light"
        placeholder="選擇檔案或拖曳至此"
        drop-placeholder="將檔案拖曳至此"
        required
        browse-text="瀏覽"
        accept="image/*"
        @input="validateFile"
      )
      p.text-danger 僅支援 1MB 以下的圖片
      b-form-textarea(
        v-model="description"
        placeholder="相片說明"
        rows="3"
        max-rows="6"
        maxlength="200"
        @input="validateText"
        :state="textstate"
      )
      br
      #upload.w-100.text-center
        b-button(type="submit" variant="light") 上傳
    hr
    Photoswipe
      b-row
        b-col(cols="12" md="6" lg="3" v-for="(image, idx) in images" :key="idx")
          b-card
            b-card-img(:src="image.src" v-pswp="image")
            b-card-body
              //- pre 文字可換行
              pre(v-if="!image.edit" class="mr-2" style="font-size:1rem") {{ image.title }}
              b-form-textarea(v-else v-model="image.model")
              //- 編輯狀態 編輯中(取消/確定)、一般狀態(編輯/刪除)
              b-btn(v-if="image.edit" variant="light" @click="cancel(image)") ⤾
              b-btn(v-else variant="light" @click="del(image,idx)") ⨯
              b-btn(v-if="image.edit" variant="light" @click="update(image)") ✓
              b-btn(v-else variant="light" @click="edit(image)") 🖊
</template>
<script>
export default {
  name: 'album',
  data () {
    return {
      file: null,
      description: '',
      state: null,
      textstate: null,
      images: []
    }
  },
  computed: {
    user () {
      return this.$store.getters.user
    }
  },
  methods: {
    validateFile () {
      if (this.file != null) {
        if (this.file.size >= 1024 * 1024 || !this.file.type.includes('image')) {
          this.state = false
          this.file = null
        } else {
          this.state = true
        }
      }
    },
    validateText () {
      if (this.description.length > 200) {
        this.textstate = false
      } else {
        this.textstate = true
      }
      // 簡寫↓
      // this.textstate = (this.description.length > 200)
    },
    // 上傳時
    submit (event) {
      event.preventDefault()
      if (this.file === null || this.file.size >= 1024 * 1024 || !this.file.type.includes('image')) {
        alert('檔案格式不符 或 檔案過大')
      } else {
        alert('上傳成功')
        // FormData 可以同時傳送檔案和表單資料
        const fd = new FormData()
        fd.append('image', this.file)
        fd.append('description', this.description)

        this.axios.post(process.env.VUE_APP_APIURL + '/file', fd, {
          // 因為 axios 預設是送 json，所以要自己設定成 formdata
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then(response => {
          // !上傳後馬上出現在頁面上的設定
          this.images.push(
            {
              title: this.description,
              src: process.env.VUE_APP_APIURL + '/file/' + response.data.name,
              _id: response.data._id,
              edit: false,
              model: response.data.name
            }
          )
          // 清空 form 文字
          this.file = null
          this.description = ''
        }).catch(error => {
          alert(error.response.data.message)
        })
      }
    },
    edit (image) {
      image.edit = true
      image.model = image.title
    },
    update (image) {
      this.axios.patch(process.env.VUE_APP_APIURL + '/file/' + image._id, { description: image.model })
        .then(response => {
          image.edit = false
          image.title = image.model
        })
        .catch(() => {
          alert('發生錯誤')
        })
    },
    cancel (image) {
      image.edit = false
      // 確保文字沒有被更動
      image.model = image.title
    },
    del (image, idx) {
      this.axios.delete(process.env.VUE_APP_APIURL + '/file/' + image._id)
        .then(response => {
          this.images.splice(idx, 1)
        })
        .catch(() => {
          alert('發生錯誤')
        })
    }
  },
  // 獲取檔案
  mounted () {
    this.axios.get(process.env.VUE_APP_APIURL + '/album/' + this.user)
      .then(response => {
        this.images = response.data.result.map(d => {
          return {
            title: d.description,
            src: process.env.VUE_APP_APIURL + '/file/' + d.name,
            _id: d._id,
            edit: false,
            model: d.name
          }
        })
      })
      .catch(() => {
        alert('發生錯誤')
      })
  }
}
</script>
