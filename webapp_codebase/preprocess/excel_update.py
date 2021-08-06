import os, sys

BASE_URL = 'https://cbc.case.edu/covidbrowser2/'
START_LINE = 1
COLUMN_IDXS = dict()

class IncompatibleArgumentsException(Exception):
    pass

def rebuild(splitted_lines):
    str = ''
    for seq in splitted_lines:
        str += (seq + '\t')
    return str.strip()

def new_file(file):
    return file + '.new'

if __name__ == '__main__':
    excel_argidx = 1
    prop_argidx = 2
    sample_numidx = 3
    if len(sys.argv) != 4:
        raise IncompatibleArgumentsException('invalid number of arguments given. invoking format: <excel file> <properties file> <number of samples>')
    f = open(sys.argv[excel_argidx], 'r')
    fp = open(sys.argv[prop_argidx], 'r')
    # get updating fields
    row_idx = 0
    fields = dict()
    for line in fp:
        if (row_idx % 2) == 0:
            col = line.split()
            col = col[1]
        else:
            val = line.rstrip()
            # add to mapping
            fields[col] = val
        row_idx += 1
    print(fields)
    f1 = open(new_file(sys.argv[excel_argidx]), 'w+')
    counts = 0
    for index, line in enumerate(f):
        if index == START_LINE - 1:
            # first line are columns, map to dictionary
            cols = line.split('\t')
            for index, name in enumerate(cols):
                clean_name = name.rstrip()
                COLUMN_IDXS[clean_name] = index
            f1.write(line.rstrip() + '\n')
        else:
            splitted_line = line.split('\t')
            if (splitted_line[COLUMN_IDXS['division_exposure']] == 'Ohio') and (counts < int(sys.argv[sample_numidx])):
                for key, value in fields.items():
                    if value != '~':
                        splitted_line[COLUMN_IDXS[key]] = value
                    else:
                        if (splitted_line[COLUMN_IDXS[key]] is None) or (splitted_line[COLUMN_IDXS[key]] == '') or (splitted_line[COLUMN_IDXS[key]] == ' '):
                            # handles URL
                            strain = splitted_line[COLUMN_IDXS['strain']]
                            strain = strain.replace('/', '_')
                            query_param = '?name=' + strain
                            splitted_line[COLUMN_IDXS[key]] = value
                counts += 1
            # reform split
            f1.write(rebuild(splitted_line) + '\n')
    f.close()
    fp.close()    
    f1.close()
    # equivalent of cli rename procedure.
    os.remove(sys.argv[excel_argidx])
    os.rename(new_file(sys.argv[excel_argidx]), sys.argv[excel_argidx])
