import re

d = {'name': "the little b           on 02 jun cpm   ", 'value': 10}
s = "apple.com/bill        ireland  on 08 jul bcc"
r = "WWW.ASOS.COM               ON 02 OCT CPM"

new_s = re.sub(' \w{2} \d{2} \w{3}', '', d["name"])
print(new_s)