# Microcopy library — comprehensive VN table

Single source of truth for Lingona's microcopy. Every button, toast, error, label, placeholder, empty state. Apply consistently across surface.

When component needs new copy → search this file first. KHÔNG invent random.

## Buttons

### Primary actions

| Context | ✅ VN copy | ❌ Anti |
|---------|-----------|--------|
| Start primary | "Bắt đầu luyện" | "Get Started" / "Start Now" |
| Submit form | "Lưu" / "Cập nhật" | "Save" / "Submit" |
| Submit answer | "Nộp bài" | "Submit Answer" |
| Submit Speaking | "Nộp bài ⚔️" (codebase verified) | "Finish Speaking" |
| Continue | "Tiếp tục" | "Continue" / "Next" |
| Try again | "Luyện tiếp" | "Try Again" / "Retry" |
| Practice now | "Luyện ngay" | "Practice Now" |
| Battle queue | "Vào trận" / "Tìm đối thủ" | "Find Match" / "Queue Up" |
| Battle again | "Đấu nữa" | "Play Again" |
| View history | "Xem lịch sử" | "View History" |
| View detail | "Xem chi tiết" | "View Detail" |
| Edit | "Chỉnh sửa" | "Edit" |
| Delete | "Xóa" | "Delete" / "Remove" |
| Confirm delete | "XÓA" (typed-confirm pattern) | (locked) |
| Logout | "Đăng xuất" | "Logout" / "Sign Out" |
| Login | "Đăng nhập" | "Sign In" / "Log In" |
| Register | "Đăng ký" / "Tạo tài khoản" | "Sign Up" / "Register" |
| Pro upgrade | "Nâng cấp lên Pro" | "Upgrade to Pro" |
| View Pro | "Xem gói Pro" | "See Plans" |

### Secondary actions

| Context | ✅ VN | ❌ Anti |
|---------|------|--------|
| Cancel | "Hủy" | "Cancel" |
| Skip | "Bỏ qua" | "Skip" |
| Back | "Quay lại" | "Back" |
| Close | "Đóng" | "Close" |
| Pause | "Tạm dừng" | "Pause" |
| Resume | "Tiếp tục" | "Resume" |
| Save draft | "Lưu nháp" | "Save Draft" |
| Discard | "Bỏ" | "Discard" |
| Reset | "Đặt lại" | "Reset" |
| Refresh | "Làm mới" | "Refresh" |
| Show more | "Xem thêm" | "Show More" |
| Show less | "Thu gọn" | "Show Less" |
| Copy | "Sao chép" | "Copy" |
| Share | "Chia sẻ" | "Share" |

### Loading state buttons

| Context | ✅ VN |
|---------|------|
| Submitting | "Đang nộp..." |
| Saving | "Đang lưu..." |
| Loading | "Đang tải..." |
| Sending | "Đang gửi..." |
| Processing | "Đang xử lý..." |
| Connecting | "Đang kết nối..." |
| Verifying | "Đang xác minh..." |

Format: present-continuous + 3 dots. KHÔNG "Vui lòng đợi" (corporate).

## Form labels

### Auth forms

| Field | ✅ VN |
|-------|------|
| Email | "Email" (untranslated — common Vietnamese) |
| Password | "Mật khẩu" |
| Confirm password | "Nhập lại mật khẩu" |
| Username | "Username" (untranslated — gaming convention) |
| Display name | "Tên hiển thị" |
| Full name | "Họ tên" |
| Forgot password | "Quên mật khẩu?" |
| Already have account | "Đã có tài khoản?" |
| Don't have account | "Chưa có tài khoản?" |
| Sign in with Google | "Đăng nhập bằng Google" |
| Sign up with Google | "Đăng ký bằng Google" |
| Continue without login | "Tiếp tục không đăng nhập" |
| Welcome back | "Chào mừng trở lại" |
| Create account | "Tạo tài khoản" |

### Profile / Settings forms

