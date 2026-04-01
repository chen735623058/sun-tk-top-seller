from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)

# 关键词库文件路径
KEYWORDS_FILE = 'keywords.json'

# 加载关键词库
def load_keywords():
    if os.path.exists(KEYWORDS_FILE):
        with open(KEYWORDS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    else:
        # 初始关键词库 - 2026美区最新200个热门关键词
        initial_keywords = {
            "cat": [
                "cat litter", "clumping cat litter", "unscented cat litter", "scented cat litter", 
                "dust free cat litter", "low dust cat litter", "lightweight cat litter", "crystal cat litter",
                "tofu cat litter", "bentonite cat litter", "wood pellet cat litter", "self cleaning litter box",
                "automatic cat litter box", "smart cat litter box", "enclosed cat litter box", "top entry litter box",
                "open litter box", "disposable litter box", "cat litter mat", "cat litter scoop",
                "litter box liner", "cat scratching post", "cardboard cat scratcher", "cat scratching board",
                "corrugated cat scratcher", "sisal cat scratcher", "cat tree", "cat tower", "cat condo",
                "cat window perch", "cat bed", "heated cat bed", "outdoor cat house", "heated outdoor cat house",
                "enclosed cat bed", "cave cat bed", "cat water fountain", "automatic cat water fountain",
                "filtered cat fountain", "automatic cat feeder", "wifi cat feeder", "app controlled cat feeder",
                "timed cat feeder", "ceramic cat bowl", "stainless steel cat bowl", "elevated cat bowl",
                "slow feeder cat bowl", "pet food storage container", "airtight pet food container",
                "cat toys", "interactive cat toys", "feather wand cat toy", "laser pointer cat toy",
                "catnip toys", "silvervine toys", "crinkle cat toys", "catnip", "silvervine",
                "cat treats", "freeze dried cat treats", "dental cat treats", "soft cat treats",
                "crunchy cat treats", "kitten food", "adult cat food", "senior cat food",
                "grain free cat food", "gluten free cat food", "dry cat food", "wet cat food",
                "canned cat food", "pouch cat food", "raw cat food", "freeze dried cat food",
                "hairball remedy", "hairball control", "cat brush", "deshedding tool for cats",
                "slicker brush cat", "cat comb", "furminator for cats", "cat nail clippers",
                "cat nail grinder", "cat flea treatment", "topical flea prevention", "oral flea treatment",
                "cat flea collar", "cat odor eliminator", "pet urine enzyme cleaner", "cat litter deodorizer",
                "cat wipes", "grooming wipes for cats", "antibacterial cat wipes", "disposable cat pads",
                "puppy pads for cats", "cat carrier", "soft sided cat carrier", "hard shell cat carrier",
                "cat backpack carrier", "airline approved cat carrier"
            ],
            "dog": [
                "dog leash", "retractable dog leash", "heavy duty dog leash", "hands free dog leash",
                "dog harness", "no pull dog harness", "front clip harness", "back clip harness",
                "step in harness", "service dog harness", "dog collar", "personalized dog collar",
                "leather dog collar", "nylon dog collar", "martingale collar", "reflective dog collar",
                "LED dog collar", "dog crate", "metal dog crate", "plastic dog crate", "foldable dog crate",
                "soft sided dog crate", "dog bed", "orthopedic dog bed", "waterproof dog bed",
                "memory foam dog bed", "elevated dog bed", "cooling dog bed", "heated dog bed",
                "washable dog bed", "dog kennel", "outdoor dog kennel", "dog playpen", "indoor dog playpen",
                "puppy playpen", "dog potty", "grass pad dog potty", "artificial grass potty",
                "indoor dog potty", "dog bowl", "stainless steel dog bowl", "ceramic dog bowl",
                "slow feeder dog bowl", "elevated dog bowl", "no spill dog bowl", "automatic dog feeder",
                "wifi dog feeder", "app controlled feeder", "timed dog feeder", "dog water fountain",
                "automatic water fountain", "filtered dog fountain", "dog food container", "airtight dog food storage",
                "dog food", "dry dog food", "wet dog food", "grain free dog food", "puppy food",
                "adult dog food", "senior dog food", "large breed dog food", "small breed dog food",
                "raw dog food", "freeze dried dog food", "limited ingredient dog food", "dog treats",
                "peanut butter dog treats", "sweet potato dog treats", "chicken jerky dog treats",
                "dog biscuits", "dental chews for dogs", "rawhide chews", "bully sticks",
                "yak cheese dog chews", "frozen dog treats", "dog toys", "interactive dog toys",
                "chew toys for dogs", "rubber chew toys", "squeaky dog toys", "plush dog toys",
                "frisbee for dogs", "flying disc", "dog toys for aggressive chewers", "indestructible dog toys",
                "dog bones", "stuffed bones", "marrow bones", "dog grooming brush", "shedding brush for dogs",
                "slicker brush dog", "undercoat rake", "furminator for dogs", "deshedding tool",
                "dog nail clippers", "dog nail grinder", "dog shampoo", "oatmeal dog shampoo", "hypoallergenic dog shampoo"
            ],
            "cleaning": [
                "deodorizing shampoo", "medicated dog shampoo", "dog conditioner", "dry shampoo for dogs",
                "dog paw cleaner", "dog toothbrush", "dog toothpaste", "finger toothbrush", "dog dental chew",
                "dog breath freshener", "dog hair dryer", "pet grooming clipper", "dog clippers for grooming",
                "cordless dog clippers", "dog lint roller", "pet hair remover", "pet hair roller",
                "flea and tick prevention for dogs", "flea and tick collar", "flea spray for home",
                "tick remover tool", "pet laundry detergent", "pet safe disinfectant", "pet odor eliminator spray",
                "stain and odor remover", "enzymatic cleaner for dog urine", "pet grooming wipes",
                "dog paw wipes", "antibacterial dog wipes"
            ],
            "travel_home": [
                "dog door", "electronic dog door", "automatic dog door", "baby gate for pets", "pet gate",
                "pressure mounted pet gate", "retractable pet gate", "dog car seat cover", "dog cargo liner",
                "dog car seat", "dog seat belt", "dog ramp for bed", "dog stairs for high beds",
                "pet travel crate", "airline approved dog crate", "pet stroller", "dog stroller",
                "cat stroller", "dog carrier", "soft sided dog carrier", "hard shell dog carrier",
                "dog sling carrier"
            ],
            "nutrition": [
                "freeze-dried pet treats", "raw freeze-dried dog food", "salmon treats for dogs",
                "bone broth for dogs", "fish oil omega 3 for dogs", "glucosamine chondroitin for dogs",
                "probiotics for dogs", "dog multivitamin", "puppy milk replacer", "calming treats for dogs",
                "dog anxiety relief", "cbd treats for dogs", "hemp calming treats", "joint supplements for dogs",
                "skin and coat supplements", "digestive supplements"
            ],
            "smart": [
                "pet camera with treat dispenser", "dog camera", "cat camera", "night vision pet camera",
                "wifi pet camera", "gps dog tracker", "dog activity monitor", "cat gps tracker",
                "automatic laser toy", "interactive cat laser"
            ],
            "other": [
                "hamster cage", "hamster bedding", "hamster food", "rabbit cage", "rabbit hay",
                "guinea pig cage", "guinea pig bedding", "guinea pig food", "parrot cage", "bird cage",
                "bird food", "parrot toys", "aquarium fish tank", "reptile tank", "reptile habitat",
                "terrarium", "turtle tank", "turtle food"
            ],
            "marketing": [
                "premium", "durable", "easy to clean", "non toxic", "high quality", "new 2026",
                "hot sale", "popular", "best seller", "for small dogs", "for large dogs",
                "for indoor cats", "for multiple cats", "beginner friendly", "pet owner must have"
            ]
        }
        # 统计数量
        total = 0
        for k, v in initial_keywords.items():
            total += len(v)
        print(f"Initial keywords loaded: {total} words")
        
        with open(KEYWORDS_FILE, 'w', encoding='utf-8') as f:
            json.dump(initial_keywords, f, ensure_ascii=False, indent=2)
        return initial_keywords

keywords_db = load_keywords()

@app.route('/')
def index():
    return render_template('index.html', keywords=keywords_db)

@app.route('/api/keywords', methods=['GET'])
def get_keywords():
    return jsonify(keywords_db)

@app.route('/api/add_keyword', methods=['POST'])
def add_keyword():
    data = request.json
    category = data.get('category')
    keyword = data.get('keyword')
    
    if category not in keywords_db:
        keywords_db[category] = []
    
    if keyword not in keywords_db[category]:
        keywords_db[category].append(keyword)
        # 保存到文件
        with open(KEYWORDS_FILE, 'w', encoding='utf-8') as f:
            json.dump(keywords_db, f, ensure_ascii=False, indent=2)
        return jsonify({"success": True, "message": "Keyword added"})
    else:
        return jsonify({"success": False, "message": "Keyword already exists"})

@app.route('/api/generate_titles', methods=['POST'])
def generate_titles():
    """
    生成标题，这里调用AI，我们直接用关键词匹配组合逻辑
    用户输入商品描述，匹配相关关键词，生成多个标题
    """
    data = request.json
    product = data.get('product', '').lower()
    description = data.get('description', '').lower()
    
    # 收集匹配的关键词
    matched = []
    
    # 遍历所有分类找匹配
    for category, keywords in keywords_db.items():
        for kw in keywords:
            kw_lower = kw.lower()
            if kw_lower in product or kw_lower in description or any(word in kw_lower for word in product.split()):
                if kw not in matched:
                    matched.append(kw)
    
    # 加上营销词
    marketing = keywords_db.get('marketing', [])
    
    # 生成5个不同标题
    titles = generate_multiple_titles(product, matched, marketing)
    
    return jsonify({
        "success": True,
        "matched_keywords": matched,
        "titles": titles
    })

def generate_multiple_titles(product, matched_keywords, marketing_words):
    """
    生成不同风格的标题
    1. 基础款 - 核心关键词前置
    2. 长尾精准款1
    3. 长尾精准款2
    4. 营销吸引款1
    5. 营销吸引款2
    """
    import random
    
    titles = []
    
    # 核心产品词大写开头
    product_clean = product.title()
    
    # 1. 基础款
    core = [kw for kw in matched_keywords[:5] if kw.lower() != product.lower()]
    if product_clean not in core:
        core.insert(0, product_clean)
    else:
        core = [product_clean] + core
    title1 = " - ".join(core[:6])
    titles.append({
        "type": "基础标准款",
        "title": title1,
        "length": len(title1)
    })
    
    # 2. 长尾精准款1
    if len(matched_keywords) > 5:
        sample1 = random.sample(matched_keywords, min(8, len(matched_keywords)))
        # 确保产品词在前面
        if product_clean.lower() not in [kw.lower() for kw in sample1]:
            sample1.insert(0, product_clean)
        else:
            # 移到前面
            sample1 = [product_clean] + [kw for kw in sample1 if kw.lower() != product_clean.lower()]
        title2 = ", ".join(sample1[:7])
        titles.append({
            "type": "长尾精准款",
            "title": title2,
            "length": len(title2)
        })
    
    # 3. 长尾精准款2
    if len(matched_keywords) > 8:
        sample2 = random.sample(matched_keywords, min(10, len(matched_keywords)))
        if product_clean.lower() not in [kw.lower() for kw in sample2]:
            sample2.insert(0, product_clean)
        else:
            sample2 = [product_clean] + [kw for kw in sample2 if kw.lower() != product_clean.lower()]
        # 加一个营销词
        if marketing_words:
            mark = random.choice(marketing_words)
            sample2.append(mark)
        title3 = " | ".join(sample2[:8])
        titles.append({
            "type": "长尾精准款",
            "title": title3,
            "length": len(title3)
        })
    
    # 4. 营销吸引款1
    marketing_sample = random.sample(marketing_words, min(2, len(marketing_words)))
    marketing_text = " ".join([m.title() for m in marketing_sample])
    if len(matched_keywords) >= 3:
        mark_product = f"{marketing_text} {product_clean}"
        matched_marketing = [kw for kw in matched_keywords if kw.lower() != product.lower()][:5]
        title4 = f"{mark_product} - {' - '.join(matched_marketing[:5])}"
        titles.append({
            "type": "营销吸引款",
            "title": title4,
            "length": len(title4)
        })
    
    # 5. 营销吸引款2
    if len(matched_keywords) > 5:
        all_words = [product_clean] + matched_keywords[:6]
        if marketing_words:
            all_words.append(random.choice(marketing_words))
        title5 = " ".join(all_words)
        titles.append({
            "type": "营销吸引款",
            "title": title5,
            "length": len(title5)
        })
    
    return titles

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
