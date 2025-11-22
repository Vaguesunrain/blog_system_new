import json
import os
from . import dabopration
import re
def _read_json(file_path):
    if not os.path.exists(file_path):
        return {}
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {}

def _write_json(file_path, data,check_exists=False):
    #如果存在直接return
    if check_exists and os.path.exists(file_path):
        print(f"文件 {file_path} 已存在，跳过写入。")
        return
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def insert_entry(file_path, key, value):
    """
    :param key: 要插入的键 (e.g., "aaa")。
    :param value: 要插入的值 (e.g., n)。
    """
    data = _read_json(file_path)
    data[key] = value
    _write_json(file_path, data)


def update_recently_queue_by_time(file_path, entry_data, max_size=9):
    """
    更新'recently'队列。以 entry_data 中的 'index' 作为唯一标识。
    - 如果 index 已存在，则移动到队首并更新。
    - 如果 index 是新的，则添加到队首。
    - 队列溢出时移除队尾。
    """
    full_data = _read_json(file_path)
    if 'recently' not in full_data: full_data['recently'] = {}

    recently_data = full_data['recently']
    entry_index = entry_data.get("index")
    if entry_index is None:
        print("错误: 传入的数据必须包含 'index'。")
        return

    # 确保所有列表都存在
    expected_keys = ["index", "user", "date", "title", "content", "image_urls"]
    for key in expected_keys:
        if key not in recently_data:
            recently_data[key] = []

    # 检查 index 是否已存在
    existing_pos = -1
    try:
        existing_pos = recently_data['index'].index(entry_index)
    except ValueError:
        # .index() 找不到时会抛出 ValueError，说明是新条目
        pass

    # 根据是否存在来决定操作
    if existing_pos != -1:
        print(f"检测到已存在条目 (index: {entry_index})。正在移动到队首并更新...")
        for key in recently_data.keys():
            if len(recently_data[key]) > existing_pos:
                recently_data[key].pop(existing_pos)
    else:
        print(f"新条目 (index: {entry_index})。正在添加到队首...")

    for key in expected_keys:
        new_value = entry_data.get(key, f"[缺少 {key}]")
        recently_data[key].insert(0, new_value)


    if len(recently_data['index']) > max_size:
        print(f"队列已满，从队尾移除一个条目。")
        for key in recently_data.keys():
            recently_data[key].pop()

    _write_json(file_path, full_data)
    print(f"成功: 'recently' 队列已更新。")




def increment_and_update_stats(data_file, stats_file, key_to_increment):
    """
    :param data_file: 完整数据文件的路径 (e.g., "viewTimes.json")。
    :param stats_file: 统计排序文件的路径 (e.g., "statistic.json")。
    :param key_to_increment: 要加1的键。
    """
    # 1. 更新主数据文件
    data = _read_json(data_file)
    if key_to_increment not in data or not isinstance(data.get(key_to_increment), int):
        print(f"错误: 在 '{data_file}' 中未找到键 '{key_to_increment}' 或其值不是整数。")
        return

    data[key_to_increment] += 1
    new_value = data[key_to_increment]
    _write_json(data_file, data)
    print(f"成功: '{key_to_increment}' 的值已增加到 {new_value}。")

    # 2. 读取统计文件并准备更新
    stats_data = _read_json(stats_file)
    top_entries = stats_data.get("sort", {})
    needs_update = False


    # 场景 A: 总数据量小于6，采用“非竞争”模式
    if len(data) < 6:
        # print(f"数据总数 ({len(data)}) 小于6，直接更新/插入排序列表。")
        top_entries[key_to_increment] = new_value
        needs_update = True

    # 场景 B: 总数据量大于等于6，采用“竞争”模式
    else:
        # 如果 sort 列表为空或不完整，先强制生成一次，确保有比较基准
        if len(top_entries) < 6:
            print("检测到排序列表不完整，正在从主数据文件强制生成...")
            all_data = _read_json(data_file)
            sorted_items = sorted(all_data.items(), key=lambda item: item[1], reverse=True)
            top_entries = dict(sorted_items[:6])
            needs_update = True

        # 获取当前排序列表中的最小值作为“门槛”
        threshold = min(top_entries.values())
        is_in_top_list = key_to_increment in top_entries

        # B-1: 更新的键已在 top 6 列表中，直接更新
        if is_in_top_list:
            print(f"'{key_to_increment}' 已在排序列表中，直接更新其值。")
            top_entries[key_to_increment] = new_value
            needs_update = True

        # B-2: 更新的键不在 top 6 中，但其新值超过了门槛，则替换掉最小的
        elif new_value > threshold:
            print(f"'{key_to_increment}' 的新值 {new_value} 超过门槛 {threshold}，进入排序列表。")
            # 找到值最小的那个键 (可能不止一个，找到任意一个即可)
            key_to_remove = min(top_entries, key=top_entries.get)
            print(f"移除原列表中的最小值条目: '{key_to_remove}': {top_entries[key_to_remove]}")
            del top_entries[key_to_remove]
            # 添加新条目
            top_entries[key_to_increment] = new_value
            needs_update = True

        # B-3: 更新的值没有达到门槛，不做任何操作
        else:
            print(f"'{key_to_increment}' 的新值 {new_value} 未达到排序列表的门槛 {threshold}，无需更新统计文件。")
            return

    # 3. 如果需要更新，则重新排序并写回文件
    if needs_update:
        # 对更新后的字典按值进行降序排序
        sorted_items = sorted(top_entries.items(), key=lambda item: item[1], reverse=True)
        # 确保最多只保留6个元素 (在从 <6 过渡到 6 的情况下)
        stats_data['sort'] = dict(sorted_items[:6])

        _write_json(stats_file, stats_data)
        # print(f"统计文件 '{stats_file}' 已更新。")

        # 调用后续的同步函数
        UpdateStatistic(stats_file)