| Field | ✅ VN |
|-------|------|
| Bio / About | "Giới thiệu" / "Bio" |
| Avatar | "Ảnh đại diện" |
| Change email | "Đổi email" |
| Change password | "Đổi mật khẩu" |
| Current password | "Mật khẩu hiện tại" |
| New password | "Mật khẩu mới" |
| Notifications | "Thông báo" |
| Language | "Ngôn ngữ" |
| Theme | "Giao diện" |
| Light mode | "Sáng" |
| Dark mode | "Tối" |
| System | "Hệ thống" |
| Font size | "Cỡ chữ" |
| Small | "Nhỏ" |
| Medium | "Vừa" |
| Large | "Lớn" |

### Onboarding forms

| Field | ✅ VN |
|-------|------|
| Current band question | "Bạn đang ở Band IELTS nào?" |
| Target band question | "Bạn muốn đạt Band IELTS mấy?" |
| Don't know | "Chưa biết" |
| Daily time available | "Mỗi ngày bạn có khoảng bao lâu?" |
| Goal date | "Ngày thi dự kiến" |
| Daily XP goal | "Mục tiêu XP / ngày" |
| Most learners aim | "Hầu hết học viên đặt mục tiêu 6.5+" |
| Continue button onboarding | "Tiếp tục" |
| Skip onboarding | "Bỏ qua →" |
| Begin improving | "Bắt đầu cải thiện →" |

## Placeholders

| Field type | ✅ VN placeholder |
|-----------|------------------|
| Email input | "you@example.com" (English convention OK for email format) |
| Password input | "Min. 8 characters" / "Mật khẩu (≥8 ký tự)" |
| Username | "@username" |
| Search | "Tìm kiếm..." |
| Bio | "Vài dòng về bạn..." |
| Notes (Speaking prep) | "Ghi chú nhanh trước khi nói (60s)..." |
| Writing essay | "Bắt đầu viết câu trả lời của bạn..." |
| Writing draft | "Bắt đầu viết nháp..." |
| Friend chat | "Nhắn với bạn..." |
| Comment | "Để lại bình luận..." |

KHÔNG English placeholder ("Type here", "Enter your email") trong brand mode. Cambridge mode = English (per ielts-authentic).

## Toast notifications

### Success toasts

| Action | ✅ VN |
|--------|------|
| Save success | "Đã lưu" |
| Update success | "Đã cập nhật" |
| Delete success | "Đã xóa" |
| Submit success | "Đã nộp bài" |
| Friend request sent | "Đã gửi lời mời tới {username}" |
| Friend request accepted | "Đã thêm {username} làm bạn" |
| Achievement unlocked | "Mở khóa {achievement}" |
| Battle won | "VICTORY +{LP} LP" |
| Streak saved | "Streak {N} ngày — vững!" |
| Email verified | "Email đã xác minh" |
| Password changed | "Đã đổi mật khẩu" |
| Copied to clipboard | "Đã sao chép" |

### Error toasts

| Error | ✅ VN |
|-------|------|
| Generic | "Có lỗi xảy ra. Thử lại nhé." |
| Network error | "Không kết nối được. Kiểm tra mạng nhé." |
| Timeout | "Mạng yếu. Đợi tí rồi thử lại." |
| Auth failed | "Email hoặc mật khẩu sai" |
| Email exists | "Email đã có người dùng" |
| Username taken | "Username đã có người dùng" |
| Invalid input | "Thông tin chưa đúng" |
| Permission denied | "Bạn không có quyền truy cập" |
| Rate limit | "Bạn thao tác quá nhanh. Đợi vài giây nhé." |
| File too large | "File quá lớn. Tối đa {N}MB" |
| Failed to upload | "Tải lên thất bại. Thử lại nhé." |
| Speaking failed | "Không kết nối tới AI. Thử lại nhé." |
| Whisper error | "Không nhận diện được giọng. Thử lại nhé." |
| Daily limit hit | "Hôm nay đã luyện Speaking rồi — quay lại mai nhé" |

### Info toasts

