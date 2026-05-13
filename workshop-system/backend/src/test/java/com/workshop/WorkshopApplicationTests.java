package com.workshop;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class WorkshopApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static String adminToken;
    private static String prodToken;
    private static Long scanRecordId;

    // ==================== Auth 模块 (8 tests) ====================

    @Test
    @Order(1)
    void loginSuccess() throws Exception {
        String body = "{\"username\":\"admin\",\"password\":\"admin123\"}";
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.username").value("admin"))
                .andReturn();
        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        adminToken = node.get("data").get("token").asText();
        assertNotNull(adminToken);
    }

    @Test
    @Order(2)
    void loginWrongPassword() throws Exception {
        String body = "{\"username\":\"admin\",\"password\":\"wrongpassword\"}";
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    @Order(3)
    void loginDisabledUser() throws Exception {
        String body = "{\"username\":\"disabled_user\",\"password\":\"admin123\"}";
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    @Order(4)
    void loginNonexistentUser() throws Exception {
        String body = "{\"username\":\"noone\",\"password\":\"admin123\"}";
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    @Order(5)
    void getUserInfo() throws Exception {
        mockMvc.perform(get("/api/auth/userinfo")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.username").value("admin"));
    }

    @Test
    @Order(6)
    void getUserInfoNoToken() throws Exception {
        mockMvc.perform(get("/api/auth/userinfo"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(7)
    void changePassword() throws Exception {
        String body = "{\"oldPassword\":\"admin123\",\"newPassword\":\"newpass123\"}";
        mockMvc.perform(put("/api/auth/password")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(8)
    void changePasswordWrongOld() throws Exception {
        String body = "{\"oldPassword\":\"wrongold\",\"newPassword\":\"newpass123\"}";
        mockMvc.perform(put("/api/auth/password")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
    }

    // ==================== 用户管理 (6 tests) ====================

    @Test
    @Order(10)
    void getUserPage() throws Exception {
        mockMvc.perform(get("/api/users/page?page=1&pageSize=10")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records").isArray())
                .andExpect(jsonPath("$.data.total").value(greaterThanOrEqualTo(5)));
    }

    @Test
    @Order(11)
    void getUserById() throws Exception {
        mockMvc.perform(get("/api/users/1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.username").value("admin"));
    }

    @Test
    @Order(12)
    void createUser() throws Exception {
        String body = "{\"username\":\"testuser\",\"password\":\"test123\",\"realName\":\"测试用户\",\"phone\":\"13900000000\",\"deptId\":1,\"roleIds\":\"2\"}";
        mockMvc.perform(post("/api/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(13)
    void updateUser() throws Exception {
        // 使用 seed data 中的 enabled_user(id=5, disabled) 来做更新测试
        String body = "{\"realName\":\"disabled_updated\"}";
        mockMvc.perform(put("/api/users/5")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(14)
    void updateUserStatus() throws Exception {
        mockMvc.perform(put("/api/users/5/status?status=0")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(15)
    void deleteUser() throws Exception {
        // 删除刚创建的 testuser (id=6, 因为 seed 有5个用户)
        mockMvc.perform(delete("/api/users/6")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    // ==================== 部门管理 (4 tests) ====================

    @Test
    @Order(20)
    void getDeptTree() throws Exception {
        mockMvc.perform(get("/api/depts/tree")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(5));
    }

    @Test
    @Order(21)
    void createDept() throws Exception {
        String body = "{\"deptName\":\"测试部门\",\"deptCode\":\"DEPT_TEST\",\"parentId\":1,\"sortOrder\":10}";
        mockMvc.perform(post("/api/depts")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(22)
    void updateDept() throws Exception {
        // 更新 management dept (id=1)
        String body = "{\"deptName\":\"管理部_v2\",\"deptCode\":\"DEPT_ADMIN\",\"parentId\":0,\"sortOrder\":1}";
        mockMvc.perform(put("/api/depts/1")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(23)
    void deleteDept() throws Exception {
        // 删除刚创建的测试部门 (id=6, seed有5个)
        mockMvc.perform(delete("/api/depts/6")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    // ==================== 角色管理 (4 tests) ====================

    @Test
    @Order(30)
    void getRoleList() throws Exception {
        mockMvc.perform(get("/api/roles/list")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(4));
    }

    @Test
    @Order(31)
    void createRole() throws Exception {
        String body = "{\"roleName\":\"测试角色\",\"roleCode\":\"TEST_ROLE\",\"description\":\"测试用角色\"}";
        mockMvc.perform(post("/api/roles")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(32)
    void updateRole() throws Exception {
        // 更新 sales role (id=2)
        String body = "{\"roleName\":\"销售人员_v2\",\"roleCode\":\"SALES\",\"description\":\"updated\"}";
        mockMvc.perform(put("/api/roles/2")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(33)
    void deleteRole() throws Exception {
        // 删除刚创建的测试角色 (id=5, seed 有4个)
        mockMvc.perform(delete("/api/roles/5")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    // ==================== 订单管理 (6 tests) ====================

    @Test
    @Order(40)
    void getOrderPage() throws Exception {
        mockMvc.perform(get("/api/orders/page?page=1&pageSize=10")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records").isArray())
                .andExpect(jsonPath("$.data.total").value(3));
    }

    @Test
    @Order(41)
    void getOrderDetail() throws Exception {
        mockMvc.perform(get("/api/orders/1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.order.orderNo").value("ORD-2026-001"));
    }

    @Test
    @Order(42)
    void createOrder() throws Exception {
        String body = "{\"customerName\":\"测试客户\",\"customerContact\":\"联系人\",\"customerPhone\":\"13800000000\",\"orderDate\":\"2026-05-13T00:00:00\",\"deliveryDate\":\"2026-12-31T00:00:00\"}";
        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(43)
    void updateOrder() throws Exception {
        // 更新已完成订单 (id=3)
        String body = "{\"customerName\":\"已完成订单_v2\"}";
        mockMvc.perform(put("/api/orders/3")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(44)
    void updateOrderStatus() throws Exception {
        mockMvc.perform(put("/api/orders/2/status?status=2")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(45)
    void deleteOrder() throws Exception {
        // 删除刚创建的订单 (id=4, seed有3个)
        mockMvc.perform(delete("/api/orders/4")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    // ==================== 订单明细管理 (4 tests) ====================

    @Test
    @Order(50)
    void getOrderItems() throws Exception {
        mockMvc.perform(get("/api/orders/1/items")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    @Order(51)
    void createOrderItem() throws Exception {
        String body = "{\"productId\":3,\"quantity\":3,\"unitPrice\":2000.00,\"subtotal\":6000.00}";
        mockMvc.perform(post("/api/orders/1/items")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(52)
    void updateOrderItem() throws Exception {
        // 更新 order_item id=2
        String body = "{\"quantity\":8,\"unitPrice\":3000.00,\"subtotal\":24000.00}";
        mockMvc.perform(put("/api/orders/1/items/2")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(53)
    void deleteOrderItem() throws Exception {
        // 删除刚创建的 order_item (id=3, seed有2个)
        mockMvc.perform(delete("/api/orders/1/items/3")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    // ==================== 订单附件管理 (3 tests) ====================

    @Test
    @Order(54)
    void getOrderFiles() throws Exception {
        mockMvc.perform(get("/api/orders/1/files")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @Order(55)
    void uploadOrderFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.txt", MediaType.TEXT_PLAIN_VALUE, "Hello, World!".getBytes());
        mockMvc.perform(multipart("/api/orders/1/files")
                        .file(file)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(56)
    void deleteOrderFile() throws Exception {
        // 删除 seed data 的 order_file id=1
        mockMvc.perform(delete("/api/orders/1/files/1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    // ==================== 产品管理 (6 tests) ====================

    @Test
    @Order(60)
    void getProductPage() throws Exception {
        mockMvc.perform(get("/api/products/page?page=1&pageSize=10")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records").isArray())
                .andExpect(jsonPath("$.data.total").value(4));
    }

    @Test
    @Order(61)
    void getProductById() throws Exception {
        mockMvc.perform(get("/api/products/1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.productCode").value("BEAM001"));
    }

    @Test
    @Order(62)
    void createProduct() throws Exception {
        String body = "{\"productCode\":\"BEAM_TEST\",\"productName\":\"测试产品\",\"productType\":\"箱梁\",\"specification\":\"10m×1m×1m\",\"status\":1}";
        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(63)
    void updateProduct() throws Exception {
        // 更新 disabled product (id=4, status=0)
        String body = "{\"productName\":\"停用产品_v2\"}";
        mockMvc.perform(put("/api/products/4")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(64)
    void updateProductStatus() throws Exception {
        mockMvc.perform(put("/api/products/4/status?status=0")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(65)
    void deleteProduct() throws Exception {
        // 删除刚创建的产品 (id=5, seed有4个)
        mockMvc.perform(delete("/api/products/5")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    // ==================== 生产环节管理 (4 tests) ====================

    @Test
    @Order(70)
    void getStageList() throws Exception {
        mockMvc.perform(get("/api/stages/list")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(7));
    }

    @Test
    @Order(71)
    void createStage() throws Exception {
        String body = "{\"stageCode\":\"STAGE_TEST\",\"stageName\":\"测试环节\",\"stageSeq\":9,\"description\":\"测试\",\"needQc\":1,\"needPhoto\":1,\"estimatedHours\":1.0,\"status\":1}";
        mockMvc.perform(post("/api/stages")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(72)
    void updateStage() throws Exception {
        // 更新 disabled stage (id=8)
        String body = "{\"stageName\":\"停用环节_v2\"}";
        mockMvc.perform(put("/api/stages/8")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(73)
    void deleteStage() throws Exception {
        // 删除刚创建的 stage (id=9, seed有8个)
        mockMvc.perform(delete("/api/stages/9")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    // ==================== 生产流转记录 (7 tests) ====================

    @Test
    @Order(80)
    void loginAsProd() throws Exception {
        String body = "{\"username\":\"prod01\",\"password\":\"admin123\"}";
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andReturn();
        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        prodToken = node.get("data").get("token").asText();
        assertNotNull(prodToken);
    }

    @Test
    @Order(81)
    void scanQrCode() throws Exception {
        String body = "{\"qrContent\":\"ORD-2026-001-BEAM002-20260101-0003\",\"stageId\":1,\"location\":\"A区-1号工位\"}";
        MvcResult result = mockMvc.perform(post("/api/records/scan")
                        .header("Authorization", "Bearer " + prodToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andReturn();
        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        scanRecordId = node.get("data").get("id").asLong();
        assertNotNull(scanRecordId);
    }

    @Test
    @Order(82)
    void scanDuplicateQrCode() throws Exception {
        String body = "{\"qrContent\":\"ORD-2026-001-BEAM002-20260101-0003\",\"stageId\":1}";
        mockMvc.perform(post("/api/records/scan")
                        .header("Authorization", "Bearer " + prodToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    @Order(83)
    void getRecordPage() throws Exception {
        mockMvc.perform(get("/api/records/page?page=1&pageSize=10")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records").isArray())
                .andExpect(jsonPath("$.data.total").value(greaterThanOrEqualTo(3)));
    }

    @Test
    @Order(84)
    void getRecordsByQrCode() throws Exception {
        mockMvc.perform(get("/api/records/by-qrcode/3")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @Order(85)
    void getRecordsByOrder() throws Exception {
        mockMvc.perform(get("/api/records/by-order/1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @Order(86)
    void updateRecordQc() throws Exception {
        String body = "{\"qcResult\":1,\"qcRemark\":\"质检合格\"}";
        mockMvc.perform(put("/api/records/" + scanRecordId + "/qc")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    // ==================== 二维码管理 (5 tests) ====================

    @Test
    @Order(90)
    void getQrCodePage() throws Exception {
        mockMvc.perform(get("/api/qrcode/page?page=1&pageSize=10")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records").isArray())
                .andExpect(jsonPath("$.data.total").value(4));
    }

    @Test
    @Order(91)
    void getQrCodeById() throws Exception {
        mockMvc.perform(get("/api/qrcode/1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(92)
    void getQrCodeImageNotFound() throws Exception {
        mockMvc.perform(get("/api/qrcode/1/image")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(93)
    void decodeQrCode() throws Exception {
        String body = "{\"qrContent\":\"ORD-2026-001-BEAM001-20260101-0001\"}";
        mockMvc.perform(post("/api/qrcode/decode")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.orderNo").value("ORD-2026-001"))
                .andExpect(jsonPath("$.data.productName").isNotEmpty());
    }

    @Test
    @Order(94)
    void generateQrCode() throws Exception {
        String body = "{\"orderItemId\":2,\"quantity\":1}";
        mockMvc.perform(post("/api/qrcode/generate")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    // ==================== 仪表盘 (1 test) ====================

    @Test
    @Order(100)
    void dashboardOverview() throws Exception {
        mockMvc.perform(get("/api/dashboard/overview")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.todayScans").isNumber())
                .andExpect(jsonPath("$.data.inProductionOrders").isNumber())
                .andExpect(jsonPath("$.data.completedThisMonth").isNumber())
                .andExpect(jsonPath("$.data.wipCount").isNumber())
                .andExpect(jsonPath("$.data.stageDistribution").isArray())
                .andExpect(jsonPath("$.data.trend").isArray())
                .andExpect(jsonPath("$.data.trend.length()").value(7));
    }
}
