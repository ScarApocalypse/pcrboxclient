<template>
  <div class="pcr">
    <h3>大枫树公会BOX</h3>
    <el-button-group width="100%">
      <el-button
        type="primary"
        :icon="isColl == '展开' ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"
        @click="collAll"
      >
        {{ isColl }}
      </el-button>
      <el-button type="primary" @click="showAddBoxDialog()">
        添加box
        <i class="el-icon-plus el-icon--right"></i
      ></el-button>
    </el-button-group>

    <el-collapse v-model="activeNames">
      <el-collapse-item
        :name="item.owner"
        v-for="item in list"
        :key="item.owner"
      >
        <template slot="title">
          {{ item.owner }}
        </template>
        <el-tooltip
          placement="bottom"
          v-for="item2 in item.roles"
          :key="item2.id"
        >
          <div slot="content" style="text-align:center;font-size:16px;">
            {{ item2.name }}<br />
            {{ item2.stars }}星<br />
            rank{{ item2.rank }}<br />
            {{ item2.power }}<br />
          </div>
          <el-image
            style="width: 50px; height: 50px"
            :src="iconUrl + item2.icon + '.png'"
            :class="'icon R' + item2.rank"
          ></el-image>
        </el-tooltip>

        <el-button
          type="primary"
          icon="el-icon-edit"
          @click="editBox(item)"
          style="float:left;width:54px;height:54px"
        ></el-button>

        <el-popconfirm
          :title="`确认删除${item.owner}的Box吗？`"
          @onConfirm="deleteBox(item)"
        >
          <el-button
            slot="reference"
            type="primary"
            icon="el-icon-delete"
            style="float:left;width:54px;height:54px;margin-left:1px;"
          >
          </el-button>
        </el-popconfirm>
      </el-collapse-item>
    </el-collapse>

    <el-dialog
      :title="isEdit ? '修改Box' : '添加Box'"
      :visible.sync="addBoxDialogVisible"
      width="94%"
      fullscreen
      @close="handleClose()"
    >
      <div>
        <el-input
          placeholder="请输入内容"
          v-model="boxForm.owner"
          :disabled="isEdit"
        >
          <template slot="prepend">ID</template>
        </el-input>
      </div>
      <div class="ownBox ">
        <el-tooltip
          placement="top"
          v-for="item in boxForm.roles"
          :key="item.id"
        >
          <div slot="content" style="text-align:center;font-size:16px;">
            {{ item.name }}<br />
            {{ item.stars }}星<br />
            rank{{ item.rank }}<br />
            {{ item.power }}<br />

            <el-button
              type="text"
              icon="el-icon-delete"
              circle
              size="mini"
              @click="deleteRole(item)"
            ></el-button>
          </div>
          <el-image :src="item.icon" :class="'icon R' + item.rank"></el-image>
        </el-tooltip>
      </div>
      <div class="boxMap">
        <el-image
          v-for="(item, index) in box"
          :key="index"
          :src="item.icon"
          class="R6 icon"
          @click="showAddRoleDialog(item)"
          v-show="!hideBoxMap[item.name]"
        ></el-image>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addBoxCancel">取 消</el-button>
        <el-button type="primary" @click="addBox()">
          确 定
        </el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="94%"
    >
      <div class="dialogContent">
        <div class="roleName">{{ addRoleForm.name }}</div>
        <el-row>
          <el-image :src="addRoleForm.icon" class="bigIcno"></el-image>
        </el-row>
        <div class="stars">
          <el-rate v-model="addRoleForm.stars"></el-rate>
        </div>
        <el-row>
          <el-select
            v-model="addRoleForm.rank"
            placeholder="请选择"
            class="select"
          >
            <el-option
              v-for="item in rankOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-row>

        <el-row class="power">
          <div>
            <el-input placeholder="请输入内容" v-model="addRoleForm.power">
              <template slot="prepend">战力</template>
            </el-input>
          </div>
        </el-row>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "app",
  components: {},
  created() {
    this.getList()
  },
  data() {
    return {
      activeNames: [],
      allActiveName: [],
      addBoxDialogVisible: false,
      addRoleDialogVisible: false,
      isEdit: false,
      box: [],

      hideBoxMap: {},
      boxForm: {
        owner: "",
        roles: []
      },
      boxDetail: {},
      list: [],
      iconUrl: "https://gitee.com/sinep/pcricon/raw/master/",
      addRoleForm: {
        icon: "",
        name: "",
        roleId: 0,
        rank: 7,
        power: 5000,
        stars: 3
      },
      rankOption: [
        { value: 1, label: "Rank1" },
        { value: 2, label: "Rank2" },
        { value: 3, label: "Rank3" },
        { value: 4, label: "Rank4" },
        { value: 5, label: "Rank5" },
        { value: 6, label: "Rank6" },
        { value: 7, label: "Rank7" },
        { value: 8, label: "Rank8" }
      ]
    }
  },
  computed: {
    isColl() {
      return this.activeNames.length > 0 ? "折叠" : "展开"
    }
  },
  methods: {
    // 获取列表数据
    async getList() {
      let { data: roleRes } = await this.$http.get("roles")
      let { data: listRes } = await this.$http.get("list")
      this.box = roleRes.data
      this.list = this.polyData(listRes.data)
      this.initActiveName()
    },
    collAll() {
      if (this.activeNames.length == 0) {
        return (this.activeNames = this.allActiveName)
      }
      this.activeNames = []
    },
    showDialog() {
      this.dialogVisible = true
    },
    handleMapClick(id, name, rank) {
      let item = {
        name,
        rank
      }

      this.hideBoxMap.push(item)
      this.boxDetail[name] = item
      // this.boxForm.push(box.filter)
      let obj = this.box.filter(item => {
        return item.id == id
      })
      this.boxForm.box.push(obj[0])
    },
    handleBoxClick(id, name) {
      this.hideBoxMap.pop(name)
      this.boxForm.box.splice(
        this.box.findIndex(item => item.id == id),
        1
      )
    },
    showIcon(name, rank) {
      return this.hideBoxMap.some(item => {
        return item.name == name && item.rank == rank
      })
    },
    showBox(name) {
      return !this.hideBoxMap.some(item => {
        return item.name == name
      })
    },
    // 根据角色拥有者聚合列表数据
    polyData(array) {
      let recordObj = {}
      let result = []
      let recordIndex = 0
      array.forEach(item => {
        if (recordObj[item.owner] == undefined) {
          recordObj[item.owner] = recordIndex
          let obj = { owner: item.owner, roles: [] }
          obj.roles.push(item)
          result[recordIndex] = obj
          recordIndex++
        } else {
          let resultIndex = recordObj[item.owner]
          result[resultIndex].roles.push(item)
        }
      })
      return result
    },
    initActiveName() {
      this.list.forEach(item => {
        item.owner && this.allActiveName.push(item.owner)
        console.log(item)
      })
      console.log(this.list[0].owner)
      // this.activeNames.push(this.list[0].owner)
    },
    showAddBoxDialog() {
      this.addBoxDialogVisible = true
      // this.addRoleDialogVisible = true
    },
    showAddRoleDialog(item) {
      console.log(item)
      this.addRoleForm.icon = item.icon
      this.addRoleForm.name = item.name
      this.addRoleForm.roleId = item.id

      this.addRoleDialogVisible = true
    },
    addRole() {
      console.log(111)
      let obj = { ...this.addRoleForm }
      this.boxForm.roles.push(obj)
      this.$set(this.hideBoxMap, this.addRoleForm.name, true)
      // this.hideBoxMap[this.addRoleForm.name] = true
      this.addRoleForm.rank = 7
      this.addRoleForm.power = 5000
      this.addRoleForm.stars = 3
      this.addRoleDialogVisible = false
    },
    deleteRole(item) {
      console.log(item)
      console.log(item.name)
      console.log(this.hideBoxMap[item.name])
      console.log(this.hideBoxMap)
      this.$set(this.hideBoxMap, item.name, false)
      console.log(this.hideBoxMap)
      let deleteIndex = this.boxForm.roles.findIndex(
        obj => obj.roleId == item.roleId
      )
      this.boxForm.roles.splice(deleteIndex, 1)
    },
    async addBox() {
      if (this.isEdit) {
        return this.submitEditBox()
      }

      if (!this.boxForm.owner.trim()) {
        return this.$message.error("id不能为空")
      }
      if (this.boxForm.roles.length > 0) {
        this.boxForm.roles.forEach((item, index, arr) => {
          arr[index].owner = this.boxForm.owner
        })
        const res = await this.$http.post("addbox", this.boxForm.roles)
        console.log(res)
        if (res.status == 200 && res.data.code == 0) {
          this.$message.success("添加box成功")
          this.getList()
          this.addBoxDialogVisible = false
        } else {
          this.$message.error("id已存在")
        }
      }
      this.boxForm.roles = []
      this.boxForm.owner = ""
      this.hideBoxMap = {}
    },
    addBoxCancel() {
      this.hideBoxMap = {}

      this.boxForm.roles = []
      this.boxForm.owner = ""
      this.addBoxDialogVisible = false
    },
    async deleteBox(item) {
      console.log(item)
      const { data: res } = await this.$http.post("deletebox", {
        owner: item.owner
      })
      if (res.code == 0) {
        this.$message.success("删除box成功")
        this.getList()
      } else {
        this.$message.error("删除box失败")
      }
    },
    editBox(item) {
      console.log(item)
      this.isEdit = true
      this.boxForm = { owner: item.owner, roles: [] }
      item.roles.forEach(obj => {
        let newObj = { ...obj }
        this.boxForm.roles.push(newObj)
      })
      this.boxForm.roles.forEach((item, index, arr) => {
        arr[index].icon = this.iconUrl + item.icon + ".png"
        this.$set(this.hideBoxMap, item.name, true)
      })
      this.addBoxDialogVisible = true
    },
    handleClose() {
      this.isEdit = false
      this.getList()
    },
    async submitEditBox() {
      for (let item of this.boxForm.roles) {
        item.owner = this.boxForm.owner
        if (!item.roleId) {
          item.roleId = item.rolesId
        }
      }
      if (this.boxForm.roles.length == 0) {
        return this.$message.error("不能将Box修改为空")
      }

      const res = await this.$http.post("editbox", this.boxForm.roles)
      if (res.data.code == 0) {
        this.addBoxDialogVisible = false
        this.$message.success("修改成功")
      } else {
        this.$message.error("修改失败")
      }
    }
  }
}
</script>

<style>
.power {
  margin-top: 10px;
  text-align: center;
}
.roleName {
  margin-top: -10px;
  margin-bottom: 10px;
}
.select {
  text-align: center;
  width: 90px;
}
.icon {
  width: 40px;
  height: 40px;
  border: 2px solid #ccc;
}
.ownBox,
.boxMap {
  height: 150px;
  overflow: auto;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.ownBox {
  margin-bottom: 20px;
}
.ownBox2 {
  height: 100px;
}
.pcr {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 10px;
}
.bigIcno {
  width: 100px;
  height: 100px;
}
.R8 {
  float: left;
  border: 2px solid yellow;
}

.R7 {
  float: left;
  border: 2px solid skyblue;
}
.R1,
.R2,
.R3,
.R4,
.R5,
.R6 {
  float: left;
  border: 2px solid #ccc;
}
.dialogContent {
  padding: 0 60px;
}
.stars {
  margin-bottom: 10px;
}
</style>
