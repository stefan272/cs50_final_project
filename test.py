import re

d = {'name': "the little b           on 02 jun cpm   ", 'value': 10}
s = "apple.com/bill    \t    ireland  on 08 jul bcc"
r = "WWW.ASOS.COM               ON 02 OCT CPM"

# new_1 = re.sub(' \w{2} \d{2} \w{3}', '', d["name"])
new_2 = re.sub('\s+', ' ', s)
new_3 = s.strip()
print(new_2)