| Info | ✅ VN |
|------|------|
| Session expiring | "Phiên đăng nhập sắp hết — đăng nhập lại nhé" |
| New version available | "Có bản cập nhật mới. Refresh để dùng" |
| Battle invite | "{username} mời bạn đấu" |
| Friend online | "{username} đang online" |

## Empty states

| Where | ✅ VN |
|-------|------|
| No results yet | "Chưa có kết quả nào. Luyện 1 bài để xem feedback." |
| No friends | "Chưa có bạn nào. Mời bạn qua link nhé 🐙" |
| No battles played | "Chưa có trận nào. Vào trận đầu tiên đi" |
| No achievements | "Chưa unlock badge nào. Luyện đi để mở" |
| No notifications | "Không có thông báo mới" |
| No messages | "Chưa có tin nhắn" |
| Empty search | "Không tìm thấy kết quả cho \"{query}\"" |
| No history | "Lịch sử trống — kết quả đầu tiên sẽ hiện ở đây" |
| No daily missions left | "Hôm nay xong nhiệm vụ rồi — Lintopus tự hào" |

## Confirmation modals

| Action | Title | Body | Confirm | Cancel |
|--------|-------|------|---------|--------|
| Delete account | "Xóa tài khoản" | "Hành động không thể hoàn tác. Sau 7 ngày, dữ liệu sẽ bị xóa vĩnh viễn." | "Xóa tài khoản" (after typed XÓA) | "Hủy" |
| Delete chat | "Xóa cuộc trò chuyện" | "Toàn bộ tin nhắn sẽ bị xóa" | "Xóa" | "Hủy" |
| Discard changes | "Bỏ thay đổi?" | "Thay đổi chưa lưu sẽ bị mất" | "Bỏ" | "Tiếp tục chỉnh sửa" |
| Logout | "Đăng xuất?" | "Bạn sẽ cần đăng nhập lại lần sau" | "Đăng xuất" | "Hủy" |
| Cancel battle queue | "Hủy tìm trận?" | "Đối thủ đang tìm bạn..." | "Hủy" | "Tiếp tục đợi" |
| Submit early | "Nộp bài sớm?" | "Bạn còn {N} phút. Chắc chắn nộp luôn?" | "Nộp" | "Tiếp tục làm" |
| Pause exam | "Tạm dừng?" | "Practice mode — tiến độ đã lưu" | "Tạm dừng" | "Tiếp tục" |

KHÔNG "Are you sure?" (English). KHÔNG "Bạn có chắc chắn không?" (over-corporate). Use specific question per action.

## Section headers / labels

### Dashboard

| Label | ✅ VN |
|-------|------|
| Greeting | "Chào {username}" |
| Today's question | "Hôm nay luyện gì nhé?" |
| Quick practice | "QUICK PRACTICE" (codebase verified — small caps OK for label) |
| Battle arena | "BATTLE ARENA" |
| Friends | "FRIENDS" / "Bạn bè" |
| Daily missions | "DAILY MISSIONS" |
| This week | "THIS WEEK" / "Tuần này" |
| Streak counter | "{N} day streak" / "Streak {N} ngày" |
| Total XP | "Total XP · Lv {N}" / "XP · Lv {N}" |

### Practice

| Label | ✅ VN |
|-------|------|
| Practice mode entry | "Chọn chế độ luyện {Skill}" |
| Question prompt | "Bạn muốn thi thật hay luyện từng phần?" |
| Full Test mode | "Thi thật" |
| Practice mode | "Luyện tập" |
| Skill description Speaking | "Luyện Speaking với AI chấm điểm theo tiêu chí IELTS" |
| Skill description Writing | "Viết Task 1 / Task 2 với AI chấm 4 tiêu chí" |
| Skill description Reading | "Practice passages với MCQ, T/F/NG, matching" |
| Skill description Listening | "Audio Cambridge với 4 sections + answer sheet" |

### Result page

