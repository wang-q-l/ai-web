<template>
  <div class="page-container">
    <!-- 页面标题和搜索 -->
    <div class="page-header">
      <h2 class="page-title">项目打卡</h2>
      <div class="header-right-area">
        <el-input
          v-model="searchKeyword"
          placeholder="项目名称搜索"
          style="width: 220px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <!-- 审计组长项目切换 -->
        <el-select
          v-if="currentRole === 'leader'"
          v-model="queryParams.projectId"
          @change="handleSelectProject"
          style="width: 280px"
        >
          <el-option
            v-for="project in filteredProjectList"
            :key="project.id"
            :label="project.name"
            :value="project.id"
          />
        </el-select>
        <!-- 角色切换 -->
        <div class="role-switcher">
          <el-dropdown @command="handleSwitchRole" trigger="click">
            <div class="role-trigger">
              <div class="role-avatar">{{ currentRoleUser.avatar }}</div>
              <div class="role-info">
                <div class="role-name">{{ currentRoleUser.name }}</div>
                <div class="role-tag">{{ currentRoleUser.roleLabel }}</div>
              </div>
              <el-icon class="role-arrow"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="user in roleUserList"
                  :key="user.role"
                  :command="user.role"
                  :class="{ 'is-active-role': currentRole === user.role }"
                >
                  <div class="role-menu-item">
                    <span class="role-menu-avatar">{{ user.avatar }}</span>
                    <div>
                      <div class="role-menu-name">{{ user.name }}</div>
                      <div class="role-menu-label">{{ user.roleLabel }}</div>
                    </div>
                    <el-icon v-if="currentRole === user.role" class="role-check"><Check /></el-icon>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 项目信息栏（所有角色统一显示） -->
    <el-card class="project-info-banner">
      <div class="banner-content">
        <div class="banner-name">{{ currentProject?.name }}</div>
        <div class="banner-divider"></div>
        <div class="banner-item"><i class="iconfont-sys banner-icon" v-html="'&#xe61b;'"></i><span class="banner-label">审计组长</span><span class="banner-value">{{ currentProject?.leader }}</span></div>
        <div class="banner-item"><i class="iconfont-sys banner-icon" v-html="'&#xe625;'"></i><span class="banner-label">项目经理</span><span class="banner-value">{{ currentProject?.manager }}</span></div>
        <div class="banner-item"><i class="iconfont-sys banner-icon" v-html="'&#xe88a;'"></i><span class="banner-label">中介机构</span><span class="banner-value">{{ currentProject?.organization }}</span></div>
        <div class="banner-item"><i class="iconfont-sys banner-icon" v-html="'&#xe7ae;'"></i><span class="banner-label">中介人员数量</span><span class="banner-value">{{ currentProject?.userCount }}人</span></div>
      </div>
    </el-card>

    <!-- 页签切换 -->
    <el-tabs v-model="activeTab" class="content-tabs">
      <el-tab-pane label="项目打卡甘特图" name="gantt">
        <!-- 甘特图卡片 -->
        <el-card class="gantt-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span class="card-title">项目打卡甘特图</span>
                <div class="legend-list">
                  <span class="legend-item"><i class="legend-dot dot-normal"></i>正常</span>
                  <span class="legend-item"><i class="legend-dot dot-overtime"></i>加班</span>
                  <span class="legend-item"><i class="legend-dot dot-insufficient"></i>工时不足</span>
                  <span class="legend-item"><i class="legend-dot dot-incomplete"></i>漏打卡</span>
                  <span class="legend-item"><i class="legend-dot dot-leave"></i>请假</span>
                  <span class="legend-item"><i class="legend-dot dot-weekend"></i>休息日</span>
                </div>
              </div>
              <div class="header-right">
                <el-button type="primary" size="small" @click="handleCheckinToday">现场打卡</el-button>
                <el-button :icon="ArrowLeft" @click="handlePrevMonth">上个月</el-button>
                <span class="current-month">{{ currentMonthText }}</span>
                <el-button :icon="ArrowRight" @click="handleNextMonth" :disabled="isCurrentMonth">下个月</el-button>
              </div>
            </div>
          </template>
          <div class="gantt-container">
            <el-scrollbar>
              <div class="gantt-wrapper">
                <!-- 甘特图表格 -->
                <table class="gantt-table">
                  <thead>
                    <tr>
                      <th class="name-column">姓名</th>
                      <th
                        class="date-column"
                        v-for="date in dateList"
                        :key="date"
                        :class="{ 'is-today': isToday(date), 'is-weekend': isWeekend(date) }"
                      >
                        <div class="date-header">
                          <div class="date-day">{{ formatDateDay(date) }}</div>
                          <div class="date-week">{{ formatDateWeek(date) }}</div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in filteredGanttData" :key="user.userId">
                      <td class="name-cell">{{ getUserDisplayName(user.userName) }}</td>
                      <td
                        class="date-cell"
                        v-for="date in dateList"
                        :key="date"
                        :class="{ 'is-today': isToday(date), 'is-weekend': isWeekend(date) }"
                      >
                        <!-- 请假 -->
                        <el-tooltip v-if="isOnLeave(user.userId, date)" placement="top">
                          <template #content>
                            <div class="tooltip-content">
                              <div>姓名：{{ user.userName }}</div>
                              <div>日期：{{ date }}</div>
                              <div>状态：请假</div>
                              <div>类型：{{ getLeaveType(user.userId, date) }}</div>
                            </div>
                          </template>
                          <div class="status-block block-leave"></div>
                        </el-tooltip>
                        <!-- 休息日无数据 -->
                        <div v-else-if="isWeekend(date) && !user.dateMap[date]" class="status-block block-weekend"></div>
                        <!-- 有打卡记录 -->
                        <el-tooltip v-else-if="user.dateMap[date]" placement="top">
                          <template #content>
                            <div class="tooltip-content">
                              <div>姓名：{{ user.userName }}</div>
                              <div>日期：{{ date }}</div>
                              <div>上班：{{ user.dateMap[date].clockIn || '未打卡' }}</div>
                              <div>下班：{{ user.dateMap[date].clockOut || '未打卡' }}</div>
                              <div>工时：{{ user.dateMap[date].duration }}</div>
                              <div v-if="!user.dateMap[date].clockIn || !user.dateMap[date].clockOut">
                                <el-button link type="primary" size="small" @click.stop="handleMakeupCheckin(user, date)">
                                  申请补卡
                                </el-button>
                              </div>
                            </div>
                          </template>
                          <div class="status-block" :class="getBarClass(user.dateMap[date])"></div>
                        </el-tooltip>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </el-scrollbar>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="打卡记录明细" name="records">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">打卡记录明细</span>
            </div>
          </template>
          <div class="table-container">
            <el-table :data="filteredTableData" height="100%" width="100%">
              <el-table-column prop="userName" label="姓名" min-width="140">
                <template #default="{ row }">
                  {{ getUserDisplayName(row.userName) }}
                </template>
              </el-table-column>
              <el-table-column prop="date" label="日期" min-width="120" />
              <el-table-column prop="clockIn" label="上班打卡" min-width="120">
                <template #default="{ row }">
                  <span :style="{ color: row.clockIn ? '#303133' : '#c0c4cc' }">{{ row.clockIn || '未打卡' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="clockOut" label="下班打卡" min-width="120">
                <template #default="{ row }">
                  <span :style="{ color: row.clockOut ? '#303133' : '#c0c4cc' }">{{ row.clockOut || '未打卡' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="duration" label="当日工时" min-width="120">
                <template #default="{ row }">
                  <span>{{ row.duration || '—' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="状态" min-width="120">
                <template #default="{ row }">
                  <el-tag v-if="!row.clockIn || !row.clockOut" type="warning">漏打卡</el-tag>
                  <el-tag v-else-if="row.hours >= 10" type="warning">加班</el-tag>
                  <el-tag v-else-if="row.hours >= 8" type="success">正常</el-tag>
                  <el-tag v-else type="danger">工时不足</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadTableData"
            @current-change="loadTableData"
          />
        </el-card>
      </el-tab-pane>

      <!-- 请假记录 -->
      <el-tab-pane label="请假记录" name="leave">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">请假记录</span>
              <span class="card-subtitle">请假申请需经审批后生效，审批通过后甘特图中将显示请假状态</span>
              <el-button type="primary" style="margin-left: auto" @click="handleApplyLeave">
                <el-icon><Plus /></el-icon>
                申请请假
              </el-button>
            </div>
          </template>
          <div class="table-container">
            <el-table :data="filteredLeaveRecords" height="100%" width="100%">
              <el-table-column prop="userName" label="姓名" width="100" />
              <el-table-column prop="leaveType" label="请假类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="leaveTypeTagMap[row.leaveType]" size="small">{{ row.leaveType }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="startDate" label="开始日期" width="120" />
              <el-table-column prop="endDate" label="结束日期" width="120" />
              <el-table-column prop="days" label="请假天数" width="100">
                <template #default="{ row }">
                  {{ row.days }}天
                </template>
              </el-table-column>
              <el-table-column prop="reason" label="请假原因" min-width="200" show-overflow-tooltip />
              <el-table-column prop="applyTime" label="申请时间" width="180" />
              <el-table-column prop="approver" label="审批人" width="100" />
              <el-table-column prop="status" label="审批状态" width="100">
                <template #default="{ row }">
                  <el-tag v-if="row.status === 0" type="warning">待审批</el-tag>
                  <el-tag v-else-if="row.status === 1" type="success">已通过</el-tag>
                  <el-tag v-else type="danger">已拒绝</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="approveRemark" label="审批意见" width="150" show-overflow-tooltip />
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" @click="handleApproveLeave(row)" v-if="row.status === 0">
                    审批
                  </el-button>
                  <span v-else style="color: #909399; font-size: 13px">
                    {{ row.status === 1 ? '已通过' : '已拒绝' }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 补卡记录 -->
      <el-tab-pane label="补卡记录" name="makeup">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">补卡记录</span>
              <span class="card-subtitle">补卡申请需经过审批后方可生效</span>
            </div>
          </template>
          <div class="table-container">
            <el-table :data="filteredMakeupRecords" height="100%" width="100%">
              <el-table-column prop="userName" label="姓名" width="100" />
              <el-table-column prop="date" label="补卡日期" width="120" />
              <el-table-column prop="checkinType" label="打卡类型" width="100">
                <template #default="{ row }">
                  <el-tag v-if="row.checkinType === 1" type="success">上班打卡</el-tag>
                  <el-tag v-else type="warning">下班打卡</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="checkinTime" label="补卡时间" width="100" />
              <el-table-column prop="reason" label="补卡原因" min-width="200" show-overflow-tooltip />
              <el-table-column prop="applyTime" label="申请时间" width="180" />
              <el-table-column prop="approver" label="审批人" width="100" />
              <el-table-column prop="status" label="审批状态" width="100">
                <template #default="{ row }">
                  <el-tag v-if="row.status === 0" type="warning">待审批</el-tag>
                  <el-tag v-else-if="row.status === 1" type="success">已通过</el-tag>
                  <el-tag v-else type="danger">已拒绝</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="approveRemark" label="审批意见" width="150" show-overflow-tooltip />
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" @click="handleApprove(row)" v-if="row.status === 0">
                    审批
                  </el-button>
                  <span v-else style="color: #909399; font-size: 13px">
                    {{ row.status === 1 ? '已通过' : '已拒绝' }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 打卡统计 -->
      <el-tab-pane label="打卡统计" name="statistics">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">打卡统计</span>
              <span class="card-subtitle">统计本月各人员打卡情况</span>
            </div>
          </template>
          <div class="table-container">
            <el-table :data="filteredCheckinStatsData" height="100%" width="100%">
              <el-table-column prop="userName" label="姓名" min-width="140">
                <template #default="{ row }">
                  {{ getUserDisplayName(row.userName) }}
                </template>
              </el-table-column>
              <el-table-column prop="shouldDays" label="应打卡天数" min-width="110" />
              <el-table-column prop="actualDays" label="实际出勤天数" min-width="120" />
              <el-table-column prop="fullDays" label="全勤天数" min-width="100">
                <template #default="{ row }">
                  <span style="color: #67c23a">{{ row.fullDays }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="insufficientDays" label="工时不足天数" min-width="120">
                <template #default="{ row }">
                  <span :style="{ color: row.insufficientDays > 0 ? '#f56c6c' : '#303133' }">{{ row.insufficientDays }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="absentDays" label="缺勤天数" min-width="100">
                <template #default="{ row }">
                  <span :style="{ color: row.absentDays > 0 ? '#f56c6c' : '#303133' }">{{ row.absentDays }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="missingClockCount" label="漏打卡次数" min-width="110">
                <template #default="{ row }">
                  <span :style="{ color: row.missingClockCount > 0 ? '#e6a23c' : '#303133' }">{{ row.missingClockCount }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="makeupCount" label="补卡次数" min-width="100">
                <template #default="{ row }">
                  <span :style="{ color: row.makeupCount > 0 ? '#409eff' : '#303133' }">{{ row.makeupCount }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="leaveDays" label="请假天数" min-width="100">
                <template #default="{ row }">
                  <span :style="{ color: row.leaveDays > 0 ? '#9d65c9' : '#303133' }">{{ row.leaveDays }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="avgHours" label="日均工时" min-width="100">
                <template #default="{ row }">
                  {{ row.avgHours }}h
                </template>
              </el-table-column>
              <el-table-column prop="attendanceRate" label="出勤率" min-width="100">
                <template #default="{ row }">
                  <el-tag :type="row.attendanceRate >= 95 ? 'success' : row.attendanceRate >= 80 ? 'warning' : 'danger'">
                    {{ row.attendanceRate }}%
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 补卡申请对话框 -->
    <el-dialog
      v-model="makeupDialogVisible"
      title="申请补卡"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="makeupForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="makeupForm.userName" disabled />
        </el-form-item>
        <el-form-item label="日期">
          <el-input v-model="makeupForm.date" disabled />
        </el-form-item>
        <el-form-item label="打卡类型">
          <el-radio-group v-model="makeupForm.checkinType">
            <el-radio :value="1">上班打卡</el-radio>
            <el-radio :value="2">下班打卡</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="打卡时间">
          <el-time-picker
            v-model="makeupForm.checkinTime"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择打卡时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="补卡原因">
          <el-input
            v-model="makeupForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入补卡原因"
          />
        </el-form-item>
        <el-form-item label="佐证材料">
          <el-upload
            v-model:file-list="makeupForm.files"
            action="#"
            :auto-upload="false"
            :limit="3"
            list-type="text"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div style="color: #909399; font-size: 12px; margin-top: 8px">
                最多上传3个文件，支持图片、PDF等格式
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="makeupDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitMakeup">提交申请</el-button>
      </template>
    </el-dialog>
    <!-- 审批补卡申请对话框 -->
    <el-dialog
      v-model="approveDialogVisible"
      title="审批补卡申请"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="approveForm" label-width="100px">
        <el-form-item label="申请人">
          <el-input :value="approveForm.userName" disabled />
        </el-form-item>
        <el-form-item label="补卡日期">
          <el-input :value="approveForm.date" disabled />
        </el-form-item>
        <el-form-item label="审批结果">
          <el-radio-group v-model="approveForm.status">
            <el-radio :value="1">通过</el-radio>
            <el-radio :value="2">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input
            v-model="approveForm.approveRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入审批意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitApprove">确认审批</el-button>
      </template>
    </el-dialog>
    <!-- 请假申请对话框 -->
    <el-dialog
      v-model="leaveDialogVisible"
      title="申请请假"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form :model="leaveForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="leaveForm.userName" disabled />
        </el-form-item>
        <el-form-item label="请假类型">
          <el-select v-model="leaveForm.leaveType" style="width: 100%">
            <el-option label="年假" value="年假" />
            <el-option label="事假" value="事假" />
            <el-option label="病假" value="病假" />
            <el-option label="调休" value="调休" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="leaveForm.startDate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="选择开始日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker
            v-model="leaveForm.endDate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="选择结束日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="请假原因">
          <el-input
            v-model="leaveForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入请假原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="leaveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitLeave">提交申请</el-button>
      </template>
    </el-dialog>

    <!-- 请假审批对话框 -->
    <el-dialog
      v-model="leaveApproveDialogVisible"
      title="审批请假申请"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="leaveApproveForm" label-width="100px">
        <el-form-item label="申请人">
          <el-input :value="leaveApproveForm.userName" disabled />
        </el-form-item>
        <el-form-item label="请假类型">
          <el-input :value="leaveApproveForm.leaveType" disabled />
        </el-form-item>
        <el-form-item label="请假日期">
          <el-input :value="`${leaveApproveForm.startDate} 至 ${leaveApproveForm.endDate}`" disabled />
        </el-form-item>
        <el-form-item label="审批结果">
          <el-radio-group v-model="leaveApproveForm.status">
            <el-radio :value="1">通过</el-radio>
            <el-radio :value="2">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input
            v-model="leaveApproveForm.approveRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入审批意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="leaveApproveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitLeaveApprove">确认审批</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ArrowLeft, ArrowRight, Search, Plus, ArrowDown, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getCheckinStatistics } from '@/api/checkin'
import type { CheckinStatistics, CheckinRecord } from '@/types/checkin'

defineOptions({
  name: 'CheckinStatistics'
})

// 角色配置
type RoleType = 'agency' | 'manager' | 'leader'

const roleUserList = [
  { role: 'agency' as RoleType, name: '王五', roleLabel: '中介人员', avatar: '王', userId: 3 },
  { role: 'manager' as RoleType, name: '李四', roleLabel: '项目经理', avatar: '李', userId: 2 },
  { role: 'leader' as RoleType, name: '张三', roleLabel: '审计组长', avatar: '张', userId: 1 }
]

// 用户角色映射
const userRoleMap: Record<string, string> = {
  '张三': '审计组长',
  '李四': '项目经理',
  '王五': '中介人员',
  '赵六': '中介人员',
  '孙七': '中介人员'
}

// 获取用户显示名称（姓名+角色）
const getUserDisplayName = (userName: string) => {
  const role = userRoleMap[userName]
  return role ? `${userName}（${role}）` : userName
}

const currentRole = ref<RoleType>('leader')

const currentRoleUser = computed(() => roleUserList.find(u => u.role === currentRole.value)!)

const handleSwitchRole = (role: RoleType) => {
  currentRole.value = role
}

// 搜索关键词
const searchKeyword = ref('')

// 当前激活的页签
const activeTab = ref('gantt')

// 查询参数
const queryParams = reactive({
  projectId: 1 as number | null
})

// 项目列表
const projectList = ref([
  {
    id: 1,
    name: '2026年度财务专项审计项目',
    leader: '张三',
    organization: '北京中审会计师事务所',
    manager: '李四',
    managerId: 2,
    userCount: 5
  },
  {
    id: 2,
    name: '2026年度资产负债审计项目',
    leader: '张三',
    organization: '上海正信会计师事务所',
    manager: '李四',
    managerId: 2,
    userCount: 3
  },
  {
    id: 3,
    name: '2025年度税务合规审计项目',
    leader: '张三',
    organization: '广州诚信会计师事务所',
    manager: '陈八',
    managerId: 5,
    userCount: 4
  }
])

// 根据角色过滤项目列表
const filteredProjectList = computed(() => {
  let list = projectList.value
  if (currentRole.value === 'manager') {
    // 项目经理只能看自己管理的项目
    const userId = roleUserList.find(u => u.role === 'manager')!.userId
    list = list.filter(p => p.managerId === userId)
  } else if (currentRole.value === 'agency') {
    // 中介人员只能看自己所在的项目（第1个项目）
    list = list.filter(p => p.id === 1)
  }
  // 审计组长看全部
  if (searchKeyword.value) {
    list = list.filter(p => p.name.includes(searchKeyword.value))
  }
  return list
})

// 当前选中的项目
const currentProject = computed(() => {
  return filteredProjectList.value.find(p => p.id === queryParams.projectId)
})

// 选择项目
const handleSelectProject = (projectId: number) => {
  queryParams.projectId = projectId
  currentMonth.value = new Date()
  generateMonthDates()
  handleSearch()
}

// 当前查看的月份
const currentMonth = ref(new Date())

// 当前月份文本
const currentMonthText = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth() + 1
  return `${year}年${month}月`
})

// 是否是当前月份
const isCurrentMonth = computed(() => {
  const now = new Date()
  return currentMonth.value.getFullYear() === now.getFullYear() &&
         currentMonth.value.getMonth() === now.getMonth()
})

// 统计数据
const statistics = ref<CheckinStatistics>({
  totalCount: 0,
  clockInCount: 0,
  clockOutCount: 0,
  userCount: 0,
  projectCount: 0,
  dateCount: 0,
  userStats: [],
  projectStats: [],
  dateStats: []
})

// 日期列表（当前月份的所有日期）
const dateList = ref<string[]>([])

// 甘特图数据
interface GanttUser {
  userId: number
  userName: string
  dateMap: Record<string, {
    clockIn: string
    clockOut: string
    duration: string
    hours: number
  }>
}

const ganttData = ref<GanttUser[]>([])

// 打卡记录明细数据
const tableData = ref<any[]>([])
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 补卡申请对话框
const makeupDialogVisible = ref(false)
const makeupForm = ref({
  userName: '',
  date: '',
  checkinType: 1,
  checkinTime: '',
  reason: '',
  files: []
})

// 补卡记录数据
const makeupRecords = ref([
  {
    id: 1,
    userName: '张三',
    date: '2026-03-10',
    checkinType: 1,
    checkinTime: '09:05',
    reason: '因交通堵塞导致上班打卡时间延误，手机忘记打卡',
    applyTime: '2026-03-10 18:30:00',
    approver: '李四',
    status: 1,
    approveRemark: '情况属实，同意补卡'
  },
  {
    id: 2,
    userName: '王五',
    date: '2026-03-15',
    checkinType: 2,
    checkinTime: '18:10',
    reason: '下班时手机没电，忘记打下班卡',
    applyTime: '2026-03-16 09:00:00',
    approver: '李四',
    status: 0,
    approveRemark: ''
  },
  {
    id: 3,
    userName: '赵六',
    date: '2026-03-18',
    checkinType: 1,
    checkinTime: '08:55',
    reason: '网络问题导致打卡失败',
    applyTime: '2026-03-18 12:00:00',
    approver: '李四',
    status: 2,
    approveRemark: '提交时间已超过补卡申请期限，无法审批'
  },
  {
    id: 4,
    userName: '孙七',
    date: '2026-03-20',
    checkinType: 2,
    checkinTime: '17:45',
    reason: '客户现场工作，回程时忘记打卡',
    applyTime: '2026-03-21 09:30:00',
    approver: '李四',
    status: 1,
    approveRemark: '已核实，同意补卡'
  },
  {
    id: 5,
    userName: '李四',
    date: '2026-03-25',
    checkinType: 1,
    checkinTime: '08:30',
    reason: '系统故障导致无法打卡',
    applyTime: '2026-03-25 10:00:00',
    approver: '张三',
    status: 0,
    approveRemark: ''
  },
  {
    id: 6,
    userName: '张三',
    date: '2026-04-01',
    checkinType: 2,
    checkinTime: '17:50',
    reason: '项目紧急会议，结束后忘记下班打卡',
    applyTime: '2026-04-02 08:45:00',
    approver: '李四',
    status: 0,
    approveRemark: ''
  }
])

// 审批补卡申请对话框
const approveDialogVisible = ref(false)
const approveForm = ref({
  id: 0,
  userName: '',
  date: '',
  status: 1,
  approveRemark: ''
})

const handleApprove = (row: any) => {
  approveForm.value = {
    id: row.id,
    userName: row.userName,
    date: row.date,
    status: 1,
    approveRemark: ''
  }
  approveDialogVisible.value = true
}

const handleSubmitApprove = () => {
  const idx = makeupRecords.value.findIndex(r => r.id === approveForm.value.id)
  if (idx !== -1) {
    makeupRecords.value[idx].status = approveForm.value.status
    makeupRecords.value[idx].approveRemark = approveForm.value.approveRemark
  }
  ElMessage.success(approveForm.value.status === 1 ? '已通过补卡申请' : '已拒绝补卡申请')
  approveDialogVisible.value = false
}

// 打卡统计数据
const checkinStatsData = ref([
  {
    userName: '张三',
    shouldDays: 27,
    actualDays: 25,
    fullDays: 22,
    insufficientDays: 3,
    absentDays: 2,
    missingClockCount: 3,
    makeupCount: 1,
    leaveDays: 1,
    avgHours: 8.2,
    attendanceRate: 92.6
  },
  {
    userName: '李四',
    shouldDays: 27,
    actualDays: 27,
    fullDays: 25,
    insufficientDays: 2,
    absentDays: 0,
    missingClockCount: 1,
    makeupCount: 0,
    leaveDays: 0,
    avgHours: 8.6,
    attendanceRate: 100
  },
  {
    userName: '王五',
    shouldDays: 27,
    actualDays: 24,
    fullDays: 20,
    insufficientDays: 4,
    absentDays: 1,
    missingClockCount: 5,
    makeupCount: 1,
    leaveDays: 2,
    avgHours: 7.8,
    attendanceRate: 88.9
  },
  {
    userName: '赵六',
    shouldDays: 27,
    actualDays: 26,
    fullDays: 23,
    insufficientDays: 3,
    absentDays: 1,
    missingClockCount: 2,
    makeupCount: 0,
    leaveDays: 0,
    avgHours: 8.1,
    attendanceRate: 96.3
  },
  {
    userName: '孙七',
    shouldDays: 27,
    actualDays: 26,
    fullDays: 24,
    insufficientDays: 2,
    absentDays: 1,
    missingClockCount: 1,
    makeupCount: 1,
    leaveDays: 0,
    avgHours: 8.4,
    attendanceRate: 96.3
  }
])

// 生成当前月份的所有日期
const generateMonthDates = () => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const dates: string[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    dates.push(dateStr)
  }

  dateList.value = dates
}

// 格式化日期 - 日
const formatDateDay = (date: string) => {
  return date.split('-')[2]
}

// 格式化日期 - 星期
const formatDateWeek = (date: string) => {
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const d = new Date(date)
  return '周' + weekDays[d.getDay()]
}

// 判断是否是今天
const isToday = (date: string) => {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return date === todayStr
}

// 判断是否是周末
const isWeekend = (date: string) => {
  const d = new Date(date)
  const day = d.getDay()
  return day === 0 || day === 6
}

// 上个月
const handlePrevMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1)
  generateMonthDates()
  handleSearch()
}

// 下个月
const handleNextMonth = () => {
  if (!isCurrentMonth.value) {
    currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1)
    generateMonthDates()
    handleSearch()
  }
}

// 项目切换
// const handleSwitchProject = () => {
//   // TODO: 打开项目选择对话框
//   console.log('切换项目')
// }

// 查询
const handleSearch = async () => {
  if (!queryParams.projectId) {
    return
  }

  try {
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth()
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const endDate = dateList.value[dateList.value.length - 1]

    const res = await getCheckinStatistics({
      projectId: queryParams.projectId,
      startTime: startDate,
      endTime: endDate
    })

    if (res.code === 200) {
      statistics.value = res.data
      buildGanttData(res.data)

      // 构建打卡记录明细（按人员+日期聚合，每天一行）
      const dailyRows: any[] = []
      res.data.userStats.forEach((user: any) => {
        if (!user.records) return
        const dateMap = new Map<string, { clockIn: string; clockOut: string; duration: string; hours: number }>()
        user.records.forEach((record: CheckinRecord) => {
          const recordDate = record.checkinTime.split(' ')[0]
          const time = record.checkinTime.split(' ')[1].substring(0, 5)
          if (!dateMap.has(recordDate)) {
            dateMap.set(recordDate, { clockIn: '', clockOut: '', duration: '—', hours: 0 })
          }
          const entry = dateMap.get(recordDate)!
          if (record.checkinType === 1) entry.clockIn = time
          else entry.clockOut = time
        })
        dateMap.forEach((entry, dateKey) => {
          if (entry.clockIn && entry.clockOut) {
            const [ih, im] = entry.clockIn.split(':').map(Number)
            const [oh, om] = entry.clockOut.split(':').map(Number)
            const diff = (oh * 60 + om) - (ih * 60 + im)
            entry.hours = diff / 60
            const h = Math.floor(entry.hours)
            const m = Math.round((entry.hours - h) * 60)
            entry.duration = `${h}h${m > 0 ? m + 'm' : ''}`
          }
          dailyRows.push({ userName: user.userName, date: dateKey, ...entry })
        })
      })
      dailyRows.sort((a, b) => b.date.localeCompare(a.date))
      tableData.value = dailyRows
      pagination.total = dailyRows.length
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 打卡记录明细分页加载（本地分页）
const loadTableData = () => {
  // 数据已在 handleSearch 中全量加载，分页由 el-table 的 height 控制滚动
  // 如需服务端分页，在此调用 API
}

// 构建甘特图数据
const buildGanttData = (data: CheckinStatistics) => {
  const userMap = new Map<number, GanttUser>()

  // 初始化用户数据
  data.userStats.forEach(user => {
    userMap.set(user.userId, {
      userId: user.userId,
      userName: user.userName,
      dateMap: {}
    })
  })

  // 填充打卡数据
  data.userStats.forEach((user) => {
    const ganttUser = userMap.get(user.userId)!

    if (!user.records) return

    // 按日期分组打卡记录
    const dateRecords = new Map<string, CheckinRecord[]>()
    user.records.forEach((record) => {
      const recordDate = record.checkinTime.split(' ')[0]
      if (!dateRecords.has(recordDate)) {
        dateRecords.set(recordDate, [])
      }
      dateRecords.get(recordDate)!.push(record)
    })

    // 计算每天的工时
    dateRecords.forEach((records, dateKey) => {
      const clockInRecord = records.find(r => r.checkinType === 1)
      const clockOutRecord = records.find(r => r.checkinType === 2)

      if (clockInRecord || clockOutRecord) {
        const clockIn = clockInRecord ? clockInRecord.checkinTime.split(' ')[1].substring(0, 5) : ''
        const clockOut = clockOutRecord ? clockOutRecord.checkinTime.split(' ')[1].substring(0, 5) : ''

        let duration = '-'
        let hours = 0

        if (clockIn && clockOut) {
          const [inHour, inMinute] = clockIn.split(':').map(Number)
          const [outHour, outMinute] = clockOut.split(':').map(Number)

          const inMinutes = inHour * 60 + inMinute
          const outMinutes = outHour * 60 + outMinute
          const diffMinutes = outMinutes - inMinutes

          hours = diffMinutes / 60
          const h = Math.floor(hours)
          const m = Math.round((hours - h) * 60)
          duration = `${h}h${m}m`
        }

        ganttUser.dateMap[dateKey] = {
          clockIn,
          clockOut,
          duration,
          hours
        }
      }
    })
  })

  ganttData.value = Array.from(userMap.values())
}

// 根据角色过滤甘特图数据
// userId对应关系：1=张三(审计组长), 2=李四(项目经理), 3=王五(中介), 4=赵六(中介), 5=孙七(中介)
const filteredGanttData = computed(() => {
  if (currentRole.value === 'agency') {
    // 中介人员只看自己
    const userId = roleUserList.find(u => u.role === 'agency')!.userId
    return ganttData.value.filter(u => u.userId === userId)
  } else if (currentRole.value === 'manager') {
    // 项目经理看自己和中介人员（排除审计组长）
    return ganttData.value.filter(u => u.userId !== 1)
  }
  // 审计组长看全部
  return ganttData.value
})

// 根据角色过滤打卡记录明细数据
const filteredTableData = computed(() => {
  if (currentRole.value === 'agency') {
    return tableData.value.filter(u => u.userName === '王五')
  } else if (currentRole.value === 'manager') {
    return tableData.value.filter(u => u.userName !== '张三')
  }
  return tableData.value
})

// 根据角色过滤请假记录
const filteredLeaveRecords = computed(() => {
  if (currentRole.value === 'agency') {
    return leaveRecords.value.filter(r => r.userName === '王五')
  }
  return leaveRecords.value
})

// 根据角色过滤补卡记录
const filteredMakeupRecords = computed(() => {
  if (currentRole.value === 'agency') {
    return makeupRecords.value.filter(r => r.userName === '王五')
  }
  return makeupRecords.value
})

// 根据角色过滤打卡统计数据
const filteredCheckinStatsData = computed(() => {
  if (currentRole.value === 'agency') {
    return checkinStatsData.value.filter(u => u.userName === '王五')
  } else if (currentRole.value === 'manager') {
    return checkinStatsData.value.filter(u => u.userName !== '张三')
  }
  return checkinStatsData.value
})
const getBarClass = (data: any) => {
  if (!data.clockIn || !data.clockOut) {
    return 'bar-incomplete'
  }

  if (data.hours >= 10) {
    return 'bar-overtime'
  } else if (data.hours >= 8) {
    return 'bar-normal'
  } else {
    return 'bar-insufficient'
  }
}

// 打开补卡申请对话框
const handleMakeupCheckin = (user: GanttUser, date: string) => {
  makeupForm.value = {
    userName: user.userName,
    date: date,
    checkinType: 1,
    checkinTime: '',
    reason: '',
    files: []
  }

  // 判断缺少哪种打卡类型
  const dateData = user.dateMap[date]
  if (dateData) {
    if (!dateData.clockIn) {
      makeupForm.value.checkinType = 1 // 缺少上班打卡
    } else if (!dateData.clockOut) {
      makeupForm.value.checkinType = 2 // 缺少下班打卡
    }
  }

  makeupDialogVisible.value = true
}

// 提交补卡申请
const handleSubmitMakeup = () => {
  // 验证表单
  if (!makeupForm.value.checkinTime) {
    ElMessage.warning('请选择打卡时间')
    return
  }
  if (!makeupForm.value.reason) {
    ElMessage.warning('请输入补卡原因')
    return
  }
  if (makeupForm.value.files.length === 0) {
    ElMessage.warning('请上传佐证材料')
    return
  }

  // 这里应该调用API提交补卡申请
  // 暂时使用模拟提交
  ElMessage.success('补卡申请已提交，等待审批')
  makeupDialogVisible.value = false
}

// 现场打卡（header 按钮，当前用户今日打卡）
const handleCheckinToday = () => {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  ElMessage.success(`${currentRoleUser.value.name} 在 ${todayStr} 现场打卡成功`)
}

// 请假类型标签颜色映射
const leaveTypeTagMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  年假: 'success',
  事假: 'warning',
  病假: 'danger',
  调休: 'info',
  其他: 'info'
}

// 请假记录数据
const leaveRecords = ref([
  {
    id: 1,
    userName: '张三',
    userId: 1,
    leaveType: '年假',
    startDate: '2026-04-03',
    endDate: '2026-04-03',
    days: 1,
    reason: '个人年假安排',
    applyTime: '2026-04-02 16:00:00',
    approver: '李四',
    status: 1,
    approveRemark: '同意'
  },
  {
    id: 2,
    userName: '王五',
    userId: 3,
    leaveType: '病假',
    startDate: '2026-04-01',
    endDate: '2026-04-02',
    days: 2,
    reason: '发烧感冒，医院就诊',
    applyTime: '2026-04-01 08:30:00',
    approver: '李四',
    status: 1,
    approveRemark: '同意，注意休息'
  },
  {
    id: 3,
    userName: '赵六',
    userId: 4,
    leaveType: '事假',
    startDate: '2026-04-10',
    endDate: '2026-04-10',
    days: 1,
    reason: '家中有急事需要处理',
    applyTime: '2026-04-09 18:00:00',
    approver: '李四',
    status: 0,
    approveRemark: ''
  }
])

// 请假申请对话框
const leaveDialogVisible = ref(false)
const leaveForm = ref({
  userName: '李四',
  leaveType: '年假',
  startDate: '',
  endDate: '',
  reason: ''
})

// 请假审批对话框
const leaveApproveDialogVisible = ref(false)
const leaveApproveForm = ref({
  id: 0,
  userName: '',
  leaveType: '',
  startDate: '',
  endDate: '',
  status: 1,
  approveRemark: ''
})

const handleApplyLeave = () => {
  leaveForm.value = {
    userName: currentRoleUser.value.name,
    leaveType: '年假',
    startDate: '',
    endDate: '',
    reason: ''
  }
  leaveDialogVisible.value = true
}

const handleSubmitLeave = () => {
  if (!leaveForm.value.startDate || !leaveForm.value.endDate) {
    ElMessage.warning('请选择请假日期')
    return
  }
  if (!leaveForm.value.reason) {
    ElMessage.warning('请填写请假原因')
    return
  }
  const start = new Date(leaveForm.value.startDate)
  const end = new Date(leaveForm.value.endDate)
  const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
  leaveRecords.value.push({
    id: leaveRecords.value.length + 1,
    userName: leaveForm.value.userName,
    userId: currentRoleUser.value.userId,
    leaveType: leaveForm.value.leaveType,
    startDate: leaveForm.value.startDate,
    endDate: leaveForm.value.endDate,
    days,
    reason: leaveForm.value.reason,
    applyTime: new Date().toLocaleString('zh-CN'),
    approver: '张三',
    status: 0,
    approveRemark: ''
  })
  ElMessage.success('请假申请已提交，等待审批')
  leaveDialogVisible.value = false
}

const handleApproveLeave = (row: any) => {
  leaveApproveForm.value = {
    id: row.id,
    userName: row.userName,
    leaveType: row.leaveType,
    startDate: row.startDate,
    endDate: row.endDate,
    status: 1,
    approveRemark: ''
  }
  leaveApproveDialogVisible.value = true
}

const handleSubmitLeaveApprove = () => {
  const idx = leaveRecords.value.findIndex(r => r.id === leaveApproveForm.value.id)
  if (idx !== -1) {
    leaveRecords.value[idx].status = leaveApproveForm.value.status
    leaveRecords.value[idx].approveRemark = leaveApproveForm.value.approveRemark
  }
  ElMessage.success(leaveApproveForm.value.status === 1 ? '已通过请假申请' : '已拒绝请假申请')
  leaveApproveDialogVisible.value = false
}

// 判断某用户某日期是否在请假中（审批通过）
const isOnLeave = (userId: number, date: string) => {
  return leaveRecords.value.some(r =>
    r.userId === userId &&
    r.status === 1 &&
    date >= r.startDate &&
    date <= r.endDate
  )
}

// 获取请假类型
const getLeaveType = (userId: number, date: string) => {
  const record = leaveRecords.value.find(r =>
    r.userId === userId &&
    r.status === 1 &&
    date >= r.startDate &&
    date <= r.endDate
  )
  return record?.leaveType || ''
}

onMounted(() => {
  // 默认选择第一个项目（最新正在实施的项目）
  if (filteredProjectList.value.length > 0) {
    queryParams.projectId = filteredProjectList.value[0].id
  }
  generateMonthDates()
  handleSearch()
})
</script>

<style scoped lang="scss">
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;

  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }
}

.header-right-area {
  display: flex;
  align-items: center;
  gap: 16px;
}

.role-switcher {
  .role-trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 12px;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    background: #fff;

    &:hover {
      border-color: #409eff;
      background: #f5f7fa;
    }

    .role-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #409eff, #53a8ff);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .role-info {
      display: flex;
      flex-direction: column;
      line-height: 1.3;

      .role-name {
        font-size: 13px;
        font-weight: 500;
        color: #303133;
      }

      .role-tag {
        font-size: 11px;
        color: #909399;
      }
    }

    .role-arrow {
      font-size: 12px;
      color: #909399;
      margin-left: 2px;
    }
  }
}

.role-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
  min-width: 160px;

  .role-menu-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #409eff, #53a8ff);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .role-menu-name {
    font-size: 13px;
    color: #303133;
    font-weight: 500;
  }

  .role-menu-label {
    font-size: 11px;
    color: #909399;
  }

  .role-check {
    margin-left: auto;
    color: #409eff;
    font-size: 14px;
  }
}

:deep(.is-active-role) {
  background: #ecf5ff;
}

.project-info-banner {
  flex-shrink: 0;
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 16px 20px;
  }

  .banner-content {
    display: flex;
    align-items: center;
    gap: 24px;

    .banner-name {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
      flex-shrink: 0;
    }

    .banner-divider {
      width: 1px;
      height: 20px;
      background: #dcdfe6;
      flex-shrink: 0;
    }

    .banner-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      flex-shrink: 0;

      .banner-icon {
        font-size: 15px;
        color: var(--el-color-primary);
        flex-shrink: 0;
      }

      .banner-label {
        color: #909399;
      }

      .banner-value {
        color: #606266;
        font-weight: 500;
      }
    }
  }
}


.project-cards-wrapper {
  flex-shrink: 0;
  height: 120px;
  overflow: hidden;

  .project-cards {
    display: flex;
    gap: 16px;
    padding: 4px;

    .project-card {
      flex-shrink: 0;
      width: 380px;
      border: 2px solid #e4e7ed;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
      }

      &.active {
        border-color: #409eff;
        background: #ecf5ff;
      }

      :deep(.el-card__body) {
        padding: 16px;
      }

      .project-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #ebeef5;

        .project-name {
          font-size: 15px;
          font-weight: 600;
          color: #303133;
          margin: 0;
        }

        .project-leader {
          font-size: 13px;
          color: #606266;
        }
      }

      .project-card-body {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .project-info-item {
          display: flex;
          font-size: 13px;
          line-height: 1.8;

          .label {
            color: #909399;
            margin-right: 8px;
          }

          .value {
            color: #606266;
          }
        }

        .project-info-row {
          display: flex;
          gap: 24px;
          margin-top: 4px;
        }
      }
    }
  }
}