def UpdateStatistic(stats_file):
    """
    检测 stats_file 中 'sort' 和 'hottest' 的数据是否对应。
    如果不对应，则从用户文章文件中读取信息并更新 'hottest'。
    :param stats_file: 统计文件（JSON格式）的路径。

    """
    DEFAULT_IMAGE_URL = "http://vagueame.top/sources/nebula.avif"


    stats_data = _read_json(stats_file)

    hottest_data = stats_data.get("hottest", {})
    sort_data = stats_data.get("sort", {})

    hottest_lookup_map = {}
    users = hottest_data.get("user", [])
    indices = hottest_data.get("index", [])
    for i in range(len(users)):
        key = (users[i], indices[i])
        hottest_lookup_map[key] = i  # 值为列表索引

    made_changes = False

    for key, sort_value in sort_data.items():
        match = re.match(r"([a-zA-Z_]+)(\d+)", key)
        if not match:
            print(f"警告: 无法解析 sort key '{key}'，已跳过。")
            continue

        user = match.group(1)
        index = int(match.group(2))

        article_key = (user, index)

        # --- 核心改动：修改判断逻辑 ---
        if article_key in hottest_lookup_map:
            # 情况1: 文章已存在于 'hottest' 中，检查 views 是否需要更新
            list_index = hottest_lookup_map[article_key]
            current_views = hottest_data["views"][list_index]

            if current_views != sort_value:
                print(f"更新 views: 文章({user}, {index}) 的 views 从 {current_views} 更新为 {sort_value}。")
                hottest_data["views"][list_index] = sort_value
                made_changes = True

        else:
            # 情况2: 文章不存在于 'hottest' 中，执行添加逻辑
            print(f"发现新文章: ({user}, {index}) 不在 hottest 中，正在添加...")

            user_article_file = dabopration.USER_file / user / 'article.json'
            if not user_article_file.exists():
                print(f"警告: 找不到用户 '{user}' 的文章文件: {user_article_file}。跳过添加。")
                continue

            try:
                with open(user_article_file, 'r', encoding='utf-8') as f:
                    user_articles_list = json.load(f)

                article_to_add = next((article for article in user_articles_list if article.get("index") == str(index)), None)

                if not article_to_add:
                    print(f"警告: 在文件 {user_article_file} 中找不到 index 为 {index} 的文章。跳过添加。")
                    continue

                date = article_to_add.get("date", "未知日期")
                title = article_to_add.get("filename", "无标题")
                content = ""
                image_urls = article_to_add.get("image_urls", [])

                final_image_url = image_urls[0] if image_urls else DEFAULT_IMAGE_URL

                hottest_data["user"].append(user)
                hottest_data["index"].append(index)
                hottest_data["date"].append(date)
                hottest_data["title"].append(title)
                hottest_data["content"].append(content)
                hottest_data["image_urls"].append(final_image_url)
                if "views" in hottest_data:
                     hottest_data["views"].append(sort_value)

                made_changes = True
                # print(f"成功添加文章 ({user}, {index})，views 设置为 {sort_value}。")

            except (json.JSONDecodeError, KeyError, IndexError, TypeError) as e:
                print(f"错误: 处理文件 {user_article_file} 时出错: {e}。跳过添加。")

    if made_changes:
        # print("数据已更新，正在写回文件...")
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(stats_data, f, indent=4, ensure_ascii=False)
        # print("文件更新完毕。")
    else:
        print("数据已是最新，无需更新。")