| Label | ✅ VN |
|-------|------|
| Band achieved | "{band}" |
| Band journey | "Band journey" / "Hành trình band" |
| Current band | "hiện tại" |
| Target band | "mục tiêu" |
| Sub-skill breakdown | "Phản hồi chi tiết" |
| Recommendations | "Luyện thêm" |
| Compared to last | "so với lần trước" |
| Improved | "Tiến bộ" |
| Declined | "Giảm" |
| Same | "Giữ vững" |

### Battle

| Label | ✅ VN |
|-------|------|
| Battle tab | "Battle" |
| Queue status | "Đang tìm đối thủ..." |
| Match found | "Tìm được rồi!" |
| Your side | "Bạn" |
| Opponent side | "Đối thủ" |
| Score | "điểm" |
| LP change | "+{N} LP" / "-{N} LP" |
| Win streak | "{N}W" |
| Rank | "Rank: {tier} {division}" |
| Battle history | "Lịch sử Battle" |
| Battle gate | "Hoàn thành {N} bài luyện để mở khóa Battle" |

## Days / time

| Label | ✅ VN |
|-------|------|
| Today | "Hôm nay" |
| Yesterday | "Hôm qua" |
| Tomorrow | "Ngày mai" |
| {N} days ago | "{N} ngày trước" |
| {N} hours ago | "{N} giờ trước" |
| {N} minutes ago | "{N} phút trước" |
| Just now | "Vừa xong" |
| Monday | "Thứ 2" / "T2" |
| Tuesday | "Thứ 3" / "T3" |
| Wednesday | "Thứ 4" / "T4" |
| Thursday | "Thứ 5" / "T5" |
| Friday | "Thứ 6" / "T6" |
| Saturday | "Thứ 7" / "T7" |
| Sunday | "Chủ nhật" / "CN" |

## Numbers / units

| Unit | VN |
|------|-----|
| Days | "ngày" |
| Hours | "giờ" |
| Minutes | "phút" |
| Seconds | "giây" |
| Words | "từ" |
| Questions | "câu" |
| Points | "điểm" / "pts" |
| Level | "Lv {N}" |
| XP | "XP" (untranslated — gaming convention) |
| Band score | "Band {N.N}" |

## IELTS-authentic mode microcopy (English)

When mode swaps to authentic, microcopy switches:

| Brand mode | IELTS-authentic |
|-----------|-----------------|
| "Nộp bài" | "Submit" |
| "Bỏ qua" | "Skip" |
| "Đánh dấu" | "Flag" |
| "Lưu" | "Bookmark" |
| "Câu hỏi {N}" | "Question {N}" |
| "Phần {N}" | "Section {N}" |
| "Số từ" | "Words" |
| "Thời gian còn" | "Time remaining" |

See `04-modes/ielts-authentic.md` for full English UI vocab.

## Audit checklist microcopy

```
1. Vietnamese-first across all brand-mode surfaces? ✓
2. Pronoun mình/bạn (NOT anh/chị/em/quý)? ✓
3. NO "vui lòng" / "xin" corporate particles? ✓
4. NO English bleed (except VICTORY/DEFEAT Battle drama)? ✓
5. Specific verb (luyện thêm, nộp bài) NOT modal (nên cố gắng)? ✓
6. Toast format: "Đã {action}" past-tense not "Successfully {action}"? ✓
7. Loading: "Đang {action}..." present-continuous + 3 dots? ✓
8. Error factual + recovery (NOT drama / blame)? ✓
9. Empty state encouraging next action (NOT apologetic)? ✓
10. Confirm modal specific question (NOT "Are you sure?")? ✓
11. Mode-aware: ielts-authentic uses English UI? ✓
12. Library searched first BEFORE inventing random copy? ✓
```

## See also

- `05-voice/persona.md` — bạn cùng lớp register
- `05-voice/tone-rhythm.md` — em-dash + sentence rhythm
- `05-voice/lintopus-bubble-text.md` — Lintopus 1-line library
- `05-voice/battle-drama.md` — VICTORY/DEFEAT exception
- `05-voice/never-say-list.md` — banned phrases hard-list
- `04-modes/ielts-authentic.md` — English UI swap