.content-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }

  :deep(.el-tabs__content) {
    flex: 1;
    overflow: hidden;
  }

  :deep(.el-tab-pane) {
    height: 100%;
  }
}

.filter-card {
  flex-shrink: 0;
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 12px 20px;
  }

  .filter-form-content {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;

    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }
}

.filter-card {
  flex-shrink: 0;
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;
  margin-bottom: 16px;

  :deep(.el-card__body) {
    padding: 12px 20px;
  }

  .filter-form-content {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;

    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }
}

.project-info-card {
  flex-shrink: 0;
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;
  position: relative;

  :deep(.el-card__body) {
    padding: 16px 20px;
  }

  .project-info-content {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .info-row {
      display: flex;
      gap: 32px;
      align-items: center;

      .info-item {
        display: flex;
        align-items: center;
        font-size: 14px;

        .info-label {
          color: #909399;
          margin-right: 8px;
        }

        .info-value {
          color: #303133;
          font-weight: 500;
        }
      }
    }
  }

  .project-switch {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
  }
}

.statistics-cards {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  .stat-card {
    border: none !important;
    box-shadow: none !important;
    border-radius: 12px;

    :deep(.el-card__body) {
      padding: 20px;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #303133;
          line-height: 1.2;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
}

.gantt-card {
  flex: 1;
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
  }

  :deep(.el-card__body) {
    padding: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .card-title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        flex-shrink: 0;
      }

      .legend-list {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;

        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #606266;

          .legend-dot {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 3px;
            flex-shrink: 0;

            &.dot-normal { background: #67c23a; }
            &.dot-overtime { background: #e6a23c; }
            &.dot-insufficient { background: #f56c6c; }
            &.dot-incomplete { background: #c0c4cc; }
            &.dot-leave { background: #9d65c9; }
            &.dot-weekend { background: #ebeef5; border: 1px solid #dcdfe6; }
          }
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;

      .current-month {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        min-width: 80px;
        text-align: center;
      }
    }
  }

  .gantt-container {
    flex: 1;
    overflow: hidden;
    padding: 20px;

    .el-scrollbar {
      height: 100%;
    }

    .gantt-wrapper {
      min-width: 100%;
    }

    .gantt-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;

      thead {
        position: sticky;
        top: 0;
        z-index: 10;
        background: #fff;

        tr {
          th {
            padding: 10px 8px;
            text-align: center;
            font-weight: 500;
            color: #303133;
            border: 1px solid #ebeef5;
            background: #fafafa;
            font-size: 13px;

            &.name-column {
              width: 140px;
              min-width: 140px;
              position: sticky;
              left: 0;
              z-index: 11;
              background: #fafafa;
            }

            &.date-column {
              width: 44px;
              min-width: 44px;
              padding: 8px 4px;

              &.is-today {
                position: relative;

                .date-header {
                  border: 2px solid #1890ff;
                  border-radius: 4px;
                  padding: 4px 0;

                  .date-day {
                    color: #1890ff;
                    font-weight: 600;
                  }
                }
              }

              &.is-weekend {
                background: #fafafa;
              }

              .date-header {
                display: flex;
                flex-direction: column;
                gap: 2px;

                .date-day {
                  font-size: 13px;
                  font-weight: 500;
                  color: #303133;
                }

                .date-week {
                  font-size: 11px;
                  color: #909399;
                }
              }
            }
          }
        }
      }

      tbody {
        tr {
          &:hover {
            background: #f5f7fa;
          }

          td {
            padding: 4px 4px;
            text-align: center;
            border: 1px solid #ebeef5;

            &.name-cell {
              font-weight: 500;
              color: #303133;
              position: sticky;
              left: 0;
              z-index: 9;
              background: #fff;
              font-size: 13px;
            }

            &.date-cell {
              padding: 4px 6px;
              vertical-align: middle;

              &.is-today {
                background: #f0f9ff;
              }

              &.is-weekend {
                background: #fafafa;
              }

              .status-block {
                width: 28px;
                height: 28px;
                border-radius: 4px;
                margin: 0 auto;
                cursor: pointer;
                transition: transform 0.15s, box-shadow 0.15s;

                &:hover {
                  transform: scale(1.15);
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                }

                &.bar-normal { background: #67c23a; }
                &.bar-overtime { background: #e6a23c; }
                &.bar-insufficient { background: #f56c6c; }
                &.bar-incomplete { background: #c0c4cc; }
                &.block-leave { background: #9d65c9; }
                &.block-weekend {
                  background: #ebeef5;
                  border: 1px solid #dcdfe6;
                  cursor: default;
                  &:hover { transform: none; box-shadow: none; }
                }
              }

            }
          }
        }
      }
    }
  }
}

.data-card {
  flex: 1;
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  :deep(.el-card__body) {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .card-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }

    .card-subtitle {
      font-size: 13px;
      color: #909399;
      margin-left: 12px;
    }
  }

  .table-container {
    flex: 1;
    overflow: hidden;
  }

  .el-pagination {
    flex-shrink: 0;
    margin-top: 16px;
    justify-content: flex-end;
  }
}

.tooltip-content {
  div {
    line-height: 1.8;
  }
}
</style>